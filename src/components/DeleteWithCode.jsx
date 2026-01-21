import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { verifyDeletionCode, isRateLimited, clearRateLimitTracking, formatCodeForDisplay } from '../lib/deletionCode'

function DeleteWithCode({ postId, postType, deletionCodeHash, onDeleteSuccess }) {
  const [showModal, setShowModal] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const tableName = postType === 'shelter' ? 'shelters' :
                    postType === 'request' ? 'shelter_requests' :
                    'aid_posts'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      // Validate code format (6 digits)
      if (!/^\d{6}$/.test(code)) {
        setError('الكود يجب أن يكون 6 أرقام')
        setSubmitting(false)
        return
      }

      // Check rate limiting
      if (isRateLimited(postId)) {
        setError('تم تجاوز عدد المحاولات. يرجى المحاولة بعد دقيقة.')
        setSubmitting(false)
        return
      }

      // Verify code
      if (!verifyDeletionCode(code, deletionCodeHash)) {
        setError('❌ الكود غير صحيح. يرجى المحاولة مرة أخرى.')
        setSubmitting(false)
        return
      }

      // Code is correct, delete the post
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', postId)

      if (deleteError) throw deleteError

      // Clear rate limiting and notify success
      clearRateLimitTracking(postId)
      alert('✅ تم حذف المنشور بنجاح!')
      setShowModal(false)

      if (onDeleteSuccess) {
        onDeleteSuccess()
      }
    } catch (error) {
      console.error('Error deleting with code:', error)
      setError('حدث خطأ في الحذف. يرجى المحاولة مرة أخرى.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        className="btn"
        onClick={() => setShowModal(true)}
        style={{
          background: '#ffc107',
          color: '#000',
          padding: '8px 16px',
          fontSize: '14px',
          marginTop: '8px'
        }}
      >
        🔑 حذف بالكود
      </button>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ marginBottom: '16px', fontSize: '20px', color: '#333' }}>
              🔑 حذف المنشور بالكود
            </h3>

            <p style={{ marginBottom: '16px', color: '#666', lineHeight: '1.6' }}>
              أدخل الكود المكون من 6 أرقام الذي حصلت عليه عند إنشاء المنشور:
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="6"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, ''))
                  setError('')
                }}
                placeholder="أدخل الكود (6 أرقام)"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '24px',
                  textAlign: 'center',
                  letterSpacing: '8px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  fontFamily: 'monospace'
                }}
                autoFocus
              />

              {error && (
                <div style={{
                  background: '#fee',
                  color: '#c00',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  className="btn btn-danger"
                  disabled={submitting || code.length !== 6}
                  style={{ flex: 1 }}
                >
                  {submitting ? 'جاري الحذف...' : 'حذف المنشور'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowModal(false)
                    setCode('')
                    setError('')
                  }}
                  style={{ flex: 1, background: '#6c757d' }}
                >
                  إلغاء
                </button>
              </div>
            </form>

            <p style={{ marginTop: '16px', fontSize: '13px', color: '#999', lineHeight: '1.5' }}>
              💡 الكود ظهر لك مباشرة بعد إنشاء المنشور. إذا لم تحتفظ به، لا يمكن حذف المنشور إلا من نفس الجهاز خلال 5 دقائق.
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default DeleteWithCode

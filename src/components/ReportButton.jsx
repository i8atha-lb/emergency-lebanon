import { useState, useEffect } from 'react'
import { supabase, getDeviceId } from '../lib/supabase'
import { checkRateLimit } from '../lib/edgeFunctions'

function ReportButton({ postType, postId, currentFlags = 0, onReportSuccess }) {
  const [showModal, setShowModal] = useState(false)
  const [reason, setReason] = useState('spam')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [hasReported, setHasReported] = useState(false)
  const [checking, setChecking] = useState(true)

  // Check on mount if this device already reported this post
  useEffect(() => {
    checkIfReported()
  }, [postId, postType])

  const checkIfReported = async () => {
    try {
      const deviceId = getDeviceId()
      const { data } = await supabase
        .from('reports')
        .select('id')
        .eq('reporter_device_id', deviceId)
        .eq('reported_post_type', postType)
        .eq('reported_post_id', postId)
        .single()

      setHasReported(!!data)
    } catch (error) {
      // No report found is fine
      setHasReported(false)
    } finally {
      setChecking(false)
    }
  }

  const reasons = [
    { value: 'spam', label: 'منشور مزعج أو متكرر' },
    { value: 'fake', label: 'معلومات كاذبة أو مضللة' },
    { value: 'scam', label: 'احتيال أو نصب' },
    { value: 'inappropriate', label: 'محتوى غير لائق' },
    { value: 'other', label: 'سبب آخر' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const deviceId = getDeviceId()

      // Check rate limit for reports
      const rateLimitCheck = await checkRateLimit('report', deviceId)
      if (!rateLimitCheck.allowed) {
        alert(rateLimitCheck.error || 'تم تجاوز الحد المسموح من البلاغات')
        setSubmitting(false)
        return
      }

      // Check if user already reported this post
      const { data: existingReport } = await supabase
        .from('reports')
        .select('id')
        .eq('reporter_device_id', deviceId)
        .eq('reported_post_type', postType)
        .eq('reported_post_id', postId)
        .single()

      if (existingReport) {
        alert('لقد قمت بالإبلاغ عن هذا المنشور مسبقاً')
        setShowModal(false)
        return
      }

      // Submit report
      const { error } = await supabase
        .from('reports')
        .insert([{
          reporter_device_id: deviceId,
          reported_post_type: postType,
          reported_post_id: postId,
          reason: reason,
          details: details || null
        }])

      if (error) throw error

      alert('شكراً لك! تم إرسال البلاغ. المنشور سيحذف تلقائياً إذا تم الإبلاغ عنه 3 مرات.')
      setShowModal(false)
      setDetails('')
      setHasReported(true)  // Mark as reported
      if (onReportSuccess) onReportSuccess()
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('حدث خطأ في إرسال البلاغ، يرجى المحاولة مرة أخرى')
    } finally {
      setSubmitting(false)
    }
  }

  if (checking) {
    return null  // Hide button while checking
  }

  return (
    <>
      <button
        onClick={() => hasReported ? alert('لقد قمت بالإبلاغ عن هذا المنشور مسبقاً') : setShowModal(true)}
        disabled={hasReported}
        style={{
          background: 'transparent',
          border: 'none',
          color: hasReported ? '#ccc' : (currentFlags >= 3 ? '#ff6b6b' : '#666'),
          cursor: hasReported ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          opacity: hasReported ? 0.5 : 1
        }}
        title={hasReported ? 'لقد قمت بالإبلاغ عن هذا المنشور' : 'الإبلاغ عن هذا المنشور'}
      >
        {hasReported ? '✓' : '🚩'} {currentFlags > 0 && <span style={{ fontSize: '12px' }}>({currentFlags})</span>}
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
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '16px', color: '#c41e3a' }}>
              🚩 الإبلاغ عن منشور
            </h3>

            <p style={{ marginBottom: '16px', color: '#666', lineHeight: '1.6' }}>
              إذا كنت تعتقد أن هذا المنشور يحتوي على معلومات كاذبة أو مضللة، يرجى إبلاغنا.
              سيتم مراجعة البلاغ من قبل الإدارة.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  سبب البلاغ:
                </label>
                {reasons.map(r => (
                  <label key={r.value} style={{
                    display: 'block',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '6px',
                    background: reason === r.value ? '#f0f0f0' : 'transparent'
                  }}>
                    <input
                      type="radio"
                      name="reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={(e) => setReason(e.target.value)}
                      style={{ marginLeft: '8px' }}
                    />
                    {r.label}
                  </label>
                ))}
              </div>

              <textarea
                className="textarea"
                placeholder="تفاصيل إضافية (اختياري)"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                style={{ minHeight: '80px' }}
              />

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  type="submit"
                  className="btn btn-danger"
                  disabled={submitting}
                  style={{ flex: 1 }}
                >
                  {submitting ? 'جاري الإرسال...' : 'إرسال البلاغ'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  style={{ flex: 1, background: '#6c757d', color: 'white' }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default ReportButton

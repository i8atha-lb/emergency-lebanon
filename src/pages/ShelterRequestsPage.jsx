import { useState, useEffect } from 'react'
import { supabase, getDeviceId, canEditPost } from '../lib/supabase'
import { checkRateLimit } from '../lib/edgeFunctions'
import { checkFormContent, isValidLebanesePhone } from '../lib/contentModeration'
import ShelterRequestCard from '../components/ShelterRequestCard'
import ShelterRequestForm from '../components/ShelterRequestForm'

function ShelterRequestsPage({ isAdmin }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchArea, setSearchArea] = useState('')

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('shelter_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error('Error loading shelter requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData) => {
    try {
      // Content moderation check
      const contentCheck = checkFormContent(formData)
      if (contentCheck.isBlocked) {
        alert(`❌ ${contentCheck.reason}`)
        return
      }

      // Validate Lebanese phone number
      if (formData.contact_phone && !isValidLebanesePhone(formData.contact_phone)) {
        alert('رقم الهاتف غير صحيح. يرجى إدخال رقم لبناني صحيح (مثال: 03123456 أو +96170123456)')
        return
      }

      // Check rate limit before inserting
      const deviceId = getDeviceId()
      const rateLimitCheck = await checkRateLimit('post_request', deviceId)

      if (!rateLimitCheck.allowed) {
        alert(rateLimitCheck.error || 'تم تجاوز الحد المسموح من الطلبات')
        return
      }

      const { error } = await supabase
        .from('shelter_requests')
        .insert([{
          ...formData,
          device_id: deviceId
        }])

      if (error) throw error

      alert('تم إضافة الطلب بنجاح! نأمل أن تجد مأوى قريباً.')
      setShowForm(false)
      loadRequests()
    } catch (error) {
      console.error('Error adding shelter request:', error)
      alert('حدث خطأ، يرجى المحاولة مرة أخرى')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return

    try {
      const { error } = await supabase
        .from('shelter_requests')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadRequests()
    } catch (error) {
      console.error('Error deleting shelter request:', error)
      alert('حدث خطأ في الحذف')
    }
  }

  const filteredRequests = requests.filter(request =>
    searchArea === '' || request.location_current.toLowerCase().includes(searchArea.toLowerCase())
  )

  if (loading) {
    return <div className="loading">جاري التحميل...</div>
  }

  return (
    <div className="container">
      <div style={{
        background: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <h3 style={{ color: '#856404', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🆘</span> محتاج مأوى؟
        </h3>
        <p style={{ color: '#856404', lineHeight: '1.6' }}>
          إذا كنت أنت أو عائلتك بحاجة إلى مأوى، يمكنك نشر طلبك هنا.
          سيرى الأشخاص الذين لديهم مآوي متاحة طلبك ويمكنهم التواصل معك.
        </p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-danger"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'إلغاء' : '+ نشر طلب مأوى'}
          </button>

          <input
            type="text"
            placeholder="البحث حسب المنطقة"
            value={searchArea}
            onChange={(e) => setSearchArea(e.target.value)}
            style={{
              flex: 1,
              minWidth: '250px',
              padding: '12px',
              border: '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          />
        </div>

        {showForm && (
          <div className="card" style={{ marginTop: '20px' }}>
            <h3 style={{ marginBottom: '16px' }}>طلب مأوى جديد</h3>
            <ShelterRequestForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
          </div>
        )}
      </div>

      <div style={{ marginBottom: '16px', color: '#666' }}>
        عدد الطلبات: <strong style={{ color: '#c41e3a' }}>{filteredRequests.length}</strong>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ fontSize: '18px', color: '#666' }}>
            {searchArea ? 'لا توجد طلبات في هذه المنطقة' : 'لا توجد طلبات حالياً'}
          </p>
        </div>
      ) : (
        filteredRequests.map(request => (
          <ShelterRequestCard
            key={request.id}
            request={request}
            canEdit={canEditPost(request) || isAdmin}
            onDelete={() => handleDelete(request.id)}
            onReportSuccess={loadRequests}
          />
        ))
      )}
    </div>
  )
}

export default ShelterRequestsPage

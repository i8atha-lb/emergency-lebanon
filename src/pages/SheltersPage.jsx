import { useState, useEffect } from 'react'
import { supabase, getDeviceId, canEditPost } from '../lib/supabase'
import { checkRateLimit } from '../lib/edgeFunctions'
import { checkFormContent, isValidLebanesePhone } from '../lib/contentModeration'
import ShelterCard from '../components/ShelterCard'
import ShelterForm from '../components/ShelterForm'

function SheltersPage({ isAdmin }) {
  const [shelters, setShelters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingShelter, setEditingShelter] = useState(null)
  const [searchArea, setSearchArea] = useState('')

  useEffect(() => {
    loadShelters()
  }, [])

  const loadShelters = async () => {
    try {
      const { data, error } = await supabase
        .from('shelters')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setShelters(data || [])
    } catch (error) {
      console.error('Error loading shelters:', error)
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

      if (editingShelter) {
        // Update existing shelter (no rate limit check for edits)
        const { error } = await supabase
          .from('shelters')
          .update(formData)
          .eq('id', editingShelter.id)

        if (error) throw error
        alert('تم تعديل المأوى بنجاح!')
      } else {
        // Check rate limit before inserting new shelter
        const deviceId = getDeviceId()
        const rateLimitCheck = await checkRateLimit('post_shelter', deviceId)

        if (!rateLimitCheck.allowed) {
          alert(rateLimitCheck.error || 'تم تجاوز الحد المسموح من المنشورات')
          return
        }

        // Insert new shelter
        const { error } = await supabase
          .from('shelters')
          .insert([{
            ...formData,
            device_id: deviceId
          }])

        if (error) throw error
        alert('تم إضافة المأوى بنجاح! شكراً على مساعدتك')
      }

      setShowForm(false)
      setEditingShelter(null)
      loadShelters()
    } catch (error) {
      console.error('Error saving shelter:', error)
      alert('حدث خطأ، يرجى المحاولة مرة أخرى')
    }
  }

  const handleEdit = (shelter) => {
    setEditingShelter(shelter)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المأوى؟')) return

    try {
      const { error } = await supabase
        .from('shelters')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadShelters()
    } catch (error) {
      console.error('Error deleting shelter:', error)
      alert('حدث خطأ في الحذف')
    }
  }

  const filteredShelters = shelters.filter(shelter =>
    searchArea === '' || shelter.location_area.toLowerCase().includes(searchArea.toLowerCase())
  )

  if (loading) {
    return <div className="loading">جاري التحميل...</div>
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowForm(!showForm)
              setEditingShelter(null)
            }}
          >
            {showForm ? 'إلغاء' : '+ إضافة مأوى متاح'}
          </button>

          <input
            type="text"
            placeholder="البحث حسب المنطقة (بيروت، صيدا، صور...)"
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
            <h3 style={{ marginBottom: '16px' }}>
              {editingShelter ? 'تعديل المأوى' : 'إضافة مأوى جديد'}
            </h3>
            <ShelterForm
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false)
                setEditingShelter(null)
              }}
              initialData={editingShelter}
            />
          </div>
        )}
      </div>

      <div style={{ marginBottom: '16px', color: '#666' }}>
        عدد المآوي المتاحة: <strong style={{ color: '#c41e3a' }}>{filteredShelters.length}</strong>
      </div>

      {filteredShelters.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ fontSize: '18px', color: '#666' }}>
            {searchArea ? 'لا توجد مآوي في هذه المنطقة' : 'لا توجد مآوي متاحة حالياً'}
          </p>
        </div>
      ) : (
        filteredShelters.map(shelter => (
          <ShelterCard
            key={shelter.id}
            shelter={shelter}
            canEdit={canEditPost(shelter) || isAdmin}
            onEdit={() => handleEdit(shelter)}
            onDelete={() => handleDelete(shelter.id)}
            onReportSuccess={loadShelters}
          />
        ))
      )}
    </div>
  )
}

export default SheltersPage

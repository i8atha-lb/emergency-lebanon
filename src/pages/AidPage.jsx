import { useState, useEffect } from 'react'
import { supabase, getDeviceId, canEditPost } from '../lib/supabase'
import { checkRateLimit } from '../lib/edgeFunctions'
import { checkFormContent, isValidLebanesePhone } from '../lib/contentModeration'
import { generateDeletionCode, hashDeletionCode } from '../lib/deletionCode'
import DeletionCodeDisplay from '../components/DeletionCodeDisplay'
import AidCard from '../components/AidCard'
import { LEBANESE_LOCATIONS } from '../lib/locations'

function AidPage({ isAdmin }) {
  const [aidPosts, setAidPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [deletionCode, setDeletionCode] = useState(null)
  const [customLocation, setCustomLocation] = useState('')
  const [showCustomLocation, setShowCustomLocation] = useState(false)
  const [formData, setFormData] = useState({
    type: 'needed',
    category: '',
    description: '',
    location: '',
    contact_phone: '',
    contact_name: ''
  })

  const categories = [
    'طعام',
    'ماء',
    'أدوية',
    'ملابس',
    'بطانيات',
    'مستلزمات أطفال',
    'مستلزمات طبية',
    'أخرى'
  ]

  useEffect(() => {
    loadAidPosts()
  }, [])

  const loadAidPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('aid_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAidPosts(data || [])
    } catch (error) {
      console.error('Error loading aid posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.description || !formData.contact_phone) {
      alert('يرجى ملء الوصف ورقم الهاتف')
      return
    }

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
      const rateLimitCheck = await checkRateLimit('post_aid', deviceId)

      if (!rateLimitCheck.allowed) {
        alert(rateLimitCheck.error || 'تم تجاوز الحد المسموح من المنشورات')
        return
      }

      // Generate deletion code
      const code = generateDeletionCode()
      const codeHash = hashDeletionCode(code)

      const { error } = await supabase
        .from('aid_posts')
        .insert([{
          ...formData,
          device_id: deviceId,
          deletion_code_hash: codeHash
        }])

      if (error) throw error

      // Show deletion code to user
      setDeletionCode(code)
      setShowForm(false)
      setFormData({
        type: 'needed',
        category: '',
        description: '',
        location: '',
        contact_phone: '',
        contact_name: ''
      })
      loadAidPosts()
    } catch (error) {
      console.error('Error adding aid post:', error)
      alert('حدث خطأ، يرجى المحاولة مرة أخرى')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنشور؟')) return

    try {
      const { error } = await supabase
        .from('aid_posts')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadAidPosts()
    } catch (error) {
      console.error('Error deleting aid post:', error)
      alert('حدث خطأ في الحذف')
    }
  }

  const filteredPosts = aidPosts.filter(post =>
    filterType === 'all' || post.type === filterType
  )

  if (loading) {
    return <div className="loading">جاري التحميل...</div>
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '24px' }}>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
          style={{ marginBottom: '16px' }}
        >
          {showForm ? 'إلغاء' : '+ إضافة منشور'}
        </button>

        {showForm && (
          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>إضافة منشور جديد</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  نوع المنشور:
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="type"
                      value="needed"
                      checked={formData.type === 'needed'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    />
                    <span>محتاج</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="type"
                      value="available"
                      checked={formData.type === 'available'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    />
                    <span>متوفر</span>
                  </label>
                </div>
              </div>

              <select
                className="input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">اختر الفئة (اختياري)</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <textarea
                className="textarea"
                placeholder="الوصف (مطلوب)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />

              <select
                className="input"
                value={showCustomLocation ? 'custom' : formData.location}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === 'custom') {
                    setShowCustomLocation(true)
                    setFormData({ ...formData, location: '' })
                  } else {
                    setShowCustomLocation(false)
                    setCustomLocation('')
                    setFormData({ ...formData, location: value })
                  }
                }}
                style={{ marginBottom: showCustomLocation ? '8px' : '16px' }}
              >
                <option value="">اختر المنطقة (اختياري)</option>
                {LEBANESE_LOCATIONS.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
                <option value="custom">➕ منطقة أخرى (حدد بنفسك)</option>
              </select>

              {showCustomLocation && (
                <input
                  type="text"
                  className="input"
                  placeholder="اكتب اسم المنطقة"
                  value={customLocation}
                  onChange={(e) => {
                    const value = e.target.value
                    setCustomLocation(value)
                    setFormData({ ...formData, location: value })
                  }}
                />
              )}

              <input
                type="text"
                className="input"
                placeholder="الاسم (اختياري)"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              />

              <input
                type="tel"
                className="input"
                placeholder="رقم الهاتف (مطلوب)"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                required
              />

              <button type="submit" className="btn btn-primary">
                إضافة المنشور
              </button>
            </form>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button
            className={`btn ${filterType === 'all' ? 'btn-primary' : ''}`}
            onClick={() => setFilterType('all')}
            style={filterType !== 'all' ? { background: '#e9ecef', color: '#333' } : {}}
          >
            الكل ({aidPosts.length})
          </button>
          <button
            className={`btn ${filterType === 'needed' ? 'btn-danger' : ''}`}
            onClick={() => setFilterType('needed')}
            style={filterType !== 'needed' ? { background: '#e9ecef', color: '#333' } : {}}
          >
            محتاج ({aidPosts.filter(p => p.type === 'needed').length})
          </button>
          <button
            className={`btn ${filterType === 'available' ? 'btn-secondary' : ''}`}
            onClick={() => setFilterType('available')}
            style={filterType !== 'available' ? { background: '#e9ecef', color: '#333' } : {}}
          >
            متوفر ({aidPosts.filter(p => p.type === 'available').length})
          </button>
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ fontSize: '18px', color: '#666' }}>لا توجد منشورات حالياً</p>
        </div>
      ) : (
        filteredPosts.map(post => (
          <AidCard
            key={post.id}
            post={post}
            canEdit={canEditPost(post) || isAdmin}
            onDelete={() => handleDelete(post.id)}
            onReportSuccess={loadAidPosts}
          />
        ))
      )}

      {deletionCode && (
        <DeletionCodeDisplay
          code={deletionCode}
          onClose={() => {
            setDeletionCode(null)
            loadAidPosts()
          }}
        />
      )}
    </div>
  )
}

export default AidPage

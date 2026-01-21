import { useState } from 'react'
import { LEBANESE_LOCATIONS } from '../lib/locations'

function ShelterRequestForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    location_current: '',
    people_count: 1,
    has_children: false,
    has_elderly: false,
    has_medical_needs: false,
    duration_needed: '',
    contact_phone: '',
    contact_name: '',
    notes: ''
  })
  const [customLocation, setCustomLocation] = useState('')
  const [showCustomLocation, setShowCustomLocation] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleLocationChange = (e) => {
    const value = e.target.value
    if (value === 'custom') {
      setShowCustomLocation(true)
      setFormData({ ...formData, location_current: '' })
    } else {
      setShowCustomLocation(false)
      setCustomLocation('')
      setFormData({ ...formData, location_current: value })
    }
  }

  const handleCustomLocationChange = (e) => {
    const value = e.target.value
    setCustomLocation(value)
    setFormData({ ...formData, location_current: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.location_current || !formData.contact_phone) {
      alert('يرجى ملء الموقع الحالي ورقم الهاتف')
      return
    }

    if (formData.people_count < 1) {
      alert('يرجى إدخال عدد الأشخاص')
      return
    }

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{
        background: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px'
      }}>
        <p style={{ color: '#856404', fontSize: '14px', lineHeight: '1.6' }}>
          ⚠️ <strong>تنبيه:</strong> المنصة لا تتحمل مسؤولية صحة المعلومات المنشورة.
          يرجى التحقق من هوية الأشخاص قبل الذهاب إلى أي مكان.
        </p>
      </div>

      <select
        name="location_current"
        value={showCustomLocation ? 'custom' : formData.location_current}
        onChange={handleLocationChange}
        className="input"
        required
        style={{ marginBottom: showCustomLocation ? '8px' : '16px' }}
      >
        <option value="">اختر موقعك الحالي (مطلوب)</option>
        {LEBANESE_LOCATIONS.map((location) => (
          <option key={location} value={location}>
            {location}
          </option>
        ))}
        <option value="custom">➕ موقع آخر (حدد بنفسك)</option>
      </select>

      {showCustomLocation && (
        <input
          type="text"
          placeholder="اكتب اسم الموقع"
          value={customLocation}
          onChange={handleCustomLocationChange}
          className="input"
          required
        />
      )}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            عدد الأشخاص (مطلوب):
          </label>
          <input
            type="number"
            name="people_count"
            value={formData.people_count}
            onChange={handleChange}
            className="input"
            min="1"
            required
            style={{ marginBottom: 0 }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            المدة المطلوبة (اختياري):
          </label>
          <input
            type="text"
            name="duration_needed"
            placeholder="مثال: يوم، أسبوع، شهر"
            value={formData.duration_needed}
            onChange={handleChange}
            className="input"
            style={{ marginBottom: 0 }}
          />
        </div>
      </div>

      <div style={{
        background: '#f8f9fa',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <p style={{ marginBottom: '12px', fontWeight: 'bold' }}>احتياجات خاصة (اختياري):</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="has_children"
              checked={formData.has_children}
              onChange={handleChange}
            />
            <span>👶 يوجد أطفال</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="has_elderly"
              checked={formData.has_elderly}
              onChange={handleChange}
            />
            <span>👴 يوجد مسنين</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="has_medical_needs"
              checked={formData.has_medical_needs}
              onChange={handleChange}
            />
            <span>🏥 يوجد احتياجات طبية</span>
          </label>
        </div>
      </div>

      <input
        type="text"
        name="contact_name"
        placeholder="الاسم (اختياري)"
        value={formData.contact_name}
        onChange={handleChange}
        className="input"
      />

      <input
        type="tel"
        name="contact_phone"
        placeholder="رقم الهاتف للتواصل (مطلوب)"
        value={formData.contact_phone}
        onChange={handleChange}
        className="input"
        required
      />

      <textarea
        name="notes"
        placeholder="ملاحظات إضافية (اختياري) - مثال: حالة صحية خاصة، احتياجات معينة..."
        value={formData.notes}
        onChange={handleChange}
        className="textarea"
      />

      <div style={{ display: 'flex', gap: '12px' }}>
        <button type="submit" className="btn btn-danger">
          نشر الطلب
        </button>
        <button
          type="button"
          className="btn"
          onClick={onCancel}
          style={{ background: '#6c757d', color: 'white' }}
        >
          إلغاء
        </button>
      </div>
    </form>
  )
}

export default ShelterRequestForm

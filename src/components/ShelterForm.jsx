import { useState, useEffect } from 'react'
import { LEBANESE_LOCATIONS } from '../lib/locations'

function ShelterForm({ onSubmit, onCancel, initialData }) {
  const [formData, setFormData] = useState({
    location_area: '',
    address_details: '',
    capacity: '',
    contact_phone: '',
    contact_name: '',
    duration: '',
    notes: ''
  })
  const [customLocation, setCustomLocation] = useState('')
  const [showCustomLocation, setShowCustomLocation] = useState(false)

  useEffect(() => {
    if (initialData) {
      const locationInList = LEBANESE_LOCATIONS.includes(initialData.location_area || '')
      setFormData({
        location_area: locationInList ? initialData.location_area : '',
        address_details: initialData.address_details || '',
        capacity: initialData.capacity || '',
        contact_phone: initialData.contact_phone || '',
        contact_name: initialData.contact_name || '',
        duration: initialData.duration || '',
        notes: initialData.notes || ''
      })
      if (!locationInList && initialData.location_area) {
        setCustomLocation(initialData.location_area)
        setShowCustomLocation(true)
      }
    }
  }, [initialData])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleLocationChange = (e) => {
    const value = e.target.value
    if (value === 'custom') {
      setShowCustomLocation(true)
      setFormData({ ...formData, location_area: '' })
    } else {
      setShowCustomLocation(false)
      setCustomLocation('')
      setFormData({ ...formData, location_area: value })
    }
  }

  const handleCustomLocationChange = (e) => {
    const value = e.target.value
    setCustomLocation(value)
    setFormData({ ...formData, location_area: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.location_area || !formData.contact_phone) {
      alert('يرجى ملء المنطقة ورقم الهاتف على الأقل')
      return
    }

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <select
        name="location_area"
        value={showCustomLocation ? 'custom' : formData.location_area}
        onChange={handleLocationChange}
        className="input"
        required
        style={{ marginBottom: showCustomLocation ? '8px' : '16px' }}
      >
        <option value="">اختر المنطقة (مطلوب)</option>
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
          placeholder="اكتب اسم المنطقة"
          value={customLocation}
          onChange={handleCustomLocationChange}
          className="input"
          required
        />
      )}

      <input
        type="text"
        name="address_details"
        placeholder="تفاصيل العنوان (اختياري)"
        value={formData.address_details}
        onChange={handleChange}
        className="input"
      />

      <input
        type="number"
        name="capacity"
        placeholder="عدد الأشخاص الذين يمكن استيعابهم (اختياري)"
        value={formData.capacity}
        onChange={handleChange}
        className="input"
        min="1"
      />

      <input
        type="text"
        name="duration"
        placeholder="المدة المتاحة (اختياري) - مثال: أسبوع، شهر، حتى نهاية الأزمة..."
        value={formData.duration}
        onChange={handleChange}
        className="input"
      />

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
        placeholder="ملاحظات إضافية (اختياري) - مثال: يوجد ماء وكهرباء، عدد الغرف، الخ..."
        value={formData.notes}
        onChange={handleChange}
        className="textarea"
      />

      <div style={{ display: 'flex', gap: '12px' }}>
        <button type="submit" className="btn btn-primary">
          {initialData ? 'حفظ التعديلات' : 'إضافة المأوى'}
        </button>
        <button type="button" className="btn" onClick={onCancel} style={{ background: '#6c757d', color: 'white' }}>
          إلغاء
        </button>
      </div>
    </form>
  )
}

export default ShelterForm

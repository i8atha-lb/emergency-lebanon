import { useState, useEffect } from 'react'

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

  useEffect(() => {
    if (initialData) {
      setFormData({
        location_area: initialData.location_area || '',
        address_details: initialData.address_details || '',
        capacity: initialData.capacity || '',
        contact_phone: initialData.contact_phone || '',
        contact_name: initialData.contact_name || '',
        duration: initialData.duration || '',
        notes: initialData.notes || ''
      })
    }
  }, [initialData])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
      <input
        type="text"
        name="location_area"
        placeholder="المنطقة (مطلوب) - مثال: بيروت، الضاحية، صيدا، صور..."
        value={formData.location_area}
        onChange={handleChange}
        className="input"
        required
      />

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

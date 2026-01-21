import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function EmergencyPage({ isAdmin }) {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  // Default emergency contacts if database is empty
  const defaultContacts = [
    { category: 'الدفاع المدني', name_ar: 'الدفاع المدني', phone: '125', area: 'عام', notes: '' },
    { category: 'الصليب الأحمر', name_ar: 'الصليب الأحمر اللبناني', phone: '140', area: 'عام', notes: '' },
    { category: 'قوى الأمن', name_ar: 'قوى الأمن الداخلي', phone: '112', area: 'عام', notes: '' },
    { category: 'الطوارئ الطبية', name_ar: 'الطوارئ الطبية', phone: '140', area: 'عام', notes: '' }
  ]

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .order('category', { ascending: true })

      if (error) throw error

      if (!data || data.length === 0) {
        setContacts(defaultContacts)
      } else {
        setContacts(data)
      }
    } catch (error) {
      console.error('Error loading contacts:', error)
      setContacts(defaultContacts)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (contact) => {
    setEditingId(contact.id)
    setEditForm(contact)
  }

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .update(editForm)
        .eq('id', editingId)

      if (error) throw error

      setEditingId(null)
      loadContacts()
      alert('تم التحديث بنجاح')
    } catch (error) {
      console.error('Error updating contact:', error)
      alert('حدث خطأ في التحديث')
    }
  }

  const handleAdd = async () => {
    const newContact = {
      category: prompt('الفئة (مثل: مستشفى، دفاع مدني، الخ)'),
      name_ar: prompt('الاسم'),
      phone: prompt('رقم الهاتف'),
      area: prompt('المنطقة'),
      notes: prompt('ملاحظات (اختياري)') || ''
    }

    if (!newContact.category || !newContact.name_ar || !newContact.phone) {
      alert('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .insert([newContact])

      if (error) throw error

      loadContacts()
      alert('تم الإضافة بنجاح')
    } catch (error) {
      console.error('Error adding contact:', error)
      alert('حدث خطأ في الإضافة')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الرقم؟')) return

    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', id)

      if (error) throw error

      loadContacts()
    } catch (error) {
      console.error('Error deleting contact:', error)
      alert('حدث خطأ في الحذف')
    }
  }

  if (loading) {
    return <div className="loading">جاري التحميل...</div>
  }

  // Group contacts by category
  const groupedContacts = contacts.reduce((acc, contact) => {
    const category = contact.category || 'عام'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(contact)
    return acc
  }, {})

  return (
    <div className="container">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#c41e3a', marginBottom: '12px' }}>🚨 أرقام الطوارئ</h2>
        <p style={{ color: '#666', lineHeight: '1.6' }}>
          أرقام مهمة للاتصال في حالات الطوارئ
        </p>

        {isAdmin && (
          <button
            className="btn btn-primary"
            onClick={handleAdd}
            style={{ marginTop: '16px' }}
          >
            + إضافة رقم جديد
          </button>
        )}
      </div>

      {Object.entries(groupedContacts).map(([category, categoryContacts]) => (
        <div key={category} style={{ marginBottom: '32px' }}>
          <h3 style={{
            background: '#f8f9fa',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            color: '#333'
          }}>
            {category}
          </h3>

          {categoryContacts.map((contact) => (
            <div key={contact.id || contact.phone} className="card">
              {editingId === contact.id ? (
                <div>
                  <input
                    type="text"
                    className="input"
                    value={editForm.name_ar}
                    onChange={(e) => setEditForm({ ...editForm, name_ar: e.target.value })}
                    placeholder="الاسم"
                  />
                  <input
                    type="text"
                    className="input"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="رقم الهاتف"
                  />
                  <input
                    type="text"
                    className="input"
                    value={editForm.area}
                    onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                    placeholder="المنطقة"
                  />
                  <textarea
                    className="textarea"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="ملاحظات"
                  />
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-primary" onClick={handleSave}>
                      حفظ
                    </button>
                    <button
                      className="btn"
                      onClick={() => setEditingId(null)}
                      style={{ background: '#6c757d', color: 'white' }}
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ marginBottom: '8px', fontSize: '18px' }}>
                      {contact.name_ar}
                    </h4>
                    <a
                      href={`tel:${contact.phone}`}
                      style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#28a745',
                        textDecoration: 'none',
                        display: 'block',
                        marginBottom: '8px'
                      }}
                    >
                      📞 {contact.phone}
                    </a>
                    {contact.area && (
                      <p style={{ color: '#666', marginBottom: '4px' }}>
                        📍 {contact.area}
                      </p>
                    )}
                    {contact.notes && (
                      <p style={{
                        marginTop: '8px',
                        padding: '8px',
                        background: '#f8f9fa',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}>
                        {contact.notes}
                      </p>
                    )}
                  </div>

                  {isAdmin && contact.id && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn"
                        onClick={() => handleEdit(contact)}
                        style={{ padding: '8px 16px', fontSize: '14px', background: '#007bff', color: 'white' }}
                      >
                        تعديل
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(contact.id)}
                        style={{ padding: '8px 16px', fontSize: '14px' }}
                      >
                        حذف
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      <div className="card" style={{ background: '#fff3cd', border: '1px solid #ffc107' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '8px', color: '#856404' }}>
          ⚠️ تنبيه مهم
        </p>
        <p style={{ lineHeight: '1.6', color: '#856404' }}>
          في حالات الطوارئ القصوى، يرجى الاتصال بأرقام الطوارئ الرسمية أولاً.
          هذه المنصة هي لتقديم المساعدة المجتمعية والدعم الإضافي.
        </p>
      </div>
    </div>
  )
}

export default EmergencyPage

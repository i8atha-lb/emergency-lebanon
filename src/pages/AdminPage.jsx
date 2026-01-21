import { useState } from 'react'
import { supabase } from '../lib/supabase'

function AdminPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      alert('تم تسجيل الدخول بنجاح')
      onLoginSuccess()
    } catch (error) {
      console.error('Login error:', error)
      setError('خطأ في البريد الإلكتروني أو كلمة المرور')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div style={{ maxWidth: '500px', margin: '40px auto' }}>
        <div className="card">
          <h2 style={{ marginBottom: '24px', textAlign: 'center', color: '#c41e3a' }}>
            🔐 تسجيل دخول المسؤول
          </h2>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <input
              type="email"
              className="input"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />

            <input
              type="password"
              className="input"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#666'
          }}>
            <p><strong>ملاحظة:</strong></p>
            <p style={{ marginTop: '8px' }}>
              يجب إنشاء حساب المسؤول من خلال لوحة تحكم Supabase.
              يمكنك بعد ذلك تسجيل الدخول هنا لإدارة المحتوى.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPage

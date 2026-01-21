import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { checkIPAccess } from './lib/edgeFunctions'
import Disclaimer from './components/Disclaimer'
import SheltersPage from './pages/SheltersPage'
import ShelterRequestsPage from './pages/ShelterRequestsPage'
import AidPage from './pages/AidPage'
import EmergencyPage from './pages/EmergencyPage'
import AdminPage from './pages/AdminPage'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  const [currentPage, setCurrentPage] = useState('shelters')
  const [isAdmin, setIsAdmin] = useState(false)
  const [ipBlocked, setIpBlocked] = useState(false)

  useEffect(() => {
    checkUser()
    checkIP()

    // Handle URL hash for admin access
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) // Remove #
      if (hash === 'admin' || hash === 'dashboard') {
        setCurrentPage(hash)
      }
    }

    // Check initial hash
    handleHashChange()

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const checkIP = async () => {
    const ipCheck = await checkIPAccess()
    if (!ipCheck.allowed) {
      setIpBlocked(true)
    }
  }

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setIsAdmin(!!user)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAdmin(false)
    setCurrentPage('shelters')
  }

  if (ipBlocked) {
    return (
      <div>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#c41e3a', marginBottom: '16px', fontSize: '24px' }}>
              🚫 الوصول محظور
            </h2>
            <p style={{ lineHeight: '1.8', color: '#666' }}>
              عذراً، لا يمكن الوصول إلى هذه المنصة من موقعك الجغرافي.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Disclaimer />
      <header className="header">
        <div className="container">
          <h1>🇱🇧 منصة الطوارئ - لبنان</h1>
          <p style={{ fontSize: '14px', marginTop: '8px', opacity: 0.9 }}>
            منصة لمساعدة المتضررين من القصف - تقديم المأوى والمساعدات
          </p>

          <nav className="nav">
            <button
              className={`nav-btn ${currentPage === 'shelters' ? 'active' : ''}`}
              onClick={() => setCurrentPage('shelters')}
            >
              🏠 مأوى متاح
            </button>
            <button
              className={`nav-btn ${currentPage === 'requests' ? 'active' : ''}`}
              onClick={() => setCurrentPage('requests')}
            >
              🆘 محتاج مأوى
            </button>
            <button
              className={`nav-btn ${currentPage === 'aid' ? 'active' : ''}`}
              onClick={() => setCurrentPage('aid')}
            >
              📦 مساعدات
            </button>
            <button
              className={`nav-btn ${currentPage === 'emergency' ? 'active' : ''}`}
              onClick={() => setCurrentPage('emergency')}
            >
              🚨 أرقام طوارئ
            </button>
            {isAdmin && (
              <>
                <button
                  className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('dashboard')}
                >
                  📊 لوحة التحكم
                </button>
                <button
                  className={`nav-btn ${currentPage === 'admin' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('admin')}
                >
                  ⚙️ إدارة
                </button>
                <button
                  className="nav-btn"
                  onClick={handleLogout}
                  style={{ marginRight: 'auto' }}
                >
                  تسجيل خروج
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main style={{ padding: '24px 0', minHeight: 'calc(100vh - 200px)' }}>
        {currentPage === 'shelters' && <SheltersPage isAdmin={isAdmin} />}
        {currentPage === 'requests' && <ShelterRequestsPage isAdmin={isAdmin} />}
        {currentPage === 'aid' && <AidPage isAdmin={isAdmin} />}
        {currentPage === 'emergency' && <EmergencyPage isAdmin={isAdmin} />}
        {currentPage === 'dashboard' && isAdmin && <AdminDashboard />}
        {currentPage === 'admin' && <AdminPage onLoginSuccess={checkUser} />}
      </main>

      <footer style={{
        background: '#333',
        color: 'white',
        textAlign: 'center',
        padding: '20px',
        marginTop: '40px'
      }}>
        <p>الله يحمي لبنان وجنوبنا العزيز 🇱🇧</p>
        <p style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>
          منصة مجانية لمساعدة المتضررين - جميع الحقوق محفوظة
        </p>
      </footer>
    </div>
  )
}

export default App

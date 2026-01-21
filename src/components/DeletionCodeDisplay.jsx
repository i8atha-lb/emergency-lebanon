import { formatCodeForDisplay } from '../lib/deletionCode'

function DeletionCodeDisplay({ code, onClose }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    alert('✅ تم نسخ الكود!')
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #28a745 0%, #20a040 100%)',
        color: 'white',
        padding: '32px',
        borderRadius: '16px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          ✅
        </div>

        <h2 style={{ marginBottom: '16px', fontSize: '24px' }}>
          تم إضافة المنشور بنجاح!
        </h2>

        <div style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <p style={{ marginBottom: '12px', fontSize: '16px', opacity: 0.95 }}>
            🔑 <strong>كود الحذف الخاص بك:</strong>
          </p>
          <div style={{
            background: 'white',
            color: '#28a745',
            padding: '20px',
            borderRadius: '8px',
            fontSize: '36px',
            fontWeight: 'bold',
            letterSpacing: '8px',
            fontFamily: 'monospace',
            marginBottom: '12px',
            userSelect: 'all'
          }}>
            {formatCodeForDisplay(code)}
          </div>
          <button
            onClick={handleCopy}
            style={{
              background: 'rgba(255,255,255,0.3)',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.5)',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            📋 نسخ الكود
          </button>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.15)',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'right',
          fontSize: '14px',
          lineHeight: '1.8'
        }}>
          <p style={{ marginBottom: '8px' }}>
            ⚠️ <strong>مهم جداً:</strong>
          </p>
          <ul style={{ paddingRight: '20px', marginBottom: '0' }}>
            <li>احتفظ بهذا الكود في مكان آمن</li>
            <li>الكود مطلوب لحذف المنشور في أي وقت</li>
            <li>لن يتم عرض الكود مرة أخرى</li>
            <li>يمكنك استخدام الكود من أي جهاز</li>
          </ul>
        </div>

        <button
          className="btn"
          onClick={onClose}
          style={{
            background: 'white',
            color: '#28a745',
            padding: '14px 32px',
            fontSize: '16px',
            fontWeight: 'bold',
            border: 'none',
            width: '100%'
          }}
        >
          فهمت، إغلاق
        </button>

        <p style={{ marginTop: '16px', fontSize: '12px', opacity: 0.8 }}>
          💡 يمكنك أيضاً حذف المنشور من نفس الجهاز خلال 5 دقائق
        </p>
      </div>
    </div>
  )
}

export default DeletionCodeDisplay

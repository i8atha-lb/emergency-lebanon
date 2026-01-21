import ReportButton from './ReportButton'
import DeleteWithCode from './DeleteWithCode'

function AidCard({ post, canEdit, onDelete, onReportSuccess }) {
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'الآن'
    if (diffMins < 60) return `منذ ${diffMins} د`
    if (diffHours < 24) return `منذ ${diffHours} س`
    if (diffDays < 7) return `منذ ${diffDays} ي`
    return date.toLocaleDateString('ar-LB', { month: 'short', day: 'numeric' })
  }

  const isNeeded = post.type === 'needed'
  const isSuspicious = post.flags_count >= 3

  return (
    <div className="card" style={isSuspicious ? { borderRight: '3px solid #dc3545' } : {}}>
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            background: isNeeded ? '#dc3545' : '#28a745',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {isNeeded ? '🆘 محتاج' : '✅ متوفر'}
          </span>
          {post.category && (
            <span style={{ background: '#f0f0f0', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
              {post.category}
            </span>
          )}
          <span style={{ fontSize: '13px', color: '#666' }}>{getRelativeTime(post.created_at)}</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <ReportButton
            postType="aid"
            postId={post.id}
            currentFlags={post.flags_count || 0}
            onReportSuccess={onReportSuccess}
          />
          {canEdit && (
            <button onClick={onDelete} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>
              حذف
            </button>
          )}
        </div>
      </div>

      {/* Warning */}
      {isSuspicious && (
        <div style={{ background: '#fff3cd', padding: '6px 10px', borderRadius: '4px', marginBottom: '8px', fontSize: '12px', color: '#856404' }}>
          ⚠️ تم الإبلاغ عن هذا المنشور {post.flags_count} مرات
        </div>
      )}

      {/* Location */}
      {post.location && (
        <div style={{ fontSize: '14px', color: '#555', marginBottom: '6px' }}>
          📍 {post.location}
        </div>
      )}

      {/* Description */}
      <div style={{ fontSize: '14px', color: '#333', marginBottom: '8px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
        {post.description}
      </div>

      {/* Contact */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '8px' }}>
        <div>
          {post.contact_name && <span style={{ fontSize: '13px', marginLeft: '8px' }}>👤 {post.contact_name}</span>}
          <a href={`tel:${post.contact_phone}`} style={{ fontSize: '15px', fontWeight: 'bold', color: '#28a745', textDecoration: 'none' }}>
            📞 {post.contact_phone}
          </a>
        </div>
        {post.deletion_code_hash && (
          <DeleteWithCode
            postId={post.id}
            postType="aid"
            deletionCodeHash={post.deletion_code_hash}
            onDeleteSuccess={onReportSuccess}
          />
        )}
      </div>
    </div>
  )
}

export default AidCard

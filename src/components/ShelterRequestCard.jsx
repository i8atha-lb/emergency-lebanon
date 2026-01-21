import ReportButton from './ReportButton'
import DeleteWithCode from './DeleteWithCode'

function ShelterRequestCard({ request, canEdit, onDelete, onReportSuccess }) {
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

  const isSuspicious = request.flags_count >= 3

  return (
    <div className="card" style={isSuspicious ? { borderRight: '3px solid #dc3545' } : {}}>
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ background: '#dc3545', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            🆘 يحتاج
          </span>
          <span style={{ fontSize: '13px', color: '#666' }}>{getRelativeTime(request.created_at)}</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <ReportButton
            postType="shelter_request"
            postId={request.id}
            currentFlags={request.flags_count || 0}
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
          ⚠️ تم الإبلاغ عن هذا الطلب {request.flags_count} مرات
        </div>
      )}

      {/* Location */}
      <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '6px' }}>
        📍 {request.location_current}
      </div>

      {/* Details */}
      <div style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>
        <span style={{ marginLeft: '12px' }}>👥 {request.people_count} أشخاص</span>
        {request.duration_needed && <span style={{ marginLeft: '12px' }}>⏱️ {request.duration_needed}</span>}
        {request.has_children && <span style={{ marginLeft: '8px', color: '#007bff' }}>👶</span>}
        {request.has_elderly && <span style={{ marginLeft: '8px', color: '#6c757d' }}>👴</span>}
        {request.has_medical_needs && <span style={{ marginLeft: '8px', color: '#dc3545' }}>🏥</span>}
      </div>

      {/* Notes */}
      {request.notes && (
        <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px', whiteSpace: 'pre-wrap' }}>
          {request.notes}
        </div>
      )}

      {/* Contact */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '8px' }}>
        <div>
          {request.contact_name && <span style={{ fontSize: '13px', marginLeft: '8px' }}>👤 {request.contact_name}</span>}
          <a href={`tel:${request.contact_phone}`} style={{ fontSize: '15px', fontWeight: 'bold', color: '#28a745', textDecoration: 'none' }}>
            📞 {request.contact_phone}
          </a>
        </div>
        {request.deletion_code_hash && (
          <DeleteWithCode
            postId={request.id}
            postType="request"
            deletionCodeHash={request.deletion_code_hash}
            onDeleteSuccess={onReportSuccess}
          />
        )}
      </div>
    </div>
  )
}

export default ShelterRequestCard

import ReportButton from './ReportButton'
import DeleteWithCode from './DeleteWithCode'

function ShelterCard({ shelter, canEdit, onDelete, onEdit, onReportSuccess }) {
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

  const isSuspicious = shelter.flags_count >= 3

  return (
    <div className="card" style={isSuspicious ? { borderRight: '3px solid #dc3545' } : {}}>
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ background: '#28a745', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            🏠 متاح
          </span>
          <span style={{ fontSize: '13px', color: '#666' }}>{getRelativeTime(shelter.created_at)}</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <ReportButton
            postType="shelter"
            postId={shelter.id}
            currentFlags={shelter.flags_count || 0}
            onReportSuccess={onReportSuccess}
          />
          {canEdit && (
            <>
              <button onClick={onEdit} style={{ background: '#007bff', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>
                تعديل
              </button>
              <button onClick={onDelete} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>
                حذف
              </button>
            </>
          )}
        </div>
      </div>

      {/* Warning */}
      {isSuspicious && (
        <div style={{ background: '#fff3cd', padding: '6px 10px', borderRadius: '4px', marginBottom: '8px', fontSize: '12px', color: '#856404' }}>
          ⚠️ تم الإبلاغ عن هذا المنشور {shelter.flags_count} مرات
        </div>
      )}

      {/* Location */}
      <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '6px' }}>
        📍 {shelter.location_area}
      </div>

      {/* Details */}
      <div style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>
        {shelter.capacity && <span style={{ marginLeft: '12px' }}>👥 {shelter.capacity} أشخاص</span>}
        {shelter.duration && <span style={{ marginLeft: '12px' }}>⏱️ {shelter.duration}</span>}
        {shelter.address_details && <div style={{ marginTop: '4px' }}>📫 {shelter.address_details}</div>}
      </div>

      {/* Notes */}
      {shelter.notes && (
        <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px', whiteSpace: 'pre-wrap' }}>
          {shelter.notes}
        </div>
      )}

      {/* Contact */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '8px' }}>
        <div>
          {shelter.contact_name && <span style={{ fontSize: '13px', marginLeft: '8px' }}>👤 {shelter.contact_name}</span>}
          <a href={`tel:${shelter.contact_phone}`} style={{ fontSize: '15px', fontWeight: 'bold', color: '#28a745', textDecoration: 'none' }}>
            📞 {shelter.contact_phone}
          </a>
        </div>
        {shelter.deletion_code_hash && (
          <DeleteWithCode
            postId={shelter.id}
            postType="shelter"
            deletionCodeHash={shelter.deletion_code_hash}
            onDeleteSuccess={onReportSuccess}
          />
        )}
      </div>
    </div>
  )
}

export default ShelterCard

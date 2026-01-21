import ReportButton from './ReportButton'
import DeleteWithCode from './DeleteWithCode'

function ShelterCard({ shelter, canEdit, onDelete, onEdit, onReportSuccess }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-LB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isSuspicious = shelter.flags_count >= 3

  return (
    <div className="card" style={isSuspicious ? { borderLeft: '4px solid #ff6b6b' } : {}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: '#c41e3a', marginBottom: '8px' }}>
            📍 {shelter.location_area}
          </h3>
          <p style={{ fontSize: '14px', color: '#666' }}>
            {formatDate(shelter.created_at)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ReportButton
            postType="shelter"
            postId={shelter.id}
            currentFlags={shelter.flags_count || 0}
            onReportSuccess={onReportSuccess}
          />
          {canEdit && (
            <>
              <button
                className="btn"
                onClick={onEdit}
                style={{ padding: '8px 16px', fontSize: '14px', background: '#007bff', color: 'white' }}
              >
                تعديل
              </button>
              <button
                className="btn btn-danger"
                onClick={onDelete}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                حذف
              </button>
            </>
          )}
        </div>
      </div>

      {isSuspicious && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'start',
          gap: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div>
            <strong style={{ color: '#856404' }}>تحذير:</strong>
            <p style={{ color: '#856404', fontSize: '14px', marginTop: '4px' }}>
              تم الإبلاغ عن هذا المنشور من قبل {shelter.flags_count} {shelter.flags_count === 1 ? 'مستخدم' : 'مستخدمين'}.
              يرجى التحقق من المعلومات قبل التواصل.
            </p>
          </div>
        </div>
      )}

      <div style={{ lineHeight: '1.8', marginBottom: '12px' }}>
        {shelter.address_details && (
          <p style={{ marginBottom: '8px' }}>
            <strong>العنوان:</strong> {shelter.address_details}
          </p>
        )}

        {shelter.capacity && (
          <p style={{ marginBottom: '8px' }}>
            <strong>الاستيعاب:</strong> {shelter.capacity} {shelter.capacity === 1 ? 'شخص' : 'أشخاص'}
          </p>
        )}

        {shelter.duration && (
          <p style={{ marginBottom: '8px' }}>
            <strong>المدة:</strong> {shelter.duration}
          </p>
        )}

        {shelter.notes && (
          <p style={{
            marginTop: '12px',
            padding: '12px',
            background: '#f8f9fa',
            borderRadius: '8px',
            whiteSpace: 'pre-wrap'
          }}>
            {shelter.notes}
          </p>
        )}
      </div>

      <div style={{
        borderTop: '1px solid #eee',
        paddingTop: '12px',
        marginTop: '12px'
      }}>
        <p style={{ marginBottom: '8px' }}>
          <strong>للتواصل:</strong>
        </p>
        {shelter.contact_name && (
          <p style={{ marginBottom: '4px' }}>
            👤 {shelter.contact_name}
          </p>
        )}
        <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
          📞 {shelter.contact_phone}
        </p>
      </div>

      {shelter.deletion_code_hash && (
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <DeleteWithCode
            postId={shelter.id}
            postType="shelter"
            deletionCodeHash={shelter.deletion_code_hash}
            onDeleteSuccess={onReportSuccess}
          />
        </div>
      )}
    </div>
  )
}

export default ShelterCard

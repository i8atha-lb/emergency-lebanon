import ReportButton from './ReportButton'

function ShelterRequestCard({ request, canEdit, onDelete, onReportSuccess }) {
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

  const isSuspicious = request.flags_count >= 3

  return (
    <div className="card" style={isSuspicious ? { borderLeft: '4px solid #ff6b6b' } : {}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: '#dc3545', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🆘 {request.location_current}
          </h3>
          <p style={{ fontSize: '14px', color: '#666' }}>
            {formatDate(request.created_at)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ReportButton
            postType="shelter_request"
            postId={request.id}
            currentFlags={request.flags_count || 0}
            onReportSuccess={onReportSuccess}
          />
          {canEdit && (
            <button
              className="btn btn-danger"
              onClick={onDelete}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              حذف
            </button>
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
              تم الإبلاغ عن هذا الطلب من قبل {request.flags_count} {request.flags_count === 1 ? 'مستخدم' : 'مستخدمين'}.
              يرجى الحذر عند التواصل.
            </p>
          </div>
        </div>
      )}

      <div style={{
        background: '#f8f9fa',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
          <div>
            <strong>👥 عدد الأشخاص:</strong> {request.people_count}
          </div>
          {request.duration_needed && (
            <div>
              <strong>⏱️ المدة:</strong> {request.duration_needed}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px' }}>
          {request.has_children && (
            <span style={{ color: '#007bff' }}>👶 يوجد أطفال</span>
          )}
          {request.has_elderly && (
            <span style={{ color: '#6c757d' }}>👴 يوجد مسنين</span>
          )}
          {request.has_medical_needs && (
            <span style={{ color: '#dc3545' }}>🏥 احتياجات طبية</span>
          )}
        </div>
      </div>

      {request.notes && (
        <p style={{
          marginBottom: '12px',
          padding: '12px',
          background: '#fff',
          border: '1px solid #eee',
          borderRadius: '8px',
          whiteSpace: 'pre-wrap',
          lineHeight: '1.6'
        }}>
          {request.notes}
        </p>
      )}

      <div style={{
        borderTop: '1px solid #eee',
        paddingTop: '12px',
        marginTop: '12px'
      }}>
        <p style={{ marginBottom: '8px', color: '#666', fontSize: '14px' }}>
          <strong>للتواصل وتقديم المساعدة:</strong>
        </p>
        {request.contact_name && (
          <p style={{ marginBottom: '4px' }}>
            👤 {request.contact_name}
          </p>
        )}
        <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
          📞 {request.contact_phone}
        </p>
      </div>
    </div>
  )
}

export default ShelterRequestCard

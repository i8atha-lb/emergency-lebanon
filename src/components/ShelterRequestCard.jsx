import ReportButton from './ReportButton'
import DeleteWithCode from './DeleteWithCode'

function ShelterRequestCard({ request, canEdit, onDelete, onReportSuccess }) {
  // Relative time in Arabic
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'الآن'
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`
    if (diffHours < 24) return `منذ ${diffHours} ساعة`
    if (diffDays < 7) return `منذ ${diffDays} يوم`

    return date.toLocaleDateString('ar-LB', {
      month: 'short',
      day: 'numeric'
    })
  }

  const isSuspicious = request.flags_count >= 3
  const hasSpecialNeeds = request.has_children || request.has_elderly || request.has_medical_needs

  return (
    <div className="post-card post-card--request" style={isSuspicious ? { borderColor: '#ff6b6b' } : {}}>
      {/* Header with type indicator */}
      <div className="post-card__header post-card__header--request">
        <div className="post-card__type-badge">
          <span className="post-card__type-icon">🆘</span>
          <span>يحتاج مأوى</span>
        </div>
        <span className="post-card__time">{getRelativeTime(request.created_at)}</span>
      </div>

      {/* Location - Primary Info */}
      <div className="post-card__location">
        <span className="post-card__location-icon">📍</span>
        <h3 className="post-card__location-text">{request.location_current}</h3>
      </div>

      {/* Warning if flagged */}
      {isSuspicious && (
        <div className="post-card__warning">
          <span className="post-card__warning-icon">⚠️</span>
          <div>
            <strong>تحذير:</strong> تم الإبلاغ عن هذا الطلب من قبل {request.flags_count} مستخدمين.
            يرجى الحذر عند التواصل.
          </div>
        </div>
      )}

      {/* Info Grid */}
      <div className="post-card__info-grid">
        <div className="post-card__info-item">
          <span className="post-card__info-icon">👥</span>
          <div>
            <span className="post-card__info-label">عدد الأشخاص</span>
            <span className="post-card__info-value">{request.people_count} {request.people_count === 1 ? 'شخص' : 'أشخاص'}</span>
          </div>
        </div>
        {request.duration_needed && (
          <div className="post-card__info-item">
            <span className="post-card__info-icon">⏱️</span>
            <div>
              <span className="post-card__info-label">المدة المطلوبة</span>
              <span className="post-card__info-value">{request.duration_needed}</span>
            </div>
          </div>
        )}
      </div>

      {/* Special Needs Badges */}
      {hasSpecialNeeds && (
        <div className="post-card__badges">
          {request.has_children && (
            <span className="post-card__badge post-card__badge--children">
              👶 أطفال
            </span>
          )}
          {request.has_elderly && (
            <span className="post-card__badge post-card__badge--elderly">
              👴 مسنين
            </span>
          )}
          {request.has_medical_needs && (
            <span className="post-card__badge post-card__badge--medical">
              🏥 احتياجات طبية
            </span>
          )}
        </div>
      )}

      {/* Notes */}
      {request.notes && (
        <div className="post-card__notes">
          <p>{request.notes}</p>
        </div>
      )}

      {/* Contact Section - Most Important */}
      <div className="post-card__contact">
        <div className="post-card__contact-label">للتواصل وتقديم المساعدة</div>
        {request.contact_name && (
          <div className="post-card__contact-name">
            <span>👤</span> {request.contact_name}
          </div>
        )}
        <a href={`tel:${request.contact_phone}`} className="post-card__phone post-card__phone--urgent">
          <span className="post-card__phone-icon">📞</span>
          <span className="post-card__phone-number">{request.contact_phone}</span>
          <span className="post-card__phone-action">اتصل للمساعدة</span>
        </a>
      </div>

      {/* Actions Footer */}
      <div className="post-card__actions">
        <div className="post-card__actions-right">
          <ReportButton
            postType="shelter_request"
            postId={request.id}
            currentFlags={request.flags_count || 0}
            onReportSuccess={onReportSuccess}
          />
          {request.deletion_code_hash && (
            <DeleteWithCode
              postId={request.id}
              postType="request"
              deletionCodeHash={request.deletion_code_hash}
              onDeleteSuccess={onReportSuccess}
            />
          )}
        </div>
        {canEdit && (
          <div className="post-card__actions-left">
            <button className="post-card__btn post-card__btn--delete" onClick={onDelete}>
              حذف
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShelterRequestCard

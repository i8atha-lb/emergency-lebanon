import ReportButton from './ReportButton'
import DeleteWithCode from './DeleteWithCode'

function ShelterCard({ shelter, canEdit, onDelete, onEdit, onReportSuccess }) {
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

  const isSuspicious = shelter.flags_count >= 3

  return (
    <div className="post-card post-card--shelter" style={isSuspicious ? { borderColor: '#ff6b6b' } : {}}>
      {/* Header with type indicator */}
      <div className="post-card__header post-card__header--shelter">
        <div className="post-card__type-badge">
          <span className="post-card__type-icon">🏠</span>
          <span>مأوى متاح</span>
        </div>
        <span className="post-card__time">{getRelativeTime(shelter.created_at)}</span>
      </div>

      {/* Location - Primary Info */}
      <div className="post-card__location">
        <span className="post-card__location-icon">📍</span>
        <h3 className="post-card__location-text">{shelter.location_area}</h3>
      </div>

      {/* Warning if flagged */}
      {isSuspicious && (
        <div className="post-card__warning">
          <span className="post-card__warning-icon">⚠️</span>
          <div>
            <strong>تحذير:</strong> تم الإبلاغ عن هذا المنشور من قبل {shelter.flags_count} مستخدمين.
            يرجى التحقق من المعلومات قبل التواصل.
          </div>
        </div>
      )}

      {/* Info Grid */}
      <div className="post-card__info-grid">
        {shelter.capacity && (
          <div className="post-card__info-item">
            <span className="post-card__info-icon">👥</span>
            <div>
              <span className="post-card__info-label">الاستيعاب</span>
              <span className="post-card__info-value">{shelter.capacity} {shelter.capacity === 1 ? 'شخص' : 'أشخاص'}</span>
            </div>
          </div>
        )}
        {shelter.duration && (
          <div className="post-card__info-item">
            <span className="post-card__info-icon">⏱️</span>
            <div>
              <span className="post-card__info-label">المدة</span>
              <span className="post-card__info-value">{shelter.duration}</span>
            </div>
          </div>
        )}
        {shelter.address_details && (
          <div className="post-card__info-item post-card__info-item--full">
            <span className="post-card__info-icon">🏢</span>
            <div>
              <span className="post-card__info-label">العنوان</span>
              <span className="post-card__info-value">{shelter.address_details}</span>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      {shelter.notes && (
        <div className="post-card__notes">
          <p>{shelter.notes}</p>
        </div>
      )}

      {/* Contact Section - Most Important */}
      <div className="post-card__contact">
        <div className="post-card__contact-label">للتواصل وتقديم المساعدة</div>
        {shelter.contact_name && (
          <div className="post-card__contact-name">
            <span>👤</span> {shelter.contact_name}
          </div>
        )}
        <a href={`tel:${shelter.contact_phone}`} className="post-card__phone">
          <span className="post-card__phone-icon">📞</span>
          <span className="post-card__phone-number">{shelter.contact_phone}</span>
          <span className="post-card__phone-action">اتصل الآن</span>
        </a>
      </div>

      {/* Actions Footer */}
      <div className="post-card__actions">
        <div className="post-card__actions-right">
          <ReportButton
            postType="shelter"
            postId={shelter.id}
            currentFlags={shelter.flags_count || 0}
            onReportSuccess={onReportSuccess}
          />
          {shelter.deletion_code_hash && (
            <DeleteWithCode
              postId={shelter.id}
              postType="shelter"
              deletionCodeHash={shelter.deletion_code_hash}
              onDeleteSuccess={onReportSuccess}
            />
          )}
        </div>
        {canEdit && (
          <div className="post-card__actions-left">
            <button className="post-card__btn post-card__btn--edit" onClick={onEdit}>
              تعديل
            </button>
            <button className="post-card__btn post-card__btn--delete" onClick={onDelete}>
              حذف
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShelterCard

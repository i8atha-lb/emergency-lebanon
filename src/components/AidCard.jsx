import ReportButton from './ReportButton'
import DeleteWithCode from './DeleteWithCode'

function AidCard({ post, canEdit, onDelete, onReportSuccess }) {
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

  const isNeeded = post.type === 'needed'
  const isSuspicious = post.flags_count >= 3

  return (
    <div
      className={`post-card ${isNeeded ? 'post-card--aid-needed' : 'post-card--aid-available'}`}
      style={isSuspicious ? { borderColor: '#ff6b6b' } : {}}
    >
      {/* Header with type indicator */}
      <div className={`post-card__header ${isNeeded ? 'post-card__header--aid-needed' : 'post-card__header--aid-available'}`}>
        <div className="post-card__type-badge">
          <span className="post-card__type-icon">{isNeeded ? '🆘' : '✅'}</span>
          <span>{isNeeded ? 'يحتاج مساعدة' : 'مساعدة متاحة'}</span>
        </div>
        <span className="post-card__time">{getRelativeTime(post.created_at)}</span>
      </div>

      {/* Category Badge */}
      {post.category && (
        <div className="post-card__category">
          <span className="post-card__category-badge">{post.category}</span>
        </div>
      )}

      {/* Location if available */}
      {post.location && (
        <div className="post-card__location">
          <span className="post-card__location-icon">📍</span>
          <h3 className="post-card__location-text">{post.location}</h3>
        </div>
      )}

      {/* Warning if flagged */}
      {isSuspicious && (
        <div className="post-card__warning">
          <span className="post-card__warning-icon">⚠️</span>
          <div>
            <strong>تحذير:</strong> تم الإبلاغ عن هذا المنشور من قبل {post.flags_count} مستخدمين.
            يرجى التحقق قبل التواصل.
          </div>
        </div>
      )}

      {/* Description */}
      <div className="post-card__description">
        <p>{post.description}</p>
      </div>

      {/* Contact Section */}
      <div className="post-card__contact">
        <div className="post-card__contact-label">
          {isNeeded ? 'للتواصل وتقديم المساعدة' : 'للتواصل والاستفادة'}
        </div>
        {post.contact_name && (
          <div className="post-card__contact-name">
            <span>👤</span> {post.contact_name}
          </div>
        )}
        <a
          href={`tel:${post.contact_phone}`}
          className={`post-card__phone ${isNeeded ? 'post-card__phone--urgent' : ''}`}
        >
          <span className="post-card__phone-icon">📞</span>
          <span className="post-card__phone-number">{post.contact_phone}</span>
          <span className="post-card__phone-action">{isNeeded ? 'اتصل للمساعدة' : 'اتصل الآن'}</span>
        </a>
      </div>

      {/* Actions Footer */}
      <div className="post-card__actions">
        <div className="post-card__actions-right">
          <ReportButton
            postType="aid"
            postId={post.id}
            currentFlags={post.flags_count || 0}
            onReportSuccess={onReportSuccess}
          />
          {post.deletion_code_hash && (
            <DeleteWithCode
              postId={post.id}
              postType="aid"
              deletionCodeHash={post.deletion_code_hash}
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

export default AidCard

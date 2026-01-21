import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalShelters: 0,
    totalRequests: 0,
    totalAid: 0,
    totalReports: 0,
    flaggedPosts: 0,
    postsLast24h: 0,
    reportsLast24h: 0
  })
  const [recentReports, setRecentReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const now = new Date()
      const yesterday = new Date(now - 24 * 60 * 60 * 1000)

      // Get counts
      const [
        sheltersResult,
        requestsResult,
        aidResult,
        reportsResult,
        flaggedShelters,
        flaggedAid,
        flaggedRequests,
        recentShelters,
        recentRequests,
        recentAid,
        recentReportsResult
      ] = await Promise.all([
        supabase.from('shelters').select('id', { count: 'exact', head: true }),
        supabase.from('shelter_requests').select('id', { count: 'exact', head: true }),
        supabase.from('aid_posts').select('id', { count: 'exact', head: true }),
        supabase.from('reports').select('id', { count: 'exact', head: true }),
        supabase.from('shelters').select('id', { count: 'exact', head: true }).gte('flags_count', 1),
        supabase.from('aid_posts').select('id', { count: 'exact', head: true }).gte('flags_count', 1),
        supabase.from('shelter_requests').select('id', { count: 'exact', head: true }).gte('flags_count', 1),
        supabase.from('shelters').select('id', { count: 'exact', head: true }).gte('created_at', yesterday.toISOString()),
        supabase.from('shelter_requests').select('id', { count: 'exact', head: true }).gte('created_at', yesterday.toISOString()),
        supabase.from('aid_posts').select('id', { count: 'exact', head: true }).gte('created_at', yesterday.toISOString()),
        supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(10)
      ])

      setStats({
        totalShelters: sheltersResult.count || 0,
        totalRequests: requestsResult.count || 0,
        totalAid: aidResult.count || 0,
        totalReports: reportsResult.count || 0,
        flaggedPosts: (flaggedShelters.count || 0) + (flaggedAid.count || 0) + (flaggedRequests.count || 0),
        postsLast24h: (recentShelters.count || 0) + (recentRequests.count || 0) + (recentAid.count || 0),
        reportsLast24h: recentReportsResult.data?.filter(r => new Date(r.created_at) > yesterday).length || 0
      })

      setRecentReports(recentReportsResult.data || [])
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReport = async (reportId) => {
    if (!confirm('هل أنت متأكد من حذف هذا البلاغ؟')) return

    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)

      if (error) throw error
      loadDashboardData()
    } catch (error) {
      console.error('Error deleting report:', error)
      alert('حدث خطأ في الحذف')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-LB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getReasonLabel = (reason) => {
    const labels = {
      spam: 'منشور مزعج',
      fake: 'معلومات كاذبة',
      scam: 'احتيال',
      inappropriate: 'محتوى غير لائق',
      other: 'أخرى'
    }
    return labels[reason] || reason
  }

  const getPostTypeLabel = (type) => {
    const labels = {
      shelter: 'مأوى متاح',
      aid: 'مساعدة',
      shelter_request: 'طلب مأوى'
    }
    return labels[type] || type
  }

  if (loading) {
    return <div className="loading">جاري تحميل لوحة التحكم...</div>
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: '24px', color: '#c41e3a' }}>
        📊 لوحة التحكم - إحصائيات المنصة
      </h2>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <StatCard
          icon="🏠"
          title="مآوي متاحة"
          value={stats.totalShelters}
          color="#28a745"
        />
        <StatCard
          icon="🆘"
          title="طلبات مأوى"
          value={stats.totalRequests}
          color="#dc3545"
        />
        <StatCard
          icon="📦"
          title="منشورات مساعدة"
          value={stats.totalAid}
          color="#007bff"
        />
        <StatCard
          icon="🚩"
          title="إجمالي البلاغات"
          value={stats.totalReports}
          color="#ffc107"
        />
        <StatCard
          icon="⚠️"
          title="منشورات مبلغ عنها"
          value={stats.flaggedPosts}
          color="#ff6b6b"
        />
        <StatCard
          icon="📈"
          title="منشورات آخر 24 ساعة"
          value={stats.postsLast24h}
          color="#17a2b8"
        />
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🕐 النشاط الأخير
        </h3>
        <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ color: '#666' }}>منشورات جديدة: </span>
            <strong style={{ color: '#28a745', fontSize: '20px' }}>{stats.postsLast24h}</strong>
          </div>
          <div>
            <span style={{ color: '#666' }}>بلاغات جديدة: </span>
            <strong style={{ color: '#dc3545', fontSize: '20px' }}>{stats.reportsLast24h}</strong>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="card">
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🚩 آخر البلاغات ({recentReports.length})
        </h3>

        {recentReports.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
            لا توجد بلاغات حالياً
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px', textAlign: 'right' }}>التاريخ</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>النوع</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>السبب</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>تفاصيل</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report) => (
                  <tr key={report.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      {formatDate(report.created_at)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        background: '#e9ecef',
                        whiteSpace: 'nowrap'
                      }}>
                        {getPostTypeLabel(report.reported_post_type)}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        background: '#fff3cd',
                        color: '#856404',
                        whiteSpace: 'nowrap'
                      }}>
                        {getReasonLabel(report.reason)}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', maxWidth: '200px' }}>
                      {report.details || '-'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="btn btn-danger"
                        style={{ padding: '6px 12px', fontSize: '14px' }}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: '24px', background: '#f8f9fa' }}>
        <h3 style={{ marginBottom: '16px' }}>⚡ إجراءات سريعة</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={loadDashboardData}
            className="btn btn-primary"
          >
            🔄 تحديث البيانات
          </button>
          <button
            onClick={() => window.location.href = '#shelters'}
            className="btn"
            style={{ background: '#28a745', color: 'white' }}
          >
            مراجعة المآوي
          </button>
          <button
            onClick={() => window.location.href = '#requests'}
            className="btn"
            style={{ background: '#dc3545', color: 'white' }}
          >
            مراجعة الطلبات
          </button>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className="card" style={{ textAlign: 'center', borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: '40px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color, marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ color: '#666', fontSize: '14px' }}>{title}</div>
    </div>
  )
}

export default AdminDashboard

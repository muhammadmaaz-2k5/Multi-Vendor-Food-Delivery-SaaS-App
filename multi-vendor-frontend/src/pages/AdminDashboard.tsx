import React, { useEffect, useState } from 'react';
import { Activity, Users, Store, DollarSign, TrendingUp, BarChart2, Shield } from 'lucide-react';
import axios from 'axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCommissions: 0
  });
  });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/v1/admin/stats'),
        axios.get('http://localhost:5000/api/v1/admin/audit-logs')
      ]);
      
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (logsRes.data.success) setAuditLogs(logsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-1px' }}>
              Platform Overview
            </h1>
            <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '0.5rem' }}>
              Super Admin Control Center
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.75rem 1.5rem', borderRadius: '50px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <Activity size={20} color="#10b981" />
            <span style={{ fontWeight: 600, color: '#10b981' }}>System Online</span>
          </div>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#64748b' }}>Loading Platform Data...</div>
        ) : (
          <>
            {/* KPI Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              
              <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ ...labelStyle, color: '#94a3b8' }}>Platform Commission (Net)</p>
                    <h3 style={{ ...valueStyle, color: 'white' }}>${(stats.totalCommissions || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                  </div>
                  <div style={{ ...iconWrapperStyle, background: 'rgba(255,255,255,0.1)', color: '#38bdf8' }}>
                    <DollarSign size={24} />
                  </div>
                </div>
                <div style={trendStyle}>
                  <TrendingUp size={16} color="#38bdf8" /> <span style={{ color: '#38bdf8' }}>+22.5%</span> this month
                </div>
              </div>

              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={labelStyle}>Total Revenue (GMV)</p>
                    <h3 style={valueStyle}>${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                  </div>
                  <div style={{ ...iconWrapperStyle, background: '#dcfce7', color: '#16a34a' }}>
                    <DollarSign size={24} />
                  </div>
                </div>
                <div style={trendStyle}>
                  <TrendingUp size={16} color="#16a34a" /> <span style={{ color: '#16a34a' }}>+14.2%</span> this month
                </div>
              </div>

              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={labelStyle}>Total Orders</p>
                    <h3 style={valueStyle}>{stats.totalOrders.toLocaleString()}</h3>
                  </div>
                  <div style={{ ...iconWrapperStyle, background: '#e0e7ff', color: '#4f46e5' }}>
                    <BarChart2 size={24} />
                  </div>
                </div>
                <div style={trendStyle}>
                  <TrendingUp size={16} color="#16a34a" /> <span style={{ color: '#16a34a' }}>+8.1%</span> this month
                </div>
              </div>

              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={labelStyle}>Registered Tenants</p>
                    <h3 style={valueStyle}>{stats.totalRestaurants.toLocaleString()}</h3>
                  </div>
                  <div style={{ ...iconWrapperStyle, background: '#fef3c7', color: '#d97706' }}>
                    <Store size={24} />
                  </div>
                </div>
                <div style={trendStyle}>
                  <TrendingUp size={16} color="#16a34a" /> <span style={{ color: '#16a34a' }}>+3</span> new this week
                </div>
              </div>

              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={labelStyle}>Total Users</p>
                    <h3 style={valueStyle}>{stats.totalUsers.toLocaleString()}</h3>
                  </div>
                  <div style={{ ...iconWrapperStyle, background: '#fce7f3', color: '#db2777' }}>
                    <Users size={24} />
                  </div>
                </div>
                <div style={trendStyle}>
                   <TrendingUp size={16} color="#16a34a" /> <span style={{ color: '#16a34a' }}>+124</span> this week
                </div>
              </div>

            </div>

            {/* Audit Logs Table */}
            <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                <Shield size={24} color="#6366f1" />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>System Audit Logs</h2>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '1rem', fontWeight: 600 }}>Timestamp</th>
                      <th style={{ padding: '1rem', fontWeight: 600 }}>Action</th>
                      <th style={{ padding: '1rem', fontWeight: 600 }}>Entity</th>
                      <th style={{ padding: '1rem', fontWeight: 600 }}>IP Address</th>
                      <th style={{ padding: '1rem', fontWeight: 600 }}>User ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log: any) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '1rem', color: '#475569', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            background: log.action.includes('STRIPE') ? '#dbeafe' : '#fef3c7',
                            color: log.action.includes('STRIPE') ? '#1e40af' : '#b45309',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.8rem',
                            fontWeight: 700
                          }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: '#0f172a', fontWeight: 500, fontSize: '0.95rem' }}>
                          {log.entity} {log.entityId && <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '0.5rem' }}>({log.entityId.substring(0,8)}...)</span>}
                        </td>
                        <td style={{ padding: '1rem', color: '#475569', fontSize: '0.95rem', fontFamily: 'monospace' }}>
                          {log.ipAddress || 'System'}
                        </td>
                        <td style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem' }}>
                          {log.userId || 'Guest'}
                        </td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                          No audit logs found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Inline styles for speed
const cardStyle: React.CSSProperties = {
  background: 'white',
  padding: '1.5rem',
  borderRadius: '20px',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '0.5rem'
};

const valueStyle: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: 800,
  color: '#0f172a',
  margin: 0
};

const iconWrapperStyle: React.CSSProperties = {
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const trendStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  fontSize: '0.875rem',
  color: '#64748b',
  marginTop: '1.5rem',
  fontWeight: 500
};

import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { TrendingUp, Package, DollarSign, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

export default function DashboardHome() {
  const { restaurant } = useOutletContext<any>();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (restaurant?.id) {
      fetchAnalytics();
    }
  }, [restaurant?.id]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/v1/restaurants/${restaurant.id}/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="auth-title" style={{ fontSize: '2rem', textAlign: 'left', marginBottom: '0.25rem' }}>
          Welcome back, {restaurant?.name}! 👋
        </h1>
        <p className="auth-subtitle" style={{ textAlign: 'left' }}>
          Here is your performance overview.
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-light)' }}>Loading analytics...</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div>
                <div className="stat-label">Total Revenue</div>
                <div className="stat-value">₨ {(analytics?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
              <div style={{ padding: '12px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%' }}>
                <DollarSign size={24} />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">Total Orders Delivered</div>
                <div className="stat-value">{analytics?.totalOrders || 0}</div>
              </div>
              <div style={{ padding: '12px', background: '#e0e7ff', color: '#4f46e5', borderRadius: '50%' }}>
                <Package size={24} />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">Avg. Order Value</div>
                <div className="stat-value">₨ {(analytics?.averageOrderValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
              <div style={{ padding: '12px', background: '#fef3c7', color: '#d97706', borderRadius: '50%' }}>
                <TrendingUp size={24} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginTop: '2rem' }}>
            {/* Top Products Chart */}
            <div className="glass-container" style={{ padding: '2rem', background: 'white', borderRadius: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} color="var(--primary-color)" /> Top Selling Products
              </h2>
              
              {analytics?.topProducts && analytics.topProducts.length > 0 ? (
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={analytics.topProducts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="quantity" fill="var(--primary-color)" radius={[6, 6, 0, 0]} barSize={40} name="Units Sold" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  No sales data available yet.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div className="glass-container" style={{ padding: '2rem', background: 'white', animation: 'fadeIn 0.7s ease-out' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>Recent Orders</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: 'var(--text-light)', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
          <Package size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
          <p>No orders yet today. You're all caught up!</p>
        </div>
      </div>

      <div className="glass-container" style={{ padding: '2rem', background: 'white', marginTop: '2rem', animation: 'fadeIn 0.8s ease-out' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>Delivery Zone Configuration (QB-606)</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>
          Configure your maximum delivery radius. Riders will only be assigned to orders within this zone.
        </p>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
              Maximum Delivery Radius (km)
            </label>
            <input 
              type="number" 
              defaultValue={restaurant?.deliveryRadiusKm || 5} 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            />
          </div>
          <button style={{ marginTop: '1.5rem', background: 'var(--primary-color)', color: 'white', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

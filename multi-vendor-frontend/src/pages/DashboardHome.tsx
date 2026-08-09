import { useOutletContext } from 'react-router-dom';
import { TrendingUp, Package, DollarSign } from 'lucide-react';

export default function DashboardHome() {
  const { restaurant } = useOutletContext<any>();

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="auth-title" style={{ fontSize: '2rem', textAlign: 'left', marginBottom: '0.25rem' }}>
          Welcome back, {restaurant?.name}! 👋
        </h1>
        <p className="auth-subtitle" style={{ textAlign: 'left' }}>
          Here is what's happening with your store today.
        </p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Today's Revenue</div>
            <div className="stat-value">$0.00</div>
          </div>
          <div style={{ padding: '12px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%' }}>
            <DollarSign size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Active Orders</div>
            <div className="stat-value">0</div>
          </div>
          <div style={{ padding: '12px', background: '#e0e7ff', color: '#4f46e5', borderRadius: '50%' }}>
            <Package size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Menu Items</div>
            <div className="stat-value">0</div>
          </div>
          <div style={{ padding: '12px', background: '#fef3c7', color: '#d97706', borderRadius: '50%' }}>
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      <div className="glass-container" style={{ padding: '2rem', background: 'white', animation: 'fadeIn 0.7s ease-out' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>Recent Orders</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: 'var(--text-light)', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
          <Package size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
          <p>No orders yet today. You're all caught up!</p>
        </div>
      </div>
    </div>
  );
}

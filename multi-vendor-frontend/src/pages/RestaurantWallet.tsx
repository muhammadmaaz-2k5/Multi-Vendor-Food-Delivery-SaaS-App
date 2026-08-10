import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Wallet, ArrowRight, ExternalLink, Activity, DollarSign, Clock } from 'lucide-react';
import { API_URL, getAuthHeaders } from '../lib/api';

export default function RestaurantWallet() {
  const { restaurant } = useOutletContext<any>();
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (restaurant?.id) {
      fetchWallet();
    }
  }, [restaurant]);

  const fetchWallet = async () => {
    try {
      const res = await fetch(`${API_URL}/restaurants/${restaurant.id}/wallet`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setWalletData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStripeDashboard = async () => {
    setRedirecting(true);
    try {
      const res = await fetch(`${API_URL}/payments/stripe/dashboard-link`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders()
        },
        body: JSON.stringify({ tenantId: restaurant.id })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Could not generate dashboard link.');
      }
    } catch (error) {
      console.error(error);
      alert('Error connecting to Stripe.');
    } finally {
      setRedirecting(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Wallet...</div>;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: '900px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="auth-title" style={{ fontSize: '2rem', textAlign: 'left', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Wallet size={32} color="var(--primary-color)" /> Restaurant Wallet
        </h1>
        <p className="auth-subtitle" style={{ textAlign: 'left' }}>
          Manage your earnings and request payouts to your bank account via Stripe.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        {/* Earnings Card */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.875rem', margin: 0 }}>Total Net Earnings</p>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, color: '#0f172a', margin: '0.5rem 0' }}>
            ₨ {(walletData?.totalEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h2>
          <p style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 500, margin: 0 }}>
            <Activity size={16} /> Earnings updated in real-time
          </p>
        </div>

        {/* Action Card */}
        <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Stripe Express Dashboard</h3>
          <p style={{ opacity: 0.9, lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
            Your funds are securely held by Stripe. Access your Express dashboard to manage your connected bank account, view detailed transfer histories, and manually trigger payouts.
          </p>
          <button 
            onClick={handleStripeDashboard}
            disabled={redirecting}
            style={{ width: '100%', padding: '1rem', background: 'white', color: '#4f46e5', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            {redirecting ? 'Generating Link...' : 'Open Stripe Dashboard'} 
            <ExternalLink size={20} />
          </button>
        </div>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>Recent Processed Orders</h3>
        
        {walletData?.recentOrders?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No completed orders yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {walletData?.recentOrders?.map((order: any) => (
              <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: '#f1f5f9', padding: '0.75rem', borderRadius: '8px', color: '#64748b' }}>
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontWeight: 600, color: '#1e293b' }}>Order from {order.customerName}</h4>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={14} /> {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: '#dcfce7', color: '#16a34a', borderRadius: '50px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    + ₨ {order.tenantEarnings.toFixed(2)}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Status: {order.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

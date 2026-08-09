import React, { useState, useEffect } from 'react';
import { Search, Package, Clock, CheckCircle, Truck, Utensils } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function CustomerOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPhone = searchParams.get('phone') || '';
  const [phone, setPhone] = useState(initialPhone);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrders = async (phoneNumber: string) => {
    if (!phoneNumber) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:5000/api/v1/orders/customer/${phoneNumber}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPhone) {
      fetchOrders(initialPhone);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ phone });
    fetchOrders(phone);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT': return <Clock size={20} className="text-yellow-500" />;
      case 'PAID': return <CheckCircle size={20} className="text-blue-500" />;
      case 'PREPARING': return <Utensils size={20} className="text-orange-500" />;
      case 'OUT_FOR_DELIVERY': return <Truck size={20} className="text-purple-500" />;
      case 'DELIVERED': return <CheckCircle size={20} className="text-green-500" />;
      default: return <Package size={20} />;
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>My Orders</h1>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <input 
          type="tel" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
          placeholder="Enter phone number (e.g. 0300...)" 
          className="search-input" 
          style={{ flex: 1 }} 
          required 
        />
        <button type="submit" style={{ padding: '0.75rem 1.5rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={18} /> Find Orders
        </button>
      </form>

      {loading && <p>Loading orders...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px', color: 'var(--text-light)' }}>
          <Package size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
          <p>No orders found for this phone number.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {orders.map((order) => (
          <div key={order.id} style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{order.tenant.name}</h3>
                <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#f8fafc', borderRadius: '9999px', fontWeight: 600 }}>
                {getStatusIcon(order.status)}
                {order.status.replace(/_/g, ' ')}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              {order.items.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  <span><span style={{ fontWeight: 600 }}>{item.quantity}x</span> {item.name}</span>
                  <span>₨ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', fontWeight: 800, fontSize: '1.1rem' }}>
              <span>Total Amount</span>
              <span>₨ {order.totalAmount.toFixed(2)}</span>
            </div>

            {/* Status History Timeline */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-light)' }}>ORDER TIMELINE</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {order.statusHistory.map((history: any) => (
                  <div key={history.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', fontSize: '0.85rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color)', marginTop: '6px' }}></div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{history.status.replace(/_/g, ' ')}</div>
                      <div style={{ color: 'var(--text-light)' }}>{new Date(history.createdAt).toLocaleTimeString()} {history.notes && `- ${history.notes}`}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

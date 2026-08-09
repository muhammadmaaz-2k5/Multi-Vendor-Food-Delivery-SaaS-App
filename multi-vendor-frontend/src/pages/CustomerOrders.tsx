import React, { useState, useEffect } from 'react';
import { Search, Package, Clock, CheckCircle, Truck, Utensils, Star, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

export default function CustomerOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPhone = searchParams.get('phone') || '';
  const [phone, setPhone] = useState(initialPhone);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [riderLocations, setRiderLocations] = useState<Record<string, { lat: number, lng: number }>>({});
  
  const [reviewModalOrder, setReviewModalOrder] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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

    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to Customer Orders Socket');
    });

    newSocket.on('order.updated', (updatedOrder: any) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    });

    newSocket.on('rider_location_updated', (data: { lat: number, lng: number }) => {
      // Assuming 1 active order for MVP, or we can key by order ID if we passed it back
      setRiderLocations(prev => ({
        ...prev,
        latest: { lat: data.lat, lng: data.lng } 
      }));
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    // When orders change, join rooms for any active orders
    if (socket && socket.connected) {
      orders.forEach(order => {
        if (order.status !== 'DELIVERED' && order.status !== 'CANCELLED') {
          socket.emit('join_order_room', order.id);
        }
      });
    }
  }, [orders, socket]);

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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalOrder) return;
    setIsSubmittingReview(true);
    
    try {
      const res = await fetch(`http://localhost:5000/api/v1/orders/${reviewModalOrder.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...reviewForm, customerName: reviewModalOrder.customerName })
      });
      const data = await res.json();
      if (data.success) {
        // Optimistically update order
        setOrders(prev => prev.map(o => o.id === reviewModalOrder.id ? { ...o, review: data.data } : o));
        setReviewModalOrder(null);
        setReviewForm({ rating: 5, comment: '' });
      } else {
        alert(data.error || 'Failed to submit review');
      }
    } catch (err) {
      console.error(err);
      alert('Network error submitting review');
    } finally {
      setIsSubmittingReview(false);
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
              <div style={{ paddingLeft: '1.5rem', borderLeft: '2px solid #ff2b5e', marginLeft: '0.5rem', marginTop: '1rem', color: '#64748b' }}>
                  <p>Order created at {new Date(order.createdAt).toLocaleTimeString()}</p>
                  
                  {order.status === 'OUT_FOR_DELIVERY' && riderLocations.latest && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                      <p style={{ fontWeight: 700, color: '#1d4ed8', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                        <Truck size={16} /> Rider is on the way!
                      </p>
                      
                      <div style={{ width: '100%', height: '250px', borderRadius: '8px', overflow: 'hidden' }}>
                        <Map
                          initialViewState={{
                            longitude: riderLocations.latest.lng,
                            latitude: riderLocations.latest.lat,
                            zoom: 14
                          }}
                          longitude={riderLocations.latest.lng}
                          latitude={riderLocations.latest.lat}
                          style={{width: '100%', height: '100%'}}
                          mapStyle="mapbox://styles/mapbox/streets-v12"
                          mapboxAccessToken={MAPBOX_TOKEN}
                        >
                          <Marker 
                            longitude={riderLocations.latest.lng} 
                            latitude={riderLocations.latest.lat} 
                            anchor="bottom"
                          >
                            <div style={{
                              background: '#ff2b5e',
                              color: 'white',
                              borderRadius: '50%',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                              border: '2px solid white'
                            }}>
                              <Truck size={16} />
                            </div>
                          </Marker>
                        </Map>
                      </div>
                      <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
                        Live Mapbox Tracking Enabled
                      </p>
                    </div>
                  )}
              </div>
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

            {order.status === 'DELIVERED' && !order.review && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                <button 
                  onClick={() => setReviewModalOrder(order)}
                  style={{ width: '100%', padding: '1rem', background: 'white', color: 'var(--primary-color)', border: '2px solid var(--primary-color)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Star size={18} fill="currentColor" /> Leave a Review
                </button>
              </div>
            )}
            {order.status === 'DELIVERED' && order.review && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '12px', border: '1px solid #fde68a' }}>
                  <p style={{ margin: 0, fontWeight: 700, color: '#d97706', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Star size={18} fill="currentColor" /> You rated this {order.review.rating}/5 stars
                  </p>
                  {order.review.comment && <p style={{ margin: '0.5rem 0 0 0', color: '#92400e', fontSize: '0.9rem' }}>"{order.review.comment}"</p>}
                </div>
              </div>
            )}

          </div>
        ))}
      </div>

      {/* Review Modal */}
      {reviewModalOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', width: '90%', maxWidth: '400px', position: 'relative' }}>
            <button 
              onClick={() => setReviewModalOrder(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a', textAlign: 'center' }}>How was your food?</h2>
            <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '1.5rem' }}>{reviewModalOrder.tenant.name}</p>
            
            <form onSubmit={handleReviewSubmit}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={36} 
                    color={star <= reviewForm.rating ? '#fbbf24' : '#e2e8f0'}
                    fill={star <= reviewForm.rating ? '#fbbf24' : 'transparent'}
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                  />
                ))}
              </div>

              <textarea 
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="What did you like or dislike?"
                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '100px', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '1.5rem', background: '#f8fafc' }}
              ></textarea>

              <button 
                type="submit"
                disabled={isSubmittingReview}
                style={{ width: '100%', padding: '1rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1.1rem', cursor: isSubmittingReview ? 'not-allowed' : 'pointer' }}
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

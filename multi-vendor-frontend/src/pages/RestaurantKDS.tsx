import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { Utensils, Clock, CheckCircle } from 'lucide-react';

interface Order {
  id: string;
  customerName: string;
  status: string;
  createdAt: string;
  items: any[];
  estimatedPrepTime?: number; // In minutes, optional for now, fallback to 15
}

// Sub-component to handle live ticking timer without re-rendering the whole board
const OrderTimer = ({ createdAt, estimatedPrepTime = 15 }: { createdAt: string, estimatedPrepTime?: number }) => {
  const [elapsedMins, setElapsedMins] = useState(0);

  useEffect(() => {
    const calculateTime = () => {
      const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
      setElapsedMins(diff);
    };
    
    calculateTime();
    const interval = setInterval(calculateTime, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [createdAt]);

  // Visual cues based on how close we are to the estimated prep time
  let color = 'var(--text-light)';
  if (elapsedMins >= estimatedPrepTime) {
    color = '#ef4444'; // Red (Late!)
  } else if (elapsedMins >= estimatedPrepTime - 5) {
    color = '#f59e0b'; // Orange (Warning)
  }

  return (
    <span style={{ color, fontSize: '0.9rem', fontWeight: elapsedMins >= estimatedPrepTime ? 800 : 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
      <Clock size={14} />
      {elapsedMins}m / {estimatedPrepTime}m
    </span>
  );
};

export default function RestaurantKDS() {
  const { tenantId } = useParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // 1. Initial Load
    fetch(`https://multi-vendor-food-delivery-saa-s-ap.vercel.app/api/v1/orders/tenant/${tenantId}`)
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error('Error fetching KDS orders:', err));

    // 2. Socket Connection
    const newSocket = io('https://multi-vendor-food-delivery-saa-s-ap.vercel.app');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to KDS socket');
      newSocket.emit('join_tenant_room', tenantId);
    });

    newSocket.on('order.created', (newOrder: Order) => {
      setOrders(prev => [...prev, newOrder]);
      // Play a notification sound in real app!
    });

    newSocket.on('order.updated', (updatedOrder: Order) => {
      setOrders(prev => {
        if (updatedOrder.status === 'DELIVERED' || updatedOrder.status === 'CANCELLED') {
          return prev.filter(o => o.id !== updatedOrder.id);
        }
        return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [tenantId]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`https://multi-vendor-food-delivery-saa-s-ap.vercel.app/api/v1/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      // We don't manually update state here because the socket will broadcast 'order.updated' 
      // back to us, ensuring true real-time sync across all open KDS screens!
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const renderColumn = (title: string, status: string, nextStatus: string | null, btnText: string, icon: any, color: string) => {
    const columnOrders = orders.filter(o => o.status === status);
    return (
      <div style={{ flex: 1, minWidth: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1rem', border: `1px solid ${color}30` }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {icon} {title} ({columnOrders.length})
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {columnOrders.map(order => (
            <div key={order.id} style={{ background: 'white', borderRadius: '12px', padding: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderLeft: '4px solid ' + color }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 800 }}>#{order.id.slice(0,6).toUpperCase()}</span>
                <OrderTimer createdAt={order.createdAt} estimatedPrepTime={15} />
              </div>
              <div style={{ fontWeight: 600, marginBottom: '1rem' }}>{order.customerName}</div>
              <ul style={{ padding: 0, margin: '0 0 1.5rem 0', listStyle: 'none' }}>
                {order.items?.map(item => (
                  <li key={item.id} style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700 }}>{item.quantity}x</span> {item.name}
                  </li>
                ))}
              </ul>
              {nextStatus && (
                <button 
                  onClick={() => updateStatus(order.id, nextStatus)}
                  style={{ width: '100%', padding: '0.75rem', background: color, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {btnText}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '2rem', fontFamily: "'Inter', sans-serif" }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: 900 }}>Kitchen Display System (KDS)</h1>
        <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: socket?.connected ? '#10b981' : '#ef4444' }}></div>
          {socket?.connected ? 'Live Sync' : 'Disconnected'}
        </div>
      </header>

      <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
        {renderColumn('New Orders', 'PAID', 'PREPARING', 'Start Preparing', <Clock size={20} />, '#3b82f6')}
        {renderColumn('Preparing', 'PREPARING', 'READY', 'Mark as Ready', <Utensils size={20} />, '#f59e0b')}
        {renderColumn('Ready for Pickup', 'READY', 'DELIVERED', 'Hand to Rider/Customer', <CheckCircle size={20} />, '#10b981')}
      </div>
    </div>
  );
}

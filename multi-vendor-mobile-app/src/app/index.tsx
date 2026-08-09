import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { io, Socket } from 'socket.io-client';

const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api/v1' : 'http://localhost:5000/api/v1';

export default function RiderHomeScreen() {
  const [rider, setRider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [assignedOrder, setAssignedOrder] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // GPS State
  const [currentLat, setCurrentLat] = useState(37.7749);
  const [currentLng, setCurrentLng] = useState(-122.4194);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Initialize socket once we have a rider profile
  useEffect(() => {
    if (rider && rider.id) {
      const newSocket = io(API_URL.replace('/api/v1', ''));
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Rider connected to socket');
        newSocket.emit('join_rider_room', rider.id);
      });

      newSocket.on('order.assigned', (order: any) => {
        console.log('Got assigned order!', order.id);
        setAssignedOrder(order);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [rider?.id]);

  // Simulate Rider Movement (QB-604)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (assignedOrder && assignedOrder.status === 'OUT_FOR_DELIVERY' && socket) {
      interval = setInterval(() => {
        // Move the rider slightly north-east
        setCurrentLat(prev => prev + 0.0001);
        setCurrentLng(prev => prev + 0.0001);
        
        socket.emit('rider_location_update', {
          riderId: rider.id,
          orderId: assignedOrder.id,
          lat: currentLat,
          lng: currentLng
        });
      }, 3000); // Every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [assignedOrder?.status, currentLat, currentLng, socket]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/riders/me`);
      const data = await res.json();
      setRider(data);
    } catch (error) {
      console.error('Error fetching rider:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    if (!rider) return;
    setToggling(true);
    try {
      const newStatus = !rider.isOnline;
      // Basic location mock for MVP
      const mockLat = 37.7749;
      const mockLng = -122.4194;

      const res = await fetch(`${API_URL}/riders/${rider.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: newStatus, lat: mockLat, lng: mockLng })
      });
      const updated = await res.json();
      setRider(updated);
    } catch (error) {
      console.error('Error toggling status:', error);
    } finally {
      setToggling(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!assignedOrder) return;
    try {
      const res = await fetch(`${API_URL}/orders/${assignedOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const updated = await res.json();
      
      if (newStatus === 'DELIVERED') {
        setAssignedOrder(null); // Clear the order once delivered
      } else {
        setAssignedOrder(updated);
      }
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff2b5e" />
      </View>
    );
  }

  if (!rider) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load rider profile.</Text>
      </View>
    );
  }

  const isOnline = rider.isOnline;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {rider.user?.firstName}!</Text>
        <Text style={styles.subtitle}>Ready for deliveries?</Text>
      </View>

      {/* Main Toggle Area */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: isOnline ? '#10b981' : '#ef4444' }]} />
        <Text style={styles.statusText}>{isOnline ? 'You are ONLINE' : 'You are OFFLINE'}</Text>
        
        <TouchableOpacity 
          style={[styles.toggleButton, { backgroundColor: isOnline ? '#ef4444' : '#10b981' }]}
          onPress={toggleStatus}
          disabled={toggling}
        >
          <Text style={styles.toggleButtonText}>
            {toggling ? 'Updating...' : isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Delivery or Placeholder */}
      {isOnline && !assignedOrder && (
        <View style={styles.activeDeliveryCard}>
          <ActivityIndicator size="small" color="#ff2b5e" style={{ marginBottom: 10 }} />
          <Text style={styles.searchingText}>Searching for nearby orders...</Text>
          <Text style={styles.searchingSubtext}>Stay on this screen to receive assignments.</Text>
        </View>
      )}

      {isOnline && assignedOrder && (
        <ScrollView style={styles.assignedCard}>
          <Text style={styles.assignedTitle}>New Delivery Assigned!</Text>
          
          <View style={styles.orderDetailBox}>
            <Text style={styles.orderDetailLabel}>Pickup From:</Text>
            <Text style={styles.orderDetailText}>{assignedOrder.tenant?.name || 'Restaurant'}</Text>
          </View>
          
          <View style={styles.orderDetailBox}>
            <Text style={styles.orderDetailLabel}>Deliver To:</Text>
            <Text style={styles.orderDetailText}>{assignedOrder.customerName}</Text>
            <Text style={styles.orderDetailText}>{assignedOrder.deliveryAddress}</Text>
            <Text style={styles.orderDetailText}>📞 {assignedOrder.customerPhone}</Text>
          </View>

          {assignedOrder.status === 'READY' && (
             <TouchableOpacity style={styles.actionBtn} onPress={() => updateOrderStatus('OUT_FOR_DELIVERY')}>
               <Text style={styles.actionBtnText}>Pick Up Order</Text>
             </TouchableOpacity>
          )}

          {assignedOrder.status === 'OUT_FOR_DELIVERY' && (
             <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10b981' }]} onPress={() => updateOrderStatus('DELIVERED')}>
               <Text style={styles.actionBtnText}>Mark as Delivered</Text>
             </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  statusContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statusIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#f1f5f9',
  },
  statusText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 32,
  },
  toggleButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  activeDeliveryCard: {
    marginTop: 24,
    backgroundColor: '#ff2b5e15',
    borderWidth: 1,
    borderColor: '#ff2b5e30',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  searchingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff2b5e',
  },
  searchingSubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  assignedCard: {
    marginTop: 24,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  assignedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#3b82f6',
    marginBottom: 16,
    textAlign: 'center',
  },
  orderDetailBox: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  orderDetailLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  orderDetailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  actionBtn: {
    backgroundColor: '#ff2b5e',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  actionBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  }
});

const { Server: SocketIOServer } = require('socket.io');

const { Server: HttpServer } = require('http');


let io: any;

const initSocket = (server: any) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: 'http://localhost:3000', // Frontend URL
      methods: ['GET', 'POST', 'PATCH']
    }
  });

  io.on('connection', (socket: any) => {
    console.log('New client connected:', socket.id);

    // Restaurants will join a specific room for their tenantId
    socket.on('join_tenant_room', (tenantId: string) => {
      const roomName = `tenant_${tenantId}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room ${roomName}`);
    });

    // Customers will join a specific room for tracking their order
    socket.on('join_order_room', (orderId: string) => {
      const roomName = `order_${orderId}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room ${roomName}`);
    });

    // Riders will join a specific room for their riderId
    socket.on('join_rider_room', (riderId: string) => {
      const roomName = `rider_${riderId}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room ${roomName}`);
    });

    // Handle Rider GPS Updates (QB-604)
    socket.on('rider_location_update', (data: { riderId: string, orderId: string, lat: number, lng: number }) => {
      // Broadcast to the specific customer order room
      if (data.orderId) {
        io.to(`order_${data.orderId}`).emit('rider_location_updated', {
          lat: data.lat,
          lng: data.lng,
          timestamp: new Date()
        });
      }
      
      // Note: In production, we would also throttle/debounce updates to the database here
      // e.g. prisma.rider.update({ where: { id: data.riderId }, data: { currentLat: data.lat, ... }})
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};
exports.initSocket = initSocket;


const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
exports.getIO = getIO;


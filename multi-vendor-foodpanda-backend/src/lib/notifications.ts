import { getIO } from './socket.js';

/**
 * Notification Service
 * For the MVP, this logs to the console to simulate SMS/Email gateways (like Twilio or SendGrid),
 * while simultaneously emitting real-time Socket.io events for in-app notifications.
 */

export const NotificationService = {
  
  async sendCustomerNotification(phone: string, title: string, body: string) {
    // 1. Mock SMS/Email Gateway
    console.log(`\n📨 [MOCK SMS to ${phone}]`);
    console.log(`Title: ${title}`);
    console.log(`Body: ${body}\n`);

    // 2. In-App Notification (Real-time)
    // If we wanted a generic customer notification channel, we could use a phone-based room:
    try {
      const io = getIO();
      io.to(`customer_${phone}`).emit('notification', { title, body, timestamp: new Date() });
    } catch (err) {
      // Socket might not be initialized in some worker contexts, ignore safely
    }
  },

  async sendTenantNotification(tenantId: string, title: string, body: string) {
    // 1. Mock Email Gateway to Restaurant Owner
    console.log(`\n📧 [MOCK EMAIL to Tenant ${tenantId}]`);
    console.log(`Subject: ${title}`);
    console.log(`Body: ${body}\n`);

    // 2. In-App Notification (Real-time) to the KDS or Dashboard
    try {
      const io = getIO();
      io.to(`tenant_${tenantId}`).emit('notification', { title, body, timestamp: new Date(), type: 'alert' });
    } catch (err) {
      // Ignore safely
    }
  }

};

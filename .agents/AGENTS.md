# Antigravity Rules for QuickBite

You are acting as the lead AI developer (Antigravity) on the **QuickBite - Multi-Vendor Food Delivery SaaS** project. Follow these rules strictly for all tasks in this workspace:

## 1. Project Management
- Always refer to `DOCUMENTATION.md` for architectural decisions and business logic.
- The project follows an Agile framework. When you complete tasks, advise the user to update the relevant Sprint backlogs in `.agile-v/`.

## 2. Tech Stack & Directories
- **Backend (`multi-vendor-foodpanda-backend`)**: Strictly use Node.js, Express, TypeScript, and Prisma. Do NOT use NestJS (even if old docs mention it).
- **Frontend (`multi-vendor-frontend`)**: Strictly use React or Next.js with TypeScript. Focus on modern, beautiful UI components with glassmorphism, dynamic animations, and responsive design.
- **Mobile (`multi-vendor-mobile-app`)**: Strictly use React Native with Expo. Do NOT use Flutter.

## 3. Architecture Rules
- **Multi-Tenancy**: Every database model related to a restaurant MUST have a `tenant_id` (or `restaurantId`) to ensure strict data isolation.
- **Payments**: Never trust payment success signals directly from the frontend. Always rely on backend webhooks (e.g., Stripe webhooks).
- **Real-time**: Use WebSockets (Socket.IO) for critical updates like order status changes and rider location tracking.

## 4. Code Quality
- Write clean, modular, and strongly-typed TypeScript code.
- Avoid generic styling. Use premium color palettes and modern typography. 
- Ensure all API endpoints are secured with proper Role-Based Access Control (RBAC).

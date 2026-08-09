# 🍔 QuickBite — Multi-Vendor Food Delivery SaaS

**QuickBite** is a production-grade multi-tenant food delivery marketplace connecting customers, restaurants, kitchens, and delivery riders. 

## 🚀 Project Overview

The platform enables restaurants of any size to launch and operate their own online food-delivery business without building their own technology infrastructure. It handles real-time order tracking, payment processing, commission management, role-based access control, analytics, and AI-powered business insights.

## 🛠️ Technology Stack

Instead of a monolithic approach, the project uses three distinct repositories/folders for a clean separation of concerns:

- **Frontend (`multi-vendor-frontend`):** React/Next.js + TypeScript + Redux RTK
- **Backend (`multi-vendor-foodpanda-backend`):** Node.js (Express) + TypeScript, PostgreSQL + Prisma, Redis + BullMQ
- **Mobile (`multi-vendor-mobile-app`):** React Native (Expo)
- **Infrastructure:** Docker, GitHub Actions CI/CD
- **Integrations:** Stripe (Payments), Mapbox/Google Maps (Location), WebSockets/Socket.IO (Real-time tracking)

## 📂 Directory Structure

- `multi-vendor-foodpanda-backend/`: The Express API and background workers.
- `multi-vendor-frontend/`: The customer, restaurant, and admin web dashboards.
- `multi-vendor-mobile-app/`: The Expo-based mobile application for customers and riders.
- `.agile-v/`: Contains the Agile/Scrum project management files (Sprints, Epics, Backlog).
- `DOCUMENTATION.md`: The complete, detailed architectural roadmap and specifications.

## 🏃‍♂️ Getting Started (Development)

Detailed instructions for running the individual services can be found in their respective directories. 
To view our development roadmap, check out the [Agile Workspace](./.agile-v/README.md).

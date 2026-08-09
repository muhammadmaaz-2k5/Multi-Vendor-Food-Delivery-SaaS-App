# 🎯 Sprint 01: Platform Foundation

**Sprint Goal:** Establish the core infrastructure, multi-tenant database schema, and authentication system so that other modules can be built on top of a solid foundation.

**Duration:** 2 Weeks  
**Status:** 🏃‍♂️ IN PROGRESS

## 📋 Sprint Backlog

| Task ID | Description | Assignee | Status | Story Points |
| :--- | :--- | :--- | :--- | :--- |
| **QB-101** | Init Frontend, Express Backend, and Expo Mobile app | TBD | 🚧 In Progress | 3 |
| **QB-102** | Design Prisma Schema (Users, Tenants, Roles) | TBD | 📝 To Do | 5 |
| **QB-103** | Implement Auth Module (JWT) in Express/Node.js | TBD | 📝 To Do | 5 |
| **QB-104** | Setup Redis & BullMQ foundation | TBD | 📝 To Do | 3 |
| **QB-105** | CI/CD Pipeline setup (GitHub Actions) | TBD | 📝 To Do | 2 |

## 🛑 Blockers / Risks
- [ ] Finalizing the exact structure of the `tenant_id` injection in Prisma middleware to ensure data isolation.

## 🏁 Definition of Done (DoD)
- Code compiles and builds without errors.
- Unit tests pass.
- Code reviewed by at least one peer.
- Deployed to staging environment.

# 🍅 Tomato Backend Microservices

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white" alt="Express 5">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/MongoDB-Latest-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Socket.io-Latest-010101?logo=socket.io&logoColor=white" alt="Socket.io">
</p>

---

## 🚀 Overview

This repository contains the core backend infrastructure for the **Tomato** platform. Built with a scalable microservices architecture, it handles high-concurrency operations for a modern food delivery ecosystem.

## 🏗️ Architecture

The backend is composed of several specialized microservices:

- 🛡️ **Auth Service**: User authentication, Google OAuth integration, and JWT management.
- 🍽️ **Restaurant Service**: Management of restaurant profiles, menus, and order workflows.
- 🚴 **Rider Service**: Real-time dispatching and coordination of delivery riders.
- ⚡ **Realtime Service**: WebSocket-based hub for live order tracking and notifications.
- 🛠️ **Admin Service**: Centralized control for platform management.
- 📦 **Utils**: Shared logic and helper functions across all services.

---

## 🛠️ Technology Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express 5 (TypeScript)
- **Database**: MongoDB (Mongoose ODM)
- **Communication**: Socket.io (WebSockets)
- **Security**: BCrypt hashing, JWT (JSON Web Tokens)

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB installed locally or a MongoDB Atlas URI

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Navigate to each service directory and create a `.env` file based on the required secrets (DB URIs, JWT secrets, OAuth client IDs).

3. **Running Services**
   You can run each service individually or use the root workspace commands (if available):
   ```bash
   # Example for Auth service
   cd auth
   npm run dev
   ```

---

## 📁 Repository Structure

```text
/
├── auth/           # Identity Management & Security
├── restaurant/     # Business Logic for Partners
├── rider/          # Logistics & Dispatch
├── admin/          # Platform Governance
├── realtime/       # Live Event Hub
└── utils/          # Cross-cutting Concerns
```

---

<p align="center">
  Engineered for performance and reliability.
</p>

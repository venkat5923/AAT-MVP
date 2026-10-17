# Akanksha Agree Tech (AAT) — MVP & Vertical Slice

**Agricultural Mechanization Marketplace Platform**  
Operating across **61 Reference Districts** in Andhra Pradesh & Telangana.

---

## 🌾 Overview
Akanksha Agree Tech (AAT) connects farmers with verified tractor equipment providers, supervised by operations staff:
$$\text{Farmer Request} \longrightarrow \text{Provider Matching} \longrightarrow \text{Itemized Quote} \longrightarrow \text{Ops Price Review} \longrightarrow \text{Quotation Selection} \longrightarrow \text{Confirmed Booking} \longrightarrow \text{Trip Tracking} \longrightarrow \text{Completion OTP}$$

---

## 🚀 Quick Start (Runs Out of the Box)

### 1. Requirements
* Node.js v18+ (tested and verified on Node.js v24 on Windows)
* npm v9+

### 2. Install & Build
```bash
npm install
npm run build
```

### 3. Run Automated End-to-End Tests
Exercises all 12 stages of the vertical slice (seeding $\rightarrow$ matching $\rightarrow$ quotation submission $\rightarrow$ ops price review $\rightarrow$ quotation selection $\rightarrow$ completion OTP verification):
```bash
npm test
```

### 4. Start Development Servers
Runs the API server (Port 4000), Outbox Worker, and React Frontend (Port 3000) concurrently:
```bash
npm run dev
```

Visit the web application at: **`http://localhost:3000`**

---

## 👥 Deterministic Test Personas

The database is pre-seeded with deterministic accounts (use test OTP: `123456`):

| Persona | Name | Mobile Phone | Role / Scope |
| :--- | :--- | :--- | :--- |
| **Farmer** | Ramesh Reddy | `+919876543210` | Owns 2 farms in Guntur & Amaravati |
| **Provider 1** | Siva Kumar Agri Mechanization | `+919876543211` | Mahindra 575 DI (45 HP) w/ Rotavator (Radius: 30 km) |
| **Provider 2** | Krishna Krishi Implements | `+919876543212` | John Deere 5050D (50 HP) w/ Cultivator (Radius: 35 km) |
| **Operations Staff** | Vijayawada Ops Hub | `+919876543213` | Reviews and clears quotes before farmer visibility |
| **Platform Admin** | System Admin | `+919876543214` | Global catalog & district administration |

---

## 🏛️ System Architecture

* **Modular Monolith**:
  * `apps/api`: Express.js REST API under `/api/v1` with correlation IDs and structured logs.
  * `apps/worker`: Transactional outbox event processor with retry & dead-letter tracking.
  * `apps/web`: React + Vite web client tailored for high-contrast daylight legibility.
  * `packages/contracts`: Shared TypeScript types, DTOs, and lifecycle states.
  * `packages/database`: Dual adapter (Pure WebAssembly SQLite for zero-config local run, PostgreSQL for staging/prod).
  * `packages/domain`: Matching engine, price calculator, atomic row-locked selection, and OTP verifier.
  * `packages/observability`: Correlation IDs and sensitive-data redaction.
* **Database Model (25 Tables)**:
  * Complete relational schema covering users, roles, sessions, consents, farms, providers, tractor services, service fields, 61 AP/TG districts, requests, invitations, quotations, quotation lines, price reviews, bookings, status history, audit events, outbox events, and notification intents.
* **30 Design Anti-Patterns Strictly Avoided**:
  * No harsh gradients, no purple/black glow, no neon or washed-out pastels.
  * No fake testimonials, no generic 3-tier pricing, no decorative emojis.
  * Genuine skeleton loaders during matching and data fetching.
  * High-contrast daylight readability suitable for field operations.
  * Authentic Terms of Service and Farmer Privacy Policies.

---

## 📖 API Documentation
OpenAPI 3.0 specification is available at `docs/openapi/openapi.json`.
Health check endpoint: `GET http://localhost:4000/health`.

# 🚀 Autonomous Sales Assistant

An end-to-end, AI-native B2B lead management and sales orchestration platform built to transform unstructured prospect data into qualified pipeline strategy, structured scoring, and actionable outreach.

![Build Status](https://github.com/harshvardhanongithub/autonomous-sales-assistant/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![React](https://img.shields.io/badge/Frontend-React_19_|_Tailwind_CSS-blue)
![Express](https://img.shields.io/badge/Backend-Express.js_|_MongoDB-green)

---

## 📌 Executive Summary

The Autonomous Sales Assistant bridges modern LLM reasoning with automated enterprise workflows. Instead of relying on manual CRM data entry, the system ingests raw lead inputs, runs multi-pass qualification models via an automated orchestration engine, persists verified data across a modern full-stack web application, and surfaces real-time sales intelligence through an intuitive dashboard.

---

## 🌐 Live Production Links

* **Live Web Application:** [autonomous-sales-assistant-1k5k.vercel.app](https://autonomous-sales-assistant-1k5k.vercel.app)
* **Backend API Gateway:** `https://autonomous-sales-assistant.onrender.com`

---

## 🏗️ Technical Architecture & Stack

The platform is engineered using a decoupled, multi-tier architecture to ensure operational reliability, minimal latency, and strict schema validation across all stages.

* **Automation & AI Orchestration:** n8n Workflow Automation, Custom Webhook Listeners, LLM API Interfaces
* **Backend REST API:** Node.js, Express.js (ES Modules), JWT Authentication, Helmet HTTP Security, Rate Limiting Middleware
* **Automated Testing & CI/CD:** Jest, Supertest integration test suite, Automated GitHub Actions Workflow (`.github/workflows/ci.yml`)
* **Frontend Application:** React 19, Vite, Tailwind CSS, Lucide Icons, React Router DOM
* **Database & Persistence:** MongoDB Atlas (Mongoose ODM)
* **Production Deployment:** Vercel (Frontend Single Page Application), Render (Backend Express Web Service)

---

## 🔄 End-to-End System Journey

```
[ Unstructured Inbound Lead ]
             │
             ▼
 ┌──────────────────────┐
 │  n8n Automation Hub  │ ──► Multi-pass LLM Reasoning & Schema Validation
 └──────────────────────┘
             │
             ▼
 ┌──────────────────────┐
 │   Express REST API   │ ──► JWT Auth Middleware & Route Protection
 └──────────────────────┘
             │
             ├────────────────────────┐
             ▼                        ▼
 ┌──────────────────────┐  ┌──────────────────────┐
 │   MongoDB Atlas DB   │  │   React / Vite UI    │
 └──────────────────────┘  └──────────────────────┘
```

### 1. AI Orchestration & Workflow Engine (n8n)
* **Asynchronous Webhook Ingestion:** Captures inbound lead payloads from external webhooks and CRM integrations without blocking user-facing services.
* **Deterministic LLM Reasoning:** Deconstructs complex sales logic into multi-node workflows:
  * **Lead Fit & ICP Scoring:** Assesses budget, company size, and domain parameters against target Ideal Customer Profile (ICP) criteria.
  * **Strategic Action Plans:** Automatically drafts personalized outreach templates, objection-handling strategies, and key value propositions.
* **Schema Drift Protection:** Enforces strict JSON schema validation and multi-pass prompt verification to prevent hallucinations before state persistence.

### 2. Full-Stack Application & Data Layer
* **Express.js API Engine:** Implements modular routes (`/api/auth`, `/api/leads`) secured by `JSON Web Tokens (JWT)`.
* **Reliable Data Persistence:** Uses MongoDB Atlas document modeling to maintain historical lead interaction logs, score breakdown records, and account credentials.
* **Responsive Client Dashboard:** Built with React 19 and Tailwind CSS to provide sales representatives with real-time analytics, filtering, and execution interfaces.

### 3. Production Engineering & Deployment
* **Client (Vercel):** Deployed with Vite root-directory isolation (`/client`) and automated CI/CD builds triggered on main branch updates. Configured with custom POSIX execution hooks (`chmod +x`) to ensure clean cross-platform Linux compilation.
* **Server (Render):** Hosted as an active Express web service listening on dynamic environment ports (`process.env.PORT`) with encrypted environment variables (`MONGO_URI`, `JWT_SECRET`).

---
## 🧪 Testing & CI/CD Pipeline

The backend API includes integration test coverage using Jest and Supertest to validate health checks, authentication boundaries, input validation, and route security.

To run the test suite locally:

bash
cd server
npm test

Continuous Integration is enforced via GitHub Actions (.github/workflows/ci.yml) on every push and pull request to main.

---

## ⚡ Local Development & Setup

### Prerequisites
* Node.js (v18+ recommended)
* MongoDB Atlas Cluster or Local MongoDB Instance
* Git

### Step-by-Step Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/harshvardhanongithub/autonomous-sales-assistant.git
   https://github.com/harshvardhanongithub/autonomous-sales-assistant.git
   cd autonomous-sales-assistant
   

2. **Configure Environment Variables:**
   Create a `.env` file in the root folder:
   ```env
   PORT=5001
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

3. **Install Dependencies:**
   ```bash
   # Install backend dependencies
   npm install

   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

4. **Launch Local Servers:**
   * **Backend:** Run `npm run dev` in the root folder (Serves on `http://localhost:5001`)
   * **Frontend:** Run `cd client && npm run dev` (Serves on `http://localhost:5173`)

---

## 🌐 Live Production Links

* **Live Web Application:** [https://autonomous-sales-assistant-1k5k.vercel.app](https://autonomous-sales-assistant-1k5k.vercel.app)
* **Backend API Gateway:** [https://autonomous-sales-assistant.onrender.com](https://autonomous-sales-assistant.onrender.com)

* ---

 ##📄 License

This project is licensed under the MIT License.

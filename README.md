# 💎 Monexa — AI-Powered Financial Intelligence & Simulation Platform

> *See your financial future clearly before making today's decisions.*

**Monexa** is a financial intelligence and scenario simulation platform. It bridges the gap between everyday financial choices and long-term consequences by combining a **deterministic calculation engine** with an **AI interpretation layer** (powered by Amazon Bedrock and Groq).

Whether evaluating a major purchase, assessing a loan or EMI, planning savings goals, or identifying cash-flow discrepancies from bank statements, Monexa gives individuals mathematical clarity and actionable guidance without guesswork or financial hallucinations.

---

## 🏛 Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────────┐
│                    User Web Browser                        │
└─────────────────────────────┬──────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│         Frontend (AWS Amplify Static Hosting)              │
│  - React 19 + TypeScript + Vite 8                          │
│  - TanStack Router (Pure Client SPA)                       │
│  - Tailwind CSS v4 + Radix UI + Recharts                   │
└─────────────────────────────┬──────────────────────────────┘
                              │ (HTTPS /api/* proxy)
                              ▼
┌────────────────────────────────────────────────────────────┐
│         Backend Server (AWS EC2 / Cloudflare Tunnel)       │
│  - FastAPI (Python 3.11+)                                  │
│  - Deterministic Financial Math Engine                     │
│  - Reducing-Balance EMI & SIP Amortization Engine          │
│  - Financial Radar Risk & Anomaly Detector                 │
└──────────────┬──────────────────────────────┬──────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐┌─────────────────────────────┐
│  Database (AWS RDS Postgres) ││  AI Microservice (Groq /    │
│  - psycopg v3 Connection     ││  Amazon Bedrock Converse)   │
│  - Users, EMIs, Statements   ││  - Natural language parser  │
│  - OTP Auth & Financial Data ││  - Contextual observation   │
└──────────────────────────────┘└─────────────────────────────┘
```

---

## 📁 Repository Structure

```
Money_Lens/
├── backend/                  # FastAPI Python deterministic financial simulation engine
│   ├── app/
│   │   ├── core/             # Configuration & Database connection (AWS RDS / psycopg)
│   │   ├── routes/           # REST routes (/auth, /profile, /simulate, /goals, /radar, etc.)
│   │   ├── schemas/          # Pydantic validation models
│   │   ├── services/         # Deterministic engines, OTP service, Bedrock & Groq services
│   │   └── utils/            # Pure mathematical financial formulas (reducing balance, EMI, SIP)
│   ├── tests/                # Automated pytest suite
│   ├── requirements.txt      # Python dependencies
│   └── README.md             # Detailed Backend documentation
│
├── frontend/                 # Modern React 19 + TanStack Router web application
│   ├── src/
│   │   ├── components/       # Auth, navigation, charts, and Radix UI components
│   │   ├── routes/           # TanStack file-based routes (/login, /accounts, /dashboard, etc.)
│   │   ├── lib/              # Centralized API client, session management, and utils
│   │   └── hooks/            # TanStack Query custom data hooks
│   ├── scripts/              # Static build & Amplify deployment scripts
│   ├── package.json
│   └── README.md             # Detailed Frontend documentation
│
├── ai/                       # Independent Groq-powered AI insight microservice
│   ├── app/                  # FastAPI service for conversational financial insights
│   ├── requirements.txt
│   └── README.md             # AI Microservice documentation
│
└── docker-compose.yml        # Multi-container local orchestration
```

---

## 🚀 Quick Start (Local Development)

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux / macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- **API Documentation (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Frontend (React 19 + Vite)
```bash
cd frontend
npm install
npm run dev
```
The frontend starts at [http://localhost:5173](http://localhost:5173).

### 3. AI Service (Optional)
```bash
cd ai
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

---

## 🌐 Production Deployment Guide

| Component | Hosting / Service | URL / Port |
|---|---|---|
| **Frontend** | AWS Amplify (Static SPA) | `https://main.d2xe3vap1cnzls.amplifyapp.com` |
| **Backend** | AWS EC2 (Amazon Linux 2023) | Port `8000` via Cloudflare Tunnel / Amplify Proxy |
| **Database** | AWS RDS (PostgreSQL) | Port `5432` |
| **AI Service** | AWS EC2 / Container | Port `8001` (Groq / Bedrock) |

---

## 🔒 Security & Compliance

- **Zero LLM Hallucinations**: Financial metrics, EMIs, and compounding curves are computed exclusively by deterministic mathematical functions. AI models are strictly confined to summarizing and interpreting user intent.
- **Credential Storage**: Passwords are encrypted using salted `bcrypt` algorithms. OTP verification codes expire after 10 minutes.
- **Protected Endpoints**: Session tokens and user isolation guarantee individual workspace privacy.

---

## 📄 License
Private & Proprietary. All rights reserved by the Monexa Team.

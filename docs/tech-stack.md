# 🏗️ MoneyLens — Technical Overview & Stack Architecture

> **Tagline**: *"See your financial future before you make today's decision."*  
> **Repository**: `MoneyLens_v1/Money_Lens`  
> **Last Updated**: September 2026

---

## 📑 Table of Contents
1. [System Architecture & Mental Model](#1-system-architecture--mental-model)
2. [Directory Layout & Scaffolding](#2-directory-layout--scaffolding)
3. [Frontend Tech Stack](#3-frontend-tech-stack)
4. [Backend Tech Stack & Math Engine](#4-backend-tech-stack--math-engine)
5. [Data Layer & API Contracts](#5-data-layer--api-contracts)
6. [Design System & UI Foundations](#6-design-system--ui-foundations)
7. [Developer Onboarding & Setup Guide](#7-developer-onboarding--setup-guide)
8. [Testing & Verification Protocol](#8-testing--verification-protocol)

---

## 1. System Architecture & Mental Model

MoneyLens is structured around a strict **separation-of-concerns** architecture. The frontend is an interactive simulation control center, while the backend executes deterministic financial algorithms.

```
┌────────────────────────────────────────────────────────────────────────┐
│                     MONEY LENS ARCHITECTURE                            │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌───────────────────────────┐      HTTP REST / JSON                  │
│   │    Next.js 16 Frontend    │ ◄────────────────────────┐             │
│   │   (React 19, TypeScript)  │                          │             │
│   │   • 3D WebGL Vector Engine│                          ▼             │
│   │   • Dual-Mode Mock Engine │                ┌──────────────────┐    │
│   │   • Segmented Mission Nav │                │ FastAPI Backend  │    │
│   └───────────────────────────┘                │ (Python 3.10+)   │    │
│                                                │ • Pure Math      │    │
│                                                │ • Pydantic v2    │    │
│                                                │ • Pytest Suite   │    │
│                                                └─────────┬────────┘    │
│                                                          │             │
│                                                          ▼             │
│                                                ┌──────────────────┐    │
│                                                │ AI LLM (Future)  │    │
│                                                │ (Amazon Bedrock) │    │
│                                                └──────────────────┘    │
└────────────────────────────────────────────────────────────────────────┘
```

### Key Principles
- **Mathematical Determinism**: Financial numbers (EMI amortizations, compounding curves, reserve buffers) are calculated with 100% precision in Python/TypeScript. Zero hallucinated math.
- **Dual-Mode Data Client**: The frontend can operate standalone with high-fidelity in-browser telemetry mocks or connect live to the FastAPI backend.
- **Zero-Risk Sandbox**: Gives users the confidence to simulate financial moves (upfront cash vs. loan EMIs, income shifts, cash shocks) before committing money in real life.

---

## 2. Directory Layout & Scaffolding

```
MoneyLens_v1/
├── Money_Lens/
│   ├── backend/                      # Python FastAPI Financial Engine
│   │   ├── app/
│   │   │   ├── core/                 # App configuration, financial constants, CORS
│   │   │   ├── routes/               # API endpoints (/simulate, /goals, /experiments, /radar)
│   │   │   ├── schemas/              # Pydantic v2 request/response models
│   │   │   ├── services/             # Financial simulation & business logic services
│   │   │   ├── utils/                # Pure mathematical calculations & formulas
│   │   │   └── main.py               # FastAPI app instance & router setup
│   │   ├── tests/                    # Automated Pytest suite (33 test cases)
│   │   ├── requirements.txt          # Python dependencies
│   │   └── README.md                 # Backend documentation & math specs
│   │
│   ├── frontend/                     # Next.js 16 App Router Control Center
│   │   ├── src/
│   │   │   ├── app/                  # App Router pages (/, /dashboard, /simulator, /goals, /reverse, /radar, /lab)
│   │   │   │   ├── layout.tsx        # Root HTML layout with Google Fonts & Material Symbols
│   │   │   │   └── globals.css       # Tailwind CSS v4 design tokens, grid & typography
│   │   │   ├── components/           # UI & Mission Control Modules
│   │   │   │   ├── 3d/               # Three.js 3D WebGL Trajectory canvases
│   │   │   │   ├── ui/               # Radix UI primitives & buttons
│   │   │   │   ├── Header.tsx        # Mission Control navbar with health badges & notifications
│   │   │   │   ├── Footer.tsx        # Status bar with sys logs & audit modal triggers
│   │   │   │   ├── CommandCenterHero.tsx # Telemetry statement & 4-metric HUD
│   │   │   │   ├── Trajectory3DCanvas.tsx # 3D vector spline visualizer
│   │   │   │   ├── TrajectoryVisualizer.tsx # 2D/3D mode switcher & timeline anchors
│   │   │   │   ├── FinancialTimeMachine.tsx # Purchase & EMI decision simulator
│   │   │   │   ├── ReverseTimeMachine.tsx   # Backward-propagation goal engine
│   │   │   │   ├── FinancialRadar.tsx       # 30-day cash flow surveillance
│   │   │   │   ├── EvidenceIntelligence.tsx # 4-step causal chain & recovery vector
│   │   │   │   ├── IncomeNotification.tsx   # Shift detection alert & recalibration
│   │   │   │   ├── HealthVitals.tsx         # Multi-dimensional health score HUD
│   │   │   │   ├── SettingsModal.tsx        # Baseline parameters calibration modal
│   │   │   │   ├── SysLogsModal.tsx         # Real-time mission control log stream
│   │   │   │   └── InfoModals.tsx           # Terms of simulation & integrity audit
│   │   │   ├── screens/              # Screen views (DashboardScreen, SimulatorScreen, GoalsScreen, etc.)
│   │   │   ├── data/                 # Baseline mock data & telemetry nodes (mockData.ts)
│   │   │   ├── types/ & types.ts     # TypeScript interfaces & contracts
│   │   │   └── lib/                  # Utilities, formatters, and API client
│   │   ├── package.json              # NPM dependencies & build scripts
│   │   ├── tsconfig.json             # TypeScript configuration
│   │   └── next.config.ts            # Next.js build configuration
│   │
│   └── docs/                         # Repository documentation
│       ├── api.md                    # REST API endpoints & payload reference
│       ├── architecture.md           # Architecture principles
│       ├── tech-stack.md             # Complete Technical Overview (This document)
│       └── task-tracker.md           # Project Task & Milestone Tracker
```

---

## 3. Frontend Tech Stack

| Layer / Concern | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router + Turbopack) | `16.3.5` | React server/client architecture, static prerendering, optimized assets |
| **UI Library** | React | `19.2.8` | Declarative component UI & hooks |
| **Language** | TypeScript | `^5.0.0` | Strict type safety and end-to-end data contracts |
| **Styling** | Tailwind CSS v4 | `^4.0.0` | High-performance CSS-first utility styling |
| **3D Graphics** | Three.js | `^0.186.0` | Real-time WebGL 3D spline trajectory and milestone node visualizer |
| **Icons** | Material Symbols & Lucide React | `^1.47.0` | Telemetry icons, navigation symbols, and status indicators |
| **UI Primitives** | Radix UI | Latest | Accessible dialogs, tabs, sliders, and progress indicators |
| **State & Fetching**| TanStack React Query | `^5.103.1` | Client-side cache, async query state management |
| **Toast Engine** | Sonner | `^2.0.8` | Telemetry event toasts and system notifications |

---

## 4. Backend Tech Stack & Math Engine

| Layer / Concern | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | FastAPI | `^0.110.0` | High-performance async REST API with auto-generated OpenAPI / Swagger docs |
| **Language** | Python | `3.10+` | Clean numerical simulation and financial modeling runtime |
| **Validation** | Pydantic | `v2.6+` | Strict schema parsing, validation, and JSON serialization |
| **Server** | Uvicorn | `^0.28.0` | ASGI production server |
| **Test Runner** | Pytest | `^8.0.0` | Automated unit, service, and API integration testing |

### Core Mathematical Formulas in Backend (`app/utils/calculations.py`)
1. **Disposable Surplus**:
   $$\text{Surplus} = \text{Monthly Income} - (\text{Monthly Living Expenses} + \text{Ongoing EMI})$$
2. **Reducing-Balance EMI**:
   $$E = P \cdot r \cdot \frac{(1 + r)^n}{(1 + r)^n - 1}$$
   - $P$ = Principal Loan Amount
   - $r$ = Monthly Interest Rate $= (\text{Annual Rate \%} / 12) / 100$
   - $n$ = Loan Tenure (months)
3. **Compound Trajectory Projection**:
   $$\text{Closing Balance}_t = \left(\text{Closing Balance}_{t-1} \times (1 + r_{\text{monthly}})\right) + \text{Monthly Surplus}$$
4. **Backward-Propagation Sinking Fund**:
   $$\text{Required Monthly Velocity} = \frac{\text{Target Corpus} - \text{Current Allocation}}{\text{Months Remaining}}$$

---

## 5. Data Layer & API Contracts

### Endpoints Overview (`http://localhost:8000/api/v1`)
- `GET /health` — System health, engine status, and runtime latency.
- `POST /api/v1/simulate/position` — Baseline cash flow position and 3/6/12-month projections.
- `POST /api/v1/simulate/purchase` — Upfront cash purchase simulation, runway drawdown, recovery months.
- `POST /api/v1/simulate/emi` — Loan-financed EMI simulation, debt-to-income ratio, interest premium.
- `POST /api/v1/goals` — Forward goal feasibility and completion estimation.
- `POST /api/v1/goals/reverse` — Backward-propagation solver and actionable trade-off levers.
- `POST /api/v1/experiments/compare` — Multi-scenario comparison matrix (Scenarios A through D).
- `GET /api/v1/radar` — 30-day cash flow surveillance, committed outflows, and health score deductions.

---

## 6. Design System & UI Foundations (`fintech-consumer-landing-v1`)

### Color Palette
- **Brand Blue Bright (`#61CCFF`)**: Active simulation highlights, energetic callouts, chart vectors.
- **Brand Navy Deep (`#002992`)**: High-emphasis reverse sections, money movement, dark reversed blocks.
- **Pure Black (`#000000`)**: Footer background, dark telemetry panels, primary headline anchors.
- **Pure White (`#FFFFFF`)**: Base surface, card panels, pill button fills.
- **Neutral Light Gray (`#E5E6E8`)**: Subtle dividers, secondary card surfaces.
- **Neutral Off-White (`#F7F9FF`)**: Soft background transitions.

### Typography Scale
- **Display Headlines**: `Plus Jakarta Sans` (80–120px desktop, tight letter-spacing `-0.02em`, `line-height: 0.95`).
- **Body & Controls**: `Inter` (14–16px, `line-height: 1.5`).
- **Telemetry & Numbers**: `JetBrains Mono` with tabular numerals (`tnum`).

### Component Tokens
- **Pill Shape**: Full pill (`border-radius: 999px`) on all buttons, segmented tab controls, and status pills.
- **Card Panels**: Crisp rounded borders (`border-radius: 12px-16px`) with high contrast.

---

## 7. Developer Onboarding & Setup Guide

### 1. Clone & Environment Prerequisites
- Node.js `v20+` or `v22+`
- Python `3.10+`
- Git

### 2. Frontend Setup (Next.js)
```bash
cd frontend
npm install
npm run dev
```
- App runs at: `http://localhost:3000`
- Production build check: `npm run build`

### 3. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- Swagger Interactive Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

---

## 8. Testing & Verification Protocol

### Backend Automated Tests
```bash
cd backend
python -m pytest -v
```
*(33 automated test cases covering EMI formulas, linear & compounding projections, goal feasibility, radar rules, and FastAPI schemas).*

### Frontend Production Compilation
```bash
cd frontend
npm run build
```
*(Validates TypeScript type check and Turbopack static page generation across all routes).*

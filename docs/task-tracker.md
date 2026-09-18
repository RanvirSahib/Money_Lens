# 📋 MoneyLens — Project Task & Milestone Tracker

> **Repository**: `MoneyLens_v1/Money_Lens`  
> **Current Version**: `v4.2.0-mission-control`  
> **Status Summary**: MVP Phase Complete // Ready for Backend Live Wire & LLM Layer

---

## 🚦 Status Legend
- 🟢 **DONE**: Fully implemented, tested, and verified.
- 🟡 **IN PROGRESS**: Active development or integration in flight.
- ⚪ **TODO**: Queued for immediate next sprint.
- 🟣 **BACKLOG**: Post-MVP roadmap item (LLM integration, real bank feeds).

---

## 📊 Summary Board

| Category | Total Tasks | 🟢 Done | 🟡 In Progress | ⚪ To Do | 🟣 Backlog |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1. Architecture & Setup** | 6 | 6 | 0 | 0 | 0 |
| **2. Backend Financial Math** | 7 | 7 | 0 | 0 | 0 |
| **3. Frontend Design & System** | 8 | 8 | 0 | 0 | 0 |
| **4. 3D WebGL & Visualizer** | 6 | 6 | 0 | 0 | 0 |
| **5. Core Simulation Engines** | 8 | 8 | 0 | 0 | 0 |
| **6. Modals & Telemetry Logs** | 5 | 5 | 0 | 0 | 0 |
| **7. Live API Wire-Up** | 4 | 4 | 0 | 0 | 0 |
| **8. Post-MVP & AI Layer** | 5 | 0 | 0 | 2 | 3 |
| **TOTAL** | **49** | **39** | **0** | **2** | **8** |

---

## 🧩 Detailed Task Breakdown

### Epic 1: Architecture & Repository Scaffolding
| ID | Task Description | Priority | Status | Owner |
| :--- | :--- | :---: | :---: | :---: |
| `ARCH-01` | Establish Next.js App Router + TypeScript frontend repository | P0 | 🟢 DONE | Frontend |
| `ARCH-02` | Setup FastAPI Python backend with Pydantic v2 schemas | P0 | 🟢 DONE | Backend |
| `ARCH-03` | Configure Tailwind CSS v4 design tokens and font scale | P0 | 🟢 DONE | Frontend |
| `ARCH-04` | Setup dual-mode API client (`NEXT_PUBLIC_USE_MOCK_DATA`) | P0 | 🟢 DONE | Fullstack |
| `ARCH-05` | Create `docs/api.md` and `docs/architecture.md` | P1 | 🟢 DONE | Team |
| `ARCH-06` | Create `docs/tech-stack.md` and `docs/task-tracker.md` | P0 | 🟢 DONE | Lead |

---

### Epic 2: Backend Financial Mathematics & REST API
| ID | Task Description | Priority | Status | Owner |
| :--- | :--- | :---: | :---: | :---: |
| `MATH-01` | Implement disposable surplus formula and savings rate | P0 | 🟢 DONE | Backend |
| `MATH-02` | Implement reducing-balance EMI loan calculation formula | P0 | 🟢 DONE | Backend |
| `MATH-03` | Implement linear & compounding future balance projections | P0 | 🟢 DONE | Backend |
| `MATH-04` | Implement forward goal completion velocity estimation | P0 | 🟢 DONE | Backend |
| `MATH-05` | Implement backward-propagation sinking fund reverse solver | P0 | 🟢 DONE | Backend |
| `MATH-06` | Implement rule-based radar anomaly & health score deductions | P0 | 🟢 DONE | Backend |
| `MATH-07` | Create automated Pytest suite (33 passing test cases) | P0 | 🟢 DONE | Backend |

---

### Epic 3: Frontend Design & UI Foundations (`fintech-consumer-landing-v1`)
| ID | Task Description | Priority | Status | Owner |
| :--- | :--- | :---: | :---: | :---: |
| `UI-01` | Implement 6-color palette (`#61CCFF`, `#002992`, `#000000`, `#FFFFFF`, `#E5E6E8`, `#F7F9FF`) | P0 | 🟢 DONE | Frontend |
| `UI-02` | Configure typography scale (Plus Jakarta Sans, Inter, JetBrains Mono) | P0 | 🟢 DONE | Frontend |
| `UI-03` | Implement full-pill buttons (`rounded-full`) and segmented toggles | P0 | 🟢 DONE | Frontend |
| `UI-04` | Build Mission Control Header with live health score and crystal mark | P0 | 🟢 DONE | Frontend |
| `UI-05` | Build notification tray with unread badge and outside-click dismiss | P1 | 🟢 DONE | Frontend |
| `UI-06` | Build responsive mobile drawer with icon navigation | P1 | 🟢 DONE | Frontend |
| `UI-07` | Build status footer with sys logs, terms, and audit modal triggers | P1 | 🟢 DONE | Frontend |
| `UI-08` | Implement toast notification system with auto-dismiss | P1 | 🟢 DONE | Frontend |

---

### Epic 4: 3D WebGL Vector Visualizer & Charts
| ID | Task Description | Priority | Status | Owner |
| :--- | :--- | :---: | :---: | :---: |
| `3D-01` | Build Three.js 3D WebGL canvas with Catmull-Rom spline curves | P0 | 🟢 DONE | 3D/Frontend |
| `3D-02` | Add 3D milestone spheres with animated pulse halo rings & floor grid | P0 | 🟢 DONE | 3D/Frontend |
| `3D-03` | Implement dynamic 2D screen coordinate projection tags | P0 | 🟢 DONE | 3D/Frontend |
| `3D-04` | Implement camera orbital controls (drag-to-orbit, zoom, reset) | P1 | 🟢 DONE | 3D/Frontend |
| `3D-05` | Implement high-precision 2D SVG flat fallback with area gradients | P0 | 🟢 DONE | Frontend |
| `3D-06` | Add 2D/3D mode switcher and scenario divergence toggles | P0 | 🟢 DONE | Frontend |

---

### Epic 5: Core Financial Simulation Engines
| ID | Task Description | Priority | Status | Owner |
| :--- | :--- | :---: | :---: | :---: |
| `ENG-01` | Build Command Center Hero with live pulse metrics & 4-metric HUD | P0 | 🟢 DONE | Frontend |
| `ENG-02` | Build Financial Time Machine (Simulator) with query parser | P0 | 🟢 DONE | Frontend |
| `ENG-03` | Add decision matrix (`Buy Now`, `EMI`, `Save First`, `Wait 3M`, `Custom`) | P0 | 🟢 DONE | Frontend |
| `ENG-04` | Implement 4 telemetry delta cards (Savings, Cash Flow, Goal Lag, Pressure) | P0 | 🟢 DONE | Frontend |
| `ENG-05` | Build Goals Screen with velocity indicators & New Goal modal | P0 | 🟢 DONE | Frontend |
| `ENG-06` | Build Reverse Time Machine with target milestone & interactive levers | P0 | 🟢 DONE | Frontend |
| `ENG-07` | Build Tactical Cash Flow Radar (30-day outlook & liquidity trough) | P0 | 🟢 DONE | Frontend |
| `ENG-08` | Build Research Lab with 1,000-iteration Monte Carlo shock simulator | P0 | 🟢 DONE | Frontend |

---

### Epic 6: Mission Control Modals & Telemetry
| ID | Task Description | Priority | Status | Owner |
| :--- | :--- | :---: | :---: | :---: |
| `MOD-01` | Build Evidence-Based Intelligence 4-step causal chain | P1 | 🟢 DONE | Frontend |
| `MOD-02` | Build Income Notification shift detector (`45K → 55K`) | P1 | 🟢 DONE | Frontend |
| `MOD-03` | Build Health Vitals multi-dimensional progress HUD | P1 | 🟢 DONE | Frontend |
| `MOD-04` | Build System Calibration Settings Modal | P0 | 🟢 DONE | Frontend |
| `MOD-05` | Build Sys Logs Stream Terminal Modal with SHA-256 state hashes | P1 | 🟢 DONE | Frontend |

---

### Epic 7: Live API Wire-Up & Backend Synchronization
| ID | Task Description | Priority | Status | Owner |
| :--- | :--- | :---: | :---: | :---: |
| `API-01` | Verify CORS and schema compatibility between Next.js & FastAPI | P0 | 🟢 DONE | Fullstack |
| `API-02` | Test frontend mock fallback toggle when backend is offline | P0 | 🟢 DONE | Fullstack |
| `API-03` | Wire `/api/v1/simulate/purchase` & `/emi` directly to Time Machine | P0 | 🟢 DONE | Fullstack |
| `API-04` | Wire `/api/v1/radar` directly to Radar screen | P0 | 🟢 DONE | Fullstack |

---

### Epic 8: Post-MVP & AI Layer (Future Roadmap)
| ID | Task Description | Priority | Status | Owner |
| :--- | :--- | :---: | :---: | :---: |
| `AI-01` | Amazon Bedrock Claude-3 natural language explanation synthesis | P2 | ⚪ TO DO | AI/Backend |
| `AI-02` | Automated trade-off executive summary generator | P2 | ⚪ TO DO | AI/Backend |
| `EXT-01` | Account Aggregator / Open Banking transaction ingestion pipeline | P3 | 🟣 BACKLOG | Backend |
| `EXT-02` | Multi-tenant PostgreSQL database with user authentication | P3 | 🟣 BACKLOG | Backend |
| `EXT-03` | Exportable PDF financial future audit report generator | P3 | 🟣 BACKLOG | Fullstack |

---

## 🔄 Update Protocol
1. When starting a task, change its status from `⚪ TO DO` to `🟡 IN PROGRESS` and assign the owner.
2. Once the code is merged, tested, and verified with `npm run build` / `pytest`, update to `🟢 DONE`.
3. Keep the Summary Board counts synchronized with each milestone release.

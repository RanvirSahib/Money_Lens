# 🔭 MoneyLens — AI-Powered Financial Future Simulator Backend

> **MoneyLens** is a deterministic, AI-ready financial engine and simulation backend built with **Python**, **FastAPI**, and **Pydantic**.
> It simulates upfront purchases, loan/EMI financing, compounding future savings trajectories, financial goal feasibility, and rule-based risk/radar alerts.

---

## 📑 Table of Contents
- [Architecture & AI-Ready Pipeline](#architecture--ai-ready-pipeline)
- [Amazon Bedrock Integration (AI Interpretation Layer)](#amazon-bedrock-integration-ai-interpretation-layer)
- [Database Integration (PostgreSQL / AWS RDS with psycopg)](#database-integration-postgresql--aws-rds-with-psycopg)
- [Project Structure](#project-structure)
- [Installation & Quick Start](#installation--quick-start)
- [Running Automated Tests](#running-automated-tests)
- [Core Features & Mathematical Calculations](#core-features--mathematical-calculations)
- [API Reference & Example Payloads](#api-reference--example-payloads)
  - [1. System Health & Info](#1-system-health--info)
  - [2. AI Interpretation Layer (Amazon Bedrock)](#2-ai-interpretation-layer-amazon-bedrock)
  - [3. Transaction Processing](#3-transaction-processing)
  - [4. Financial Simulation Engine](#4-financial-simulation-engine)
  - [5. Goal Engine (Forward & Reverse)](#5-goal-engine-forward--reverse)
  - [6. Experiment Lab (Multi-Scenario Comparison)](#6-experiment-lab-multi-scenario-comparison)
  - [7. Financial Radar (Risk & Anomaly Engine)](#7-financial-radar-risk--anomaly-engine)
- [Frontend Integration Guide](#frontend-integration-guide)
- [Financial Safety & Compliance](#financial-safety--compliance)

---

## 🏗 Architecture & AI-Ready Pipeline

MoneyLens is architected with a strict separation of concerns:

```
┌────────────────────────────────────────┐
│     User Natural Language Request      │
│  ("Can I buy a ₹70,000 phone soon?")   │
└──────────────────┬─────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────┐
│    Amazon Bedrock Interpretation       │
│      (amazon.nova-micro-v1:0)          │
│    *Converts NL to structured intent*  │
└──────────────────┬─────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────┐
│     Deterministic Financial Engine     │
│ (Pure mathematical formulas & models)  │
│  - Purchase Simulation & Liquidity     │
│  - Reducing-Balance Loan EMI Math      │
│  - Compounding Savings Projections     │
│  - Goal Feasibility & Radar Alerts     │
└──────────────────┬─────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────┐
│           Structured Results           │
│   (Pydantic validated JSON schemas)    │
└──────────────────┬─────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────┐
│      Pluggable Storage Layer           │
│  - PostgreSQL / AWS RDS (psycopg v3)   │
│  - In-Memory Fallback (local testing)  │
└────────────────────────────────────────┘
```

- **Amazon Bedrock Interpretation Layer**: Interprets natural-language financial questions via the Bedrock Converse API (`amazon.nova-micro-v1:0`) and maps them into structured intent (`intent`, `item`, `amount`, `time_period`, `payment_method`, `goal`).
- **Deterministic Mathematics**: All financial numbers, compounding timelines, EMI schedules, and risk alerts are computed strictly by deterministic engines without LLM calculation hallucinations.
- **Pluggable Storage**: Uses a repository pattern with `PostgresTransactionRepository` and `PostgresGoalRepository` backed by `psycopg` (v3), with seamless fallback to in-memory storage for offline testing when unconfigured.

---

## 🤖 Amazon Bedrock Integration (AI Interpretation Layer)

MoneyLens uses **Amazon Bedrock Runtime Converse API** with model **`amazon.nova-micro-v1:0`** in **`us-east-1`**.

### Role & Guardrails
- **Natural Language Parsing**: Maps user questions (e.g. *"Can I buy a ₹70,000 phone next month?"*) to structured parameters.
- **Zero Math Invention**: The LLM never invents calculations, claims certainty, or executes financial calculations.
- **Clean Fallbacks**: Malformed model outputs and AWS errors are handled gracefully and return structured HTTP responses.

### AWS Configuration & Environment Variables
AWS credentials are never hardcoded. You can configure them via environment variables or standard AWS credential profiles:

| Environment Variable | Default | Description |
|---|---|---|
| `AWS_REGION` | `us-east-1` | AWS Region for Amazon Bedrock Runtime |
| `BEDROCK_MODEL_ID` | `amazon.nova-micro-v1:0` | Amazon Bedrock model identifier |
| `AWS_ACCESS_KEY_ID` | *(None / IAM Role)* | AWS Access Key (optional if using IAM/profile) |
| `AWS_SECRET_ACCESS_KEY` | *(None / IAM Role)* | AWS Secret Access Key |
| `AWS_SESSION_TOKEN` | *(None)* | AWS Session Token (for temporary credentials) |

---

## 🗄️ Database Integration (PostgreSQL / AWS RDS with psycopg)

MoneyLens supports direct database persistence on **PostgreSQL / AWS RDS** using the **`psycopg` (v3)** driver.

### Key Behaviors
1. **Zero Auto-seeding**: When connected to PostgreSQL / RDS, tables start completely empty and store only data explicitly inserted via API calls.
2. **Strict Error Surfacing**: When database configuration is provided, any connection failure surfaces explicitly (no silent fallback). In-memory storage is used only when no database configuration is provided (for standalone testing / local development).
3. **Encrypted Connections**: Default SSL mode is set to `require` for AWS RDS security compliance.

### Database Configuration & Environment Variables
Configure your database connection using either a single `DATABASE_URL` or individual RDS parameters:

| Environment Variable | AWS RDS Alias | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | — | *(None)* | Full PostgreSQL connection URI |
| `DB_HOST` | `RDS_HOSTNAME` | *(None)* | PostgreSQL / RDS endpoint hostname |
| `DB_PORT` | `RDS_PORT` | `5432` | Database port |
| `DB_NAME` | `RDS_DB_NAME` | `moneylens` | Database name |
| `DB_USER` | `RDS_USERNAME` | *(None)* | Master username |
| `DB_PASSWORD` | `RDS_PASSWORD` | *(None)* | Master password |
| `DB_SSLMODE` | `RDS_SSLMODE` | `require` | SSL connection mode (`require` / `prefer` / `disable`) |


## 📂 Project Structure

```
MoneyLens/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                     # FastAPI application setup, CORS, route registration
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── config.py               # Config, financial constants, and CORS settings
│   │   ├── schemas/                    # Pydantic validation & response schemas
│   │   │   ├── __init__.py
│   │   │   ├── common.py               # Enums & base response models
│   │   │   ├── transactions.py         # Transaction CRUD & summary schemas
│   │   │   ├── simulation.py           # Position, purchase, EMI, & projection schemas
│   │   │   ├── goals.py                # Forward & reverse goal schemas
│   │   │   ├── experiments.py          # Scenario comparison matrix schemas
│   │   │   └── radar.py                # Rule-based radar alerts & scoring schemas
│   │   ├── services/                   # Business logic and simulation workflows
│   │   │   ├── __init__.py
│   │   │   ├── transaction_service.py  # Repository & category aggregations
│   │   │   ├── simulation_service.py   # Purchase, EMI & trajectory simulations
│   │   │   ├── goal_service.py         # Forward feasibility & reverse goal engineering
│   │   │   ├── experiment_service.py   # Multi-scenario parallel evaluator
│   │   │   └── radar_service.py        # Rule-based anomaly & health score engine
│   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   └── calculations.py         # Pure financial formulas & math utilities
│   │   └── routes/                     # REST API endpoints
│   │       ├── __init__.py
│   │       ├── transactions.py         # /api/v1/transactions & summary
│   │       ├── simulation.py           # /api/v1/simulate/position, /purchase, /emi, /savings
│   │       ├── goals.py                # /api/v1/goals & /goals/reverse
│   │       ├── experiments.py          # /api/v1/experiments/compare
│   │       └── radar.py                # /api/v1/radar & /radar/analyze
│   │
│   ├── tests/                          # Comprehensive pytest test suite
│   │   ├── __init__.py
│   │   ├── test_calculations.py        # Pure math verification
│   │   ├── test_services.py            # Service logic verification
│   │   └── test_api.py                 # FastAPI endpoint integration tests
│   │
│   ├── requirements.txt
│   ├── .gitignore
│   └── README.md
│
└── (frontend / AI layers to be added)
```

---

## ⚡ Installation & Quick Start

### 1. Prerequisites
- Python 3.10+
- `pip`

### 2. Navigate to Backend & Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Start the FastAPI Server
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **Interactive Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Alternative Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 🧪 Running Automated Tests

Run the complete test suite from inside `backend/`:

```bash
cd backend
python -m pytest -q
```

All 25 test cases cover:
- Reducing-balance loan EMI formula precision
- Linear vs compounding savings projections
- Cash purchase liquidity & emergency fund impact
- Forward goal feasibility & completion estimation
- Reverse goal engineering & gap identification
- Experiment lab scenario matrices
- Radar rule activations & health score deductions
- HTTP endpoint status codes and schema validation

---

## 📐 Core Features & Mathematical Calculations

### 1. Monthly Disposable Surplus & Savings Rate
$$\text{Surplus} = \text{Monthly Income} - (\text{Monthly Living Expenses} + \text{Ongoing EMI})$$
$$\text{Savings Rate (\%)} = \left( \frac{\text{Monthly Surplus}}{\text{Monthly Income}} \right) \times 100$$

### 2. Standard Reducing-Balance EMI Formula
$$E = P \cdot r \cdot \frac{(1 + r)^n}{(1 + r)^n - 1}$$
- $P$ = Principal Loan Amount ($\text{Purchase Price} - \text{Down Payment}$)
- $r$ = Monthly Interest Rate = $(\text{Annual Rate \%} / 12) / 100$
- $n$ = Loan duration in months
- $\text{Total Repayment} = E \times n$
- $\text{Total Interest Paid} = \text{Total Repayment} - P$

### 3. Compounding Future Savings Projection
$$\text{Closing Balance}_t = \left( \text{Closing Balance}_{t-1} \times (1 + r_{\text{monthly}}) \right) + \text{Monthly Surplus}$$

### 4. Reverse Goal Engineering
Given desired corpus $T$ in $N$ months:
$$\text{Required Monthly Saving} = \frac{T}{N} \quad (\text{or via sinking fund formula if return rate applied})$$
$$\text{Additional Monthly Needed} = \max(0, \text{Required Monthly Saving} - \text{Current Surplus})$$

---

## 🔌 API Reference & Example Payloads

### 1. System Health & Info

#### `GET /health`
```json
{
  "status": "healthy",
  "service": "MoneyLens Financial Engine",
  "version": "1.0.0",
  "engine": "deterministic-v1",
  "ai_integration_status": "ready"
}
```

---

### 2. AI Interpretation Layer (Amazon Bedrock)

#### `POST /api/v1/ai/analyze`
Interprets natural language queries using Amazon Bedrock Converse API (`amazon.nova-micro-v1:0` in `us-east-1`).

**Request:**
```json
{
  "message": "Can I buy a ₹70,000 phone next month?"
}
```

**Response (200 OK):**
```json
{
  "intent": "purchase_simulation",
  "item": "phone",
  "amount": 70000.0,
  "time_period": "next_month",
  "payment_method": null,
  "goal": null
}
```

---

### 3. Transaction Processing


#### `POST /api/v1/transactions`
**Request:**
```json
{
  "title": "Quarterly Performance Bonus",
  "type": "income",
  "amount": 25000.0,
  "category": "Salary",
  "transaction_date": "2026-09-17",
  "is_recurring": false,
  "recurring_frequency": "none",
  "description": "Q3 incentive"
}
```
**Response (201 Created):**
```json
{
  "id": "txn_3d91b8a4f201",
  "title": "Quarterly Performance Bonus",
  "type": "income",
  "amount": 25000.0,
  "category": "Salary",
  "transaction_date": "2026-09-17",
  "is_recurring": false,
  "recurring_frequency": "none",
  "description": "Q3 incentive"
}
```

#### `GET /api/v1/transactions/summary`
**Response (200 OK):**
```json
{
  "total_income": 80000.0,
  "total_expenses": 41000.0,
  "net_savings": 39000.0,
  "savings_rate_pct": 48.75,
  "monthly_estimated_income": 80000.0,
  "monthly_estimated_expenses": 41000.0,
  "monthly_estimated_savings": 39000.0,
  "category_wise_spending": [
    {
      "category": "Rent",
      "total_amount": 20000.0,
      "percentage_of_total_expense": 48.78,
      "transaction_count": 1
    },
    {
      "category": "Groceries",
      "total_amount": 10000.0,
      "percentage_of_total_expense": 24.39,
      "transaction_count": 1
    }
  ],
  "recurring_summary": {
    "total_recurring_income": 80000.0,
    "total_recurring_expenses": 35500.0,
    "recurring_items_count": 5
  },
  "total_transactions": 7
}
```

---

### 3. Financial Simulation Engine

#### `POST /api/v1/simulate/position`
**Request:**
```json
{
  "monthly_income": 80000.0,
  "monthly_expenses": 45000.0,
  "current_savings": 200000.0,
  "existing_emi": 5000.0
}
```
**Response (200 OK):**
```json
{
  "monthly_income": 80000.0,
  "monthly_expenses": 45000.0,
  "existing_emi": 5000.0,
  "monthly_surplus": 30000.0,
  "savings_rate_pct": 37.5,
  "current_savings": 200000.0,
  "emergency_fund_months": 4.4,
  "projected_balance_3_months": 290000.0,
  "projected_balance_6_months": 380000.0,
  "projected_balance_12_months": 560000.0,
  "assumptions": [
    "Income remains fixed at ₹80,000.00/month",
    "Expenses remain fixed at ₹45,000.00/month",
    "Ongoing EMI liability of ₹5,000.00/month",
    "Linear cash flow accumulation with zero interest return unless specified in projections"
  ]
}
```

#### `POST /api/v1/simulate/purchase`
**Request:**
```json
{
  "monthly_income": 80000.0,
  "monthly_expenses": 45000.0,
  "current_savings": 200000.0,
  "purchase_amount": 70000.0,
  "existing_emi": 0.0,
  "duration_months": 12
}
```
**Response (200 OK):**
```json
{
  "scenario": "upfront_cash_purchase",
  "purchase_amount": 70000.0,
  "initial_savings": 200000.0,
  "post_purchase_savings": 130000.0,
  "monthly_surplus": 35000.0,
  "months_to_recover_cost": 2,
  "emergency_fund_runway_months": 2.9,
  "is_savings_depleted": false,
  "baseline_projected_savings": {
    "3_months": 305000.0,
    "6_months": 410000.0,
    "12_months": 620000.0
  },
  "post_purchase_projected_savings": {
    "3_months": 235000.0,
    "6_months": 340000.0,
    "12_months": 550000.0
  },
  "monthly_trajectory": [
    {
      "month": 1,
      "starting_balance": 130000.0,
      "monthly_surplus": 35000.0,
      "interest_earned": 0.0,
      "closing_balance": 165000.0
    }
  ],
  "assumptions": [
    "Monthly income remains stable at ₹80,000.00",
    "Monthly expenses remain constant at ₹45,000.00",
    "Purchase of ₹70,000.00 is fully paid upfront from current savings",
    "No inflation or investment returns factored unless explicitly specified"
  ]
}
```

#### `POST /api/v1/simulate/emi`
**Request:**
```json
{
  "purchase_amount": 70000.0,
  "down_payment": 10000.0,
  "annual_interest_rate_pct": 12.0,
  "tenure_months": 12,
  "monthly_income": 80000.0,
  "monthly_expenses": 45000.0,
  "current_savings": 200000.0,
  "existing_emi": 0.0
}
```
**Response (200 OK):**
```json
{
  "scenario": "emi_financed_purchase",
  "purchase_amount": 70000.0,
  "down_payment": 10000.0,
  "loan_amount": 60000.0,
  "annual_interest_rate_pct": 12.0,
  "tenure_months": 12,
  "monthly_emi": 5330.93,
  "total_repayment": 63971.16,
  "total_interest": 3971.16,
  "interest_to_principal_ratio_pct": 6.62,
  "new_monthly_surplus_during_tenure": 29669.07,
  "monthly_surplus_after_tenure": 35000.0,
  "savings_at_purchase": 190000.0,
  "projected_savings": {
    "3_months": 279007.21,
    "6_months": 368014.42,
    "12_months": 546028.84
  },
  "impact_analysis": {
    "monthly_emi_burden_pct_of_income": 6.66,
    "total_debt_to_income_pct": 6.66,
    "interest_premium_over_cash_purchase": 3971.16,
    "cash_buffer_retained_vs_upfront_cash": 60000.0
  },
  "assumptions": [
    "Down payment of ₹10,000.00 deducted immediately from savings",
    "Loan principal ₹60,000.00 financed at 12.00% p.a. for 12 months",
    "Monthly EMI of ₹5,330.93 deducted during the 12-month tenure",
    "Surplus resets back to ₹35,000.00/month after month 12"
  ]
}
```

---

### 4. Goal Engine (Forward & Reverse)

#### `POST /api/v1/goals`
**Request:**
```json
{
  "target_amount": 500000.0,
  "current_savings_allocated": 100000.0,
  "target_months": 12,
  "monthly_income": 80000.0,
  "monthly_expenses": 45000.0,
  "existing_emi": 0.0,
  "expected_annual_return_pct": 0.0
}
```
**Response (200 OK):**
```json
{
  "target_amount": 500000.0,
  "current_savings_allocated": 100000.0,
  "remaining_amount": 400000.0,
  "target_months": 12,
  "current_monthly_surplus": 35000.0,
  "required_monthly_saving": 33333.33,
  "monthly_gap_or_shortfall": 0.0,
  "monthly_excess_buffer": 1666.67,
  "is_reachable": true,
  "projected_completion_months_at_current_rate": 12,
  "status": "reachable",
  "status_description": "Goal is fully reachable within the desired timeframe at your current savings rate.",
  "assumptions": [
    "Monthly income remains stable at ₹80,000.00",
    "Monthly living expenses remain stable at ₹45,000.00",
    "Expected annual investment return is 0.0%",
    "Target corpus is ₹500,000.00 in 12 months"
  ]
}
```

#### `POST /api/v1/goals/reverse`
**Request:**
```json
{
  "target_amount": 500000.0,
  "target_months": 12,
  "current_monthly_income": 80000.0,
  "current_monthly_expenses": 45000.0,
  "existing_emi": 0.0
}
```
**Response (200 OK):**
```json
{
  "target_amount": 500000.0,
  "target_months": 12,
  "required_monthly_saving": 41666.67,
  "current_monthly_surplus": 35000.0,
  "additional_monthly_needed": 6666.67,
  "is_currently_sufficient": false,
  "alternative_timeline_at_current_surplus_months": 15,
  "actionable_levers": {
    "required_monthly_saving": 41666.67,
    "current_surplus": 35000.0,
    "additional_monthly_needed": 6666.67,
    "suggested_expense_cut_amount": 6666.67,
    "suggested_expense_reduction_pct": 14.81,
    "suggested_income_increase_pct": 8.33,
    "suggested_extended_timeline_months": 15
  },
  "assumptions": [
    "Target corpus of ₹500,000.00 desired in 12 months",
    "Calculated with 0.0% expected annual growth rate"
  ]
}
```

---

### 5. Experiment Lab (Multi-Scenario Comparison)

#### `POST /api/v1/experiments/compare`
**Request:**
```json
{
  "monthly_income": 80000.0,
  "monthly_expenses": 45000.0,
  "current_savings": 200000.0,
  "existing_emi": 0.0,
  "target_goal_amount": 500000.0,
  "target_goal_months": 12,
  "scenarios": [
    {
      "scenario_id": "sc_a",
      "scenario_name": "Scenario A: No Purchase",
      "scenario_type": "no_purchase"
    },
    {
      "scenario_id": "sc_b",
      "scenario_name": "Scenario B: Cash Purchase ₹70,000",
      "scenario_type": "cash_purchase",
      "purchase_amount": 70000.0
    },
    {
      "scenario_id": "sc_c",
      "scenario_name": "Scenario C: EMI Purchase (10k Down, 12M @ 12%)",
      "scenario_type": "emi_purchase",
      "purchase_amount": 70000.0,
      "down_payment": 10000.0,
      "annual_interest_rate_pct": 12.0,
      "tenure_months": 12
    }
  ]
}
```
**Response (200 OK):**
```json
{
  "base_profile": {
    "monthly_income": 80000.0,
    "monthly_expenses": 45000.0,
    "current_savings": 200000.0,
    "existing_emi": 0.0,
    "target_goal_amount": 500000.0,
    "target_goal_months": 12.0
  },
  "comparison_matrix": [
    {
      "scenario_id": "sc_a",
      "scenario_name": "Scenario A: No Purchase",
      "scenario_type": "no_purchase",
      "monthly_surplus": 35000.0,
      "immediate_savings_after_action": 200000.0,
      "projected_savings_3_months": 305000.0,
      "projected_savings_6_months": 410000.0,
      "projected_savings_12_months": 620000.0,
      "projected_savings_24_months": 1040000.0,
      "emergency_fund_coverage_months": 4.4,
      "goal_completion_months": 9,
      "goal_reachable_in_target_timeline": true,
      "total_interest_or_cost_paid": 0.0,
      "risk_level": "Low",
      "trade_off_summary": "Maximizes liquidity preservation and goal progress; foregoes purchase."
    },
    {
      "scenario_id": "sc_b",
      "scenario_name": "Scenario B: Cash Purchase ₹70,000",
      "scenario_type": "cash_purchase",
      "monthly_surplus": 35000.0,
      "immediate_savings_after_action": 130000.0,
      "projected_savings_3_months": 235000.0,
      "projected_savings_6_months": 340000.0,
      "projected_savings_12_months": 550000.0,
      "projected_savings_24_months": 970000.0,
      "emergency_fund_coverage_months": 2.9,
      "goal_completion_months": 11,
      "goal_reachable_in_target_timeline": true,
      "total_interest_or_cost_paid": 70000.0,
      "risk_level": "Moderate (Emergency Runway < 3 months)",
      "trade_off_summary": "0% interest cost, but drains ₹70,000.00 immediate liquidity and delays goal."
    },
    {
      "scenario_id": "sc_c",
      "scenario_name": "Scenario C: EMI Purchase (10k Down, 12M @ 12%)",
      "scenario_type": "emi_purchase",
      "monthly_surplus": 29669.07,
      "immediate_savings_after_action": 190000.0,
      "projected_savings_3_months": 279007.21,
      "projected_savings_6_months": 368014.42,
      "projected_savings_12_months": 546028.84,
      "projected_savings_24_months": 966028.84,
      "emergency_fund_coverage_months": 4.2,
      "goal_completion_months": 11,
      "goal_reachable_in_target_timeline": true,
      "total_interest_or_cost_paid": 3971.16,
      "risk_level": "Moderate",
      "trade_off_summary": "Preserves ₹60,000.00 liquidity upfront; incurs ₹3,971.16 interest and tightens cash flow for 12 months."
    }
  ],
  "summary_insights": [
    "Evaluated 3 scenarios against baseline monthly income ₹80,000.00 and savings ₹200,000.00",
    "Target goal of ₹500,000.00 in 12 months analyzed for all paths",
    "Comparative balance and liquidity runways generated across 3, 6, 12, and 24 months"
  ],
  "assumptions": [
    "Income and expense streams remain constant over the 24-month projection window",
    "EMI interest calculated via standard reducing-balance amortization",
    "No penalty fees, prepayments, or tax deductions are factored"
  ]
}
```

---

### 6. Financial Radar (Risk & Anomaly Engine)

#### `GET /api/v1/radar`
**Response (200 OK):**
```json
{
  "overall_health": "excellent",
  "health_score": 100,
  "total_alerts": 2,
  "alerts": [
    {
      "id": "radar_recurring_info",
      "category": "recurring_expense",
      "severity": "info",
      "title": "Tracked Recurring Commitments",
      "message": "5 recurring items totaling ₹35,500.00/month.",
      "metric_value": 35500.0,
      "threshold_value": 40000.0,
      "trigger_rule": "Fixed commitments within healthy range (<= 50%)",
      "impact": "Healthy ratio of recurring commitments."
    }
  ],
  "metrics_summary": {
    "monthly_income": 80000.0,
    "monthly_expenses": 41000.0,
    "monthly_surplus": 39000.0,
    "savings_rate_pct": 48.75,
    "current_savings": 200000.0,
    "emergency_fund_months": 4.88,
    "debt_to_income_pct": 0.0,
    "recurring_expense_ratio_pct": 44.38
  },
  "radar_rules_evaluated": 5,
  "assumptions": [
    "Rule checks evaluated on current cash flow and historical transaction thresholds",
    "Emergency fund baseline targeted at 3.0 months of living expenses",
    "High expense anomaly threshold calibrated to 35.0% of monthly income"
  ]
}
```

---

## 🤝 Frontend Integration Guide (For Teammate)

1. **Base URL**: `http://localhost:8000` (or `http://localhost:8000/api/v1` for versioned routing).
2. **CORS**: Fully configured with `allow_origins=["*"]`, `allow_methods=["*"]`, `allow_headers=["*"]`. You can fetch directly from React/Next.js/Vue/Vite without proxy configurations.
3. **Pydantic Validation**: All endpoints return clean HTTP 422 errors if payloads are malformed, with field-level details.
4. **Interactive Playground**: Inspect and test any schema at `http://localhost:8000/docs`.

---

## 🛡️ Financial Safety & Compliance

- **No Absolute Recommendations**: The engine never outputs prescriptive directives such as *"Buy this"*, *"Do not buy this"*, or *"This is your best choice"*.
- **Objective Metrics & Trade-Offs**: All responses return mathematical calculations, stated assumptions, multi-horizon projections, and trade-off summaries so the user makes their own informed decision.
- **Educational Simulation Tool**: Intended solely for personal financial modeling and simulation.

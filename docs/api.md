# Money Lens — Frontend ↔ Backend API Contract Specification

This document defines the agreed API contract between the Next.js Frontend and the FastAPI / Amazon Bedrock Python Backend.

## Architecture Principle
> "Money Lens follows a separation-of-concerns architecture where the Next.js frontend handles presentation and user interaction, the Python backend owns financial business logic and data access, and Amazon Bedrock provides natural-language intelligence and explanations."

---

## Base URL
- Development: `http://localhost:8000`
- Production: `https://<api-gateway-or-alb-url>`

---

## Endpoints

### 1. Dashboard Overview
- **Method**: `GET /api/v1/dashboard`
- **Description**: Returns top-level summary metrics, 12-month baseline trajectory, active goals preview, and radar alerts.
- **Response**:
```json
{
  "summary": {
    "currentSavings": 40000,
    "monthlyIncome": 55000,
    "monthlyExpenses": 25000,
    "activeGoals": 2,
    "netSavingsRate": 54.5,
    "savingsChangeMonthOverMonth": 8.2
  },
  "trajectory": {
    "baselineProjection": [
      {
        "month": "Oct 2026",
        "income": 55000,
        "expenses": 25000,
        "savings": 30000,
        "balance": 70000
      }
    ],
    "milestones": [
      {
        "month": "Dec 2026",
        "title": "Target: New Phone Goal",
        "amount": 70000,
        "type": "goal"
      }
    ]
  },
  "goals": [
    {
      "id": "g-1",
      "name": "New Phone (Flagship)",
      "category": "purchase",
      "targetAmount": 70000,
      "currentAmount": 40000,
      "targetDate": "2026-12-31",
      "monthlyAllocation": 10000,
      "isCompleted": false,
      "priority": "high"
    }
  ],
  "radar": {
    "pressureIndex": 28,
    "upcomingEvents": [
      {
        "id": "r-1",
        "title": "Upcoming House Rent",
        "amount": 15000,
        "type": "recurring_expense",
        "dueDate": "2026-10-01",
        "daysRemaining": 5,
        "isCritical": true
      }
    ],
    "alerts": [
      {
        "id": "a-1",
        "severity": "warning",
        "title": "Potential cash-flow pressure",
        "description": "Projected liquidity dip around early month recurring bills.",
        "estimatedWindow": "Oct 01 - Oct 05"
      }
    ]
  }
}
```

---

### 2. Financial Time Machine (Simulator)
- **Method**: `POST /api/v1/simulations`
- **Request Body**:
```json
{
  "scenarioType": "emi",
  "purchaseAmount": 80000,
  "downPayment": 10000,
  "durationMonths": 12,
  "interestRate": 14.5
}
```
- **Response**:
```json
{
  "scenarioId": "sim-883",
  "scenarioType": "emi",
  "purchaseAmount": 80000,
  "monthlyImpact": 6667,
  "lowestProjectedBalance": 32000,
  "goalDelayMonths": 2,
  "cashFlowPressureLevel": "medium",
  "projection": [
    {
      "month": "Oct 2026",
      "income": 55000,
      "expenses": 25000,
      "savings": 23333,
      "balance": 63333
    }
  ]
}
```

---

### 3. Natural Language Intent Parsing
- **Method**: `POST /api/v1/ai/parse`
- **Request Body**:
```json
{
  "prompt": "I want to buy an 80,000 rupee iPhone on 12-month EMI"
}
```
- **Response**:
```json
{
  "scenarioType": "emi",
  "purchaseAmount": 80000,
  "durationMonths": 12
}
```

---

### 4. Goal Engine
- `GET    /api/v1/goals`
- `POST   /api/v1/goals`
- `PATCH  /api/v1/goals/{id}`
- `DELETE /api/v1/goals/{id}`

---

### 5. Reverse Time Machine
- **Method**: `POST /api/v1/reverse`
- **Request Body**:
```json
{
  "targetAmount": 100000,
  "currentSavings": 40000,
  "targetDate": "2027-03-31"
}
```

---

### 6. Financial Radar
- **Method**: `GET /api/v1/radar`

---

### 7. Experiment Lab
- **Method**: `POST /api/v1/experiments`

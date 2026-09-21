# Monexa AI Insight Service

An independent, Groq-powered AI insight layer for the [Monexa](../README.md) financial simulator. This service accepts structured output from the Monexa financial engine and returns human-readable observations, risks, insights, and actionable steps.

> **This service does NOT perform financial calculations.** All numbers come from the Monexa financial engine. The AI layer only interprets and explains them.

---

## Project Structure

```
ai/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI application entry point
│   ├── schemas.py       # Pydantic request & response models
│   ├── prompts.py       # System & user prompt templates
│   └── services/
│       ├── __init__.py
│       └── groq_service.py  # Groq SDK wrapper
├── tests/
│   └── test_ai_service.py   # Unit & integration tests (no real API calls)
├── .env.example         # Environment variable template
├── .gitignore
├── requirements.txt
└── README.md            # ← you are here
```

---

## Prerequisites

- Python 3.11+
- A [Groq](https://console.groq.com/) account with a **free-tier API key**

---

## 1 — Create a Virtual Environment

```bash
# From the ai/ directory
python -m venv .venv

# Activate (Windows PowerShell)
.venv\Scripts\Activate.ps1

# Activate (macOS / Linux)
source .venv/bin/activate
```

---

## 2 — Install Requirements

```bash
pip install -r requirements.txt
```

---

## 3 — Configure `.env`

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```dotenv
# Groq API Configuration
GROQ_API_KEY=gsk_your_actual_key_here
GROQ_MODEL=openai/gpt-oss-120b

# Optional — override defaults
AI_SERVICE_HOST=0.0.0.0
AI_SERVICE_PORT=8001
```

> ⚠️ **Never commit `.env`** to version control. It is listed in `.gitignore`.

---

## 4 — Start the AI Service

```bash
# From the ai/ directory (with .venv active)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

Or use the built-in entrypoint:

```bash
python -m app.main
```

The service will be available at:
- **API**: `http://localhost:8001`
- **Swagger UI**: `http://localhost:8001/docs`
- **ReDoc**: `http://localhost:8001/redoc`
- **Health check**: `http://localhost:8001/health`

---

## 5 — Run Tests

Tests mock the Groq API — **no real API calls are made**.

```bash
# From the ai/ directory (with .venv active)
pytest tests/ -v
```

---

## API Reference

### `GET /health`

Returns service status.

```json
{
  "status": "healthy",
  "service": "MoneyLens AI Insight Service",
  "version": "1.0.0",
  "provider": "groq",
  "model": "openai/gpt-oss-120b"
}
```

---

### `POST /analyze`

Submit structured MoneyLens financial-engine output for AI analysis.

**Request Body** (all top-level fields are optional — provide whichever data the engine has computed):

```json
{
  "context_note": "User is considering buying a ₹70,000 laptop on EMI.",
  "financial_position": {
    "monthly_income": 80000.0,
    "monthly_expenses": 45000.0,
    "existing_emi": 5000.0,
    "monthly_surplus": 30000.0,
    "savings_rate_pct": 37.5,
    "current_savings": 200000.0,
    "emergency_fund_months": 4.4,
    "projected_balance_3_months": 290000.0,
    "projected_balance_6_months": 380000.0,
    "projected_balance_12_months": 560000.0
  },
  "simulation_result": {
    "scenario": "emi_financed_purchase",
    "data": {
      "purchase_amount": 70000.0,
      "down_payment": 10000.0,
      "loan_amount": 60000.0,
      "annual_interest_rate_pct": 12.0,
      "tenure_months": 12,
      "monthly_emi": 5327.0,
      "total_repayment": 63924.0,
      "total_interest": 3924.0,
      "new_monthly_surplus_during_tenure": 24673.0,
      "monthly_surplus_after_tenure": 30000.0
    }
  },
  "goals": [
    {
      "title": "Emergency Fund",
      "target_amount": 500000.0,
      "current_savings_allocated": 200000.0,
      "target_months": 12,
      "is_reachable": true,
      "monthly_gap_or_shortfall": 0.0,
      "status": "on_track",
      "status_description": "Goal is reachable within the target timeline."
    }
  ],
  "radar_alerts": [
    {
      "id": "alert_emi_01",
      "category": "debt_burden_risk",
      "severity": "medium",
      "title": "EMI Commitment After Purchase",
      "message": "Post-purchase total EMI will be ₹10,327 — 12.9% of monthly income.",
      "metric_value": 12.9,
      "threshold_value": 40.0,
      "impact": "Manageable, but reduces savings flexibility."
    }
  ],
  "scenario_comparisons": [
    {
      "scenario_id": "a",
      "scenario_name": "No Purchase (Status Quo)",
      "scenario_type": "no_purchase",
      "monthly_surplus": 30000.0,
      "projected_savings_12_months": 560000.0,
      "emergency_fund_coverage_months": 4.4,
      "goal_reachable_in_target_timeline": true,
      "total_interest_or_cost_paid": 0.0,
      "risk_level": "low",
      "trade_off_summary": "Highest savings growth; no new asset."
    },
    {
      "scenario_id": "b",
      "scenario_name": "EMI Purchase (12 months @ 12%)",
      "scenario_type": "emi_purchase",
      "monthly_surplus": 24673.0,
      "projected_savings_12_months": 496076.0,
      "emergency_fund_coverage_months": 4.4,
      "goal_reachable_in_target_timeline": true,
      "total_interest_or_cost_paid": 3924.0,
      "risk_level": "medium",
      "trade_off_summary": "Acquires asset immediately; modest interest cost."
    }
  ]
}
```

**Example Response:**

```json
{
  "summary": "Your financial position is healthy with a 37.5% savings rate and a ₹30,000 monthly surplus. An EMI purchase of ₹70,000 at 12% interest over 12 months would cost ₹3,924 in interest, reducing your monthly surplus to ₹24,673 during the tenure. Both scenarios keep your emergency-fund goal on track.",
  "observations": [
    "Current emergency fund covers 4.4 months of expenses — slightly below the recommended 6-month buffer.",
    "The EMI option adds ₹5,327/month to your commitments, bringing total EMI to ₹10,327 (12.9% of income).",
    "Scenario B (EMI) yields ₹496,076 in savings after 12 months versus ₹560,000 in Scenario A — a ₹63,924 opportunity cost."
  ],
  "risks": [
    "Emergency fund sits below the 6-month recommended buffer; any unexpected expense could create a shortfall.",
    "Taking on new EMI reduces the monthly buffer available for unplanned costs during the 12-month tenure."
  ],
  "insights": [
    "The interest cost of ₹3,924 over 12 months is relatively low given the ₹70,000 purchase — roughly a 5.6% premium for immediate access to the asset.",
    "Both scenarios keep the Emergency Fund goal reachable within the target timeline, suggesting the EMI option is financially feasible."
  ],
  "possible_actions": [
    "Consider building the emergency fund to ₹2.7 lakh (6 months) before committing to the EMI.",
    "If the purchase is time-sensitive, the EMI route is manageable — prioritise automating a ₹5,000/month top-up to the emergency fund during the EMI tenure.",
    "Evaluate whether a shorter EMI tenure (e.g., 6 months) at a higher monthly payment reduces total interest while remaining within your surplus capacity."
  ]
}
```

---

## Notes on Architecture

| Concern | Decision |
|---|---|
| **Provider** | Groq free tier — `openai/gpt-oss-120b` |
| **API key** | Loaded from `.env` via `python-dotenv`; never hardcoded |
| **Port** | `8001` (avoids conflict with MoneyLens backend on `8000`) |
| **Database** | Not connected — independent service |
| **Financial calculations** | Not performed — AI only interprets engine output |
| **Secrets in tests** | No real API calls; Groq client fully mocked |

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GROQ_API_KEY` | ✅ | — | Your Groq API key |
| `GROQ_MODEL` | ❌ | `openai/gpt-oss-120b` | Groq model identifier |
| `AI_SERVICE_HOST` | ❌ | `0.0.0.0` | Bind host |
| `AI_SERVICE_PORT` | ❌ | `8001` | Bind port |

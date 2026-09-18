# 🔭 MoneyLens — AI-Powered Financial Future Simulator

> *See your financial future before you make today's decision.*

MoneyLens is an AI-powered financial simulation platform that helps users understand how today's financial decisions affect their financial future. It combines an **Amazon Bedrock AI Interpretation Layer** (`amazon.nova-micro-v1:0` via Bedrock Converse API) for natural-language query comprehension with a strict **Deterministic Financial Engine** for upfront purchase simulations, reducing-balance EMI loan calculations, goal feasibility analysis, multi-scenario experiment labs, and financial radar risk detection.

---

## 🏗 Repository Structure

```
MoneyLens/
├── backend/                  # FastAPI Python deterministic financial simulation engine
│   ├── app/
│   │   ├── core/             # Configuration & AWS Bedrock settings
│   │   ├── routes/           # REST routes including /api/v1/ai/analyze
│   │   ├── schemas/          # Pydantic schemas (simulation, transactions, AI intent)
│   │   ├── services/         # Deterministic engines & Bedrock service
│   │   ├── utils/            # Pure mathematical financial formulas
│   │   └── main.py
│   ├── tests/                # Automated pytest suite with Bedrock mocks
│   ├── requirements.txt
│   ├── .gitignore
│   └── README.md             # Detailed backend API & calculations documentation
│
├── frontend/                 # Next.js / React / TypeScript frontend
│
└── docker-compose.yml
```

---

## 🚀 Quick Start

### Backend (FastAPI + Amazon Bedrock)
For full API documentation, mathematical formulas, and AWS setup, see the [Backend README](backend/README.md).

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)
- **AI Analyze Endpoint**: `POST /api/v1/ai/analyze`

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing

Run backend tests:
```bash
cd backend
python -m pytest -q
```
*(Automated test cases covering EMI math, compounding projections, goal feasibility, rule-based radar, Bedrock Converse parsing, and API endpoints).*


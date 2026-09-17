# 🔭 MoneyLens — AI-Powered Financial Future Simulator

> *See your financial future before you make today's decision.*

MoneyLens is an AI-powered financial simulation platform that helps users understand how today's financial decisions affect their financial future through deterministic modeling, upfront purchase simulations, reducing-balance EMI loan calculations, goal feasibility analysis, multi-scenario experiment labs, and financial radar risk detection.

---

## 🏗 Repository Structure

```
MoneyLens/
├── backend/                  # FastAPI Python deterministic financial simulation engine
│   ├── app/
│   │   ├── core/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── utils/
│   │   └── main.py
│   ├── tests/
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

### Backend (FastAPI)
For full API documentation, mathematical formulas, and test cases, see the [Backend README](backend/README.md).

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

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
*(33 automated test cases covering EMI math, compounding projections, goal feasibility, and API endpoints).*

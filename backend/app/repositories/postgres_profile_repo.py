"""
PostgreSQL Financial Profile Repository.
Provides CRUD operations for user financial profiles with user data isolation.
Supports in-memory fallback for local development without active RDS connection.
"""

import uuid
from typing import Optional, Dict, Any
from app.core.database import get_db_connection
from app.core.config import settings
from app.schemas.profile import (
    FinancialProfileCreate,
    FinancialProfileUpdate,
    FinancialProfileResponse,
)

# Module-level shared profile store so ALL repo instances see the same data.
# Critical: StatementService.profile_repo and ProfileService.profile_repo
# must share state so an upload immediately reflects in /profile API calls.
_SHARED_PROFILES: Dict[str, Dict[str, Any]] = {}


class PostgresProfileRepository:
    """PostgreSQL repository for user financial profiles."""

    def __init__(self):
        # Point to the shared module-level store
        self._in_memory_profiles = _SHARED_PROFILES


    def _compute_metrics(self, data: Dict[str, Any]) -> Dict[str, Any]:
        income = float(data.get("monthly_income", 0.0))
        essential = float(data.get("essential_expenses", 0.0))
        discretionary = float(data.get("discretionary_expenses", 0.0))
        savings = float(data.get("current_savings", 0.0))
        investments = float(data.get("monthly_investments", 0.0))
        emis = float(data.get("active_emis", 0.0))
        loans = float(data.get("active_loans", 0.0))
        recurring = float(data.get("other_recurring_expenses", 0.0))

        total_expenses = essential + discretionary + emis + recurring
        monthly_surplus = income - (total_expenses + investments)
        savings_rate_pct = round((investments / income * 100), 1) if income > 0 else 0.0
        dti_ratio_pct = round((emis / income * 100), 1) if income > 0 else 0.0
        runway = round(savings / total_expenses, 1) if total_expenses > 0 else (round(savings / 1.0, 1) if savings > 0 else 0.0)

        # Health score calculation
        if income == 0 and total_expenses == 0 and savings == 0:
            health_score = 50
        else:
            score = 50
            if runway >= 6:
                score += 20
            elif runway >= 3:
                score += 10
            if savings_rate_pct >= 20:
                score += 15
            elif savings_rate_pct >= 10:
                score += 8
            if dti_ratio_pct < 20 and emis > 0:
                score += 10
            elif dti_ratio_pct > 40:
                score -= 15
            if monthly_surplus > 0:
                score += 5
            health_score = min(98, max(40, score))

        return {
            "total_monthly_expenses": total_expenses,
            "monthly_surplus": monthly_surplus,
            "savings_rate_pct": savings_rate_pct,
            "dti_ratio_pct": dti_ratio_pct,
            "emergency_fund_runway_months": runway,
            "health_score": health_score,
        }

    def get_profile(self, user_id: str) -> Optional[FinancialProfileResponse]:
        """Fetch profile for given user_id."""
        if not settings.is_db_configured():
            data = self._in_memory_profiles.get(user_id)
            if not data:
                # Default baseline profile for current user
                data = {
                    "id": f"prof_{user_id}",
                    "user_id": user_id,
                    "name": "User",
                    "monthly_income": 0.0,
                    "essential_expenses": 0.0,
                    "discretionary_expenses": 0.0,
                    "current_savings": 0.0,
                    "monthly_investments": 0.0,
                    "active_emis": 0.0,
                    "active_loans": 0.0,
                    "other_recurring_expenses": 0.0,
                }
                self._in_memory_profiles[user_id] = data

            clean_data = {k: v for k, v in data.items() if k not in ["total_monthly_expenses", "monthly_surplus", "savings_rate_pct", "dti_ratio_pct", "emergency_fund_runway_months", "health_score"]}
            metrics = self._compute_metrics(clean_data)
            return FinancialProfileResponse(**clean_data, **metrics)

        try:
            query = """
            SELECT id, user_id, name, monthly_income, essential_expenses, discretionary_expenses,
                   current_savings, monthly_investments, active_emis, active_loans, other_recurring_expenses,
                   created_at, updated_at
            FROM user_profiles
            WHERE user_id = %(user_id)s;
            """
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(query, {"user_id": user_id})
                    row = cur.fetchone()
                    if not row:
                        return None
                    clean_row = dict(row)
                    metrics = self._compute_metrics(clean_row)
                    return FinancialProfileResponse(**clean_row, **metrics)
        except Exception:
            # Fallback to in-memory if DB call fails
            data = self._in_memory_profiles.get(user_id, {
                "id": f"prof_{user_id}",
                "user_id": user_id,
                "name": "User",
                "monthly_income": 0.0,
                "essential_expenses": 0.0,
                "discretionary_expenses": 0.0,
                "current_savings": 0.0,
                "monthly_investments": 0.0,
                "active_emis": 0.0,
                "active_loans": 0.0,
                "other_recurring_expenses": 0.0,
            })
            clean_data = {k: v for k, v in data.items() if k not in ["total_monthly_expenses", "monthly_surplus", "savings_rate_pct", "dti_ratio_pct", "emergency_fund_runway_months", "health_score"]}
            metrics = self._compute_metrics(clean_data)
            return FinancialProfileResponse(**clean_data, **metrics)

    def upsert_profile(self, user_id: str, updates: FinancialProfileUpdate) -> FinancialProfileResponse:
        """Create or update financial profile for user_id."""
        existing = self.get_profile(user_id)
        current_data = existing.model_dump() if existing else {
            "id": f"prof_{uuid.uuid4().hex[:8]}",
            "user_id": user_id,
            "name": "User",
            "monthly_income": 0.0,
            "essential_expenses": 0.0,
            "discretionary_expenses": 0.0,
            "current_savings": 0.0,
            "monthly_investments": 0.0,
            "active_emis": 0.0,
            "active_loans": 0.0,
            "other_recurring_expenses": 0.0,
        }

        # Apply non-null updates
        for field, value in updates.model_dump(exclude_unset=True).items():
            if value is not None:
                current_data[field] = value

        self._in_memory_profiles[user_id] = current_data

        if settings.is_db_configured():
            try:
                upsert_query = """
                INSERT INTO user_profiles (
                    id, user_id, name, monthly_income, essential_expenses, discretionary_expenses,
                    current_savings, monthly_investments, active_emis, active_loans, other_recurring_expenses, updated_at
                ) VALUES (
                    %(id)s, %(user_id)s, %(name)s, %(monthly_income)s, %(essential_expenses)s, %(discretionary_expenses)s,
                    %(current_savings)s, %(monthly_investments)s, %(active_emis)s, %(active_loans)s, %(other_recurring_expenses)s, CURRENT_TIMESTAMP
                )
                ON CONFLICT (user_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    monthly_income = EXCLUDED.monthly_income,
                    essential_expenses = EXCLUDED.essential_expenses,
                    discretionary_expenses = EXCLUDED.discretionary_expenses,
                    current_savings = EXCLUDED.current_savings,
                    monthly_investments = EXCLUDED.monthly_investments,
                    active_emis = EXCLUDED.active_emis,
                    active_loans = EXCLUDED.active_loans,
                    other_recurring_expenses = EXCLUDED.other_recurring_expenses,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING *;
                """
                with get_db_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute(upsert_query, current_data)
            except Exception:
                pass

        clean_data = {k: v for k, v in current_data.items() if k not in ["total_monthly_expenses", "monthly_surplus", "savings_rate_pct", "dti_ratio_pct", "emergency_fund_runway_months", "health_score"]}
        metrics = self._compute_metrics(clean_data)
        return FinancialProfileResponse(**clean_data, **metrics)

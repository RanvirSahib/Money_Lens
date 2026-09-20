"""
PostgreSQL Financial Profile Repository.
Provides CRUD operations for user financial profiles with user data isolation.
Supports in-memory fallback for local development without active RDS connection.
"""

import uuid
from typing import Optional, Dict, Any, List
from app.core.database import get_db_connection
from app.core.config import settings
from app.schemas.profile import (
    FinancialProfileCreate,
    FinancialProfileUpdate,
    FinancialProfileResponse,
    UserEMICreate,
    UserEMIUpdate,
    UserEMIResponse,
    UserSubscriptionCreate,
    UserSubscriptionUpdate,
    UserSubscriptionResponse,
    UserInvestmentCreate,
    UserInvestmentUpdate,
    UserInvestmentResponse,
)

# Module-level shared stores so ALL repo instances see the same data
_SHARED_PROFILES: Dict[str, Dict[str, Any]] = {}
_SHARED_EMIS: Dict[str, Dict[str, Any]] = {}
_SHARED_SUBSCRIPTIONS: Dict[str, Dict[str, Any]] = {}
_SHARED_INVESTMENTS: Dict[str, Dict[str, Any]] = {}


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
                    if row:
                        clean_row = dict(row)
                        metrics = self._compute_metrics(clean_row)
                        return FinancialProfileResponse(**clean_row, **metrics)

                    # If not in user_profiles, check users table to initialize
                    cur.execute(
                        "SELECT id, name, monthly_income, monthly_expenses, current_savings FROM users WHERE id = %(user_id)s OR LOWER(email) = LOWER(%(user_id)s);",
                        {"user_id": user_id}
                    )
                    u_row = cur.fetchone()
                    u_name = u_row["name"] if u_row and u_row.get("name") else "User"
                    inc = float(u_row.get("monthly_income") or 0.0) if u_row else 0.0
                    exp = float(u_row.get("monthly_expenses") or 0.0) if u_row else 0.0
                    sav = float(u_row.get("current_savings") or 0.0) if u_row else 0.0

                    clean_data = {
                        "id": f"prof_{user_id}",
                        "user_id": user_id,
                        "name": u_name,
                        "monthly_income": inc,
                        "essential_expenses": round(exp * 0.6, 2),
                        "discretionary_expenses": round(exp * 0.4, 2),
                        "current_savings": sav,
                        "monthly_investments": 0.0,
                        "active_emis": 0.0,
                        "active_loans": 0.0,
                        "other_recurring_expenses": 0.0,
                    }

                    # Persist newly initialized profile
                    cur.execute(
                        """
                        INSERT INTO user_profiles (
                            id, user_id, name, monthly_income, essential_expenses, discretionary_expenses,
                            current_savings, monthly_investments, active_emis, active_loans, other_recurring_expenses, updated_at
                        ) VALUES (
                            %(id)s, %(user_id)s, %(name)s, %(monthly_income)s, %(essential_expenses)s, %(discretionary_expenses)s,
                            %(current_savings)s, 0.0, 0.0, 0.0, 0.0, CURRENT_TIMESTAMP
                        )
                        ON CONFLICT (user_id) DO NOTHING;
                        """,
                        clean_data
                    )
                    metrics = self._compute_metrics(clean_data)
                    return FinancialProfileResponse(**clean_data, **metrics)
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

    def _calculate_emi_details(
        self,
        principal_amount: float,
        interest_rate_pct: float,
        tenure_months: int,
        remaining_months: Optional[int] = None,
        monthly_emi: Optional[float] = None
    ) -> tuple[float, int, float]:
        """Calculates exact deterministic reducing-balance EMI and total interest payable."""
        rem_months = remaining_months if remaining_months is not None and remaining_months > 0 else tenure_months
        rem_months = max(1, int(rem_months))
        tenure = max(1, int(tenure_months))
        p = float(principal_amount)
        r_pct = float(interest_rate_pct)

        if monthly_emi is not None and float(monthly_emi) > 0:
            calc_emi = round(float(monthly_emi), 2)
        else:
            if p <= 0:
                calc_emi = 0.0
            elif r_pct <= 0:
                calc_emi = round(p / tenure, 2)
            else:
                r = (r_pct / 100.0) / 12.0
                n = tenure
                calc_emi = round(p * (r * ((1 + r) ** n)) / (((1 + r) ** n) - 1), 2)

        total_interest = max(0.0, round((calc_emi * rem_months) - p, 2))
        return calc_emi, rem_months, total_interest

    def get_emis(self, user_id: str) -> List[UserEMIResponse]:
        """Fetch all active EMIs for a user."""
        if not settings.is_db_configured():
            user_emis = [
                UserEMIResponse(**item)
                for item in _SHARED_EMIS.values()
                if item.get("user_id") == user_id
            ]
            return sorted(user_emis, key=lambda x: x.monthly_emi, reverse=True)

        try:
            query = """
            SELECT id, user_id, name, category, principal_amount, interest_rate_pct,
                   tenure_months, remaining_months, monthly_emi, total_interest_payable,
                   start_date, created_at, updated_at
            FROM user_emis
            WHERE user_id = %(user_id)s
            ORDER BY monthly_emi DESC;
            """
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(query, {"user_id": user_id})
                    rows = cur.fetchall()
                    return [UserEMIResponse(**dict(row)) for row in rows]
        except Exception:
            user_emis = [
                UserEMIResponse(**item)
                for item in _SHARED_EMIS.values()
                if item.get("user_id") == user_id
            ]
            return sorted(user_emis, key=lambda x: x.monthly_emi, reverse=True)

    def create_emi(self, user_id: str, emi_in: UserEMICreate) -> UserEMIResponse:
        """Create a new active EMI and automatically recalibrate user profile."""
        emi_id = f"emi_{uuid.uuid4().hex[:8]}"
        calc_emi, rem_months, total_interest = self._calculate_emi_details(
            principal_amount=emi_in.principal_amount,
            interest_rate_pct=emi_in.interest_rate_pct,
            tenure_months=emi_in.tenure_months,
            remaining_months=emi_in.remaining_months,
            monthly_emi=emi_in.monthly_emi,
        )

        emi_data = {
            "id": emi_id,
            "user_id": user_id,
            "name": emi_in.name,
            "category": emi_in.category or "Personal Loan",
            "principal_amount": float(emi_in.principal_amount),
            "interest_rate_pct": float(emi_in.interest_rate_pct),
            "tenure_months": int(emi_in.tenure_months),
            "remaining_months": rem_months,
            "monthly_emi": calc_emi,
            "total_interest_payable": total_interest,
            "start_date": emi_in.start_date,
        }

        _SHARED_EMIS[emi_id] = emi_data

        if settings.is_db_configured():
            try:
                insert_query = """
                INSERT INTO user_emis (
                    id, user_id, name, category, principal_amount, interest_rate_pct,
                    tenure_months, remaining_months, monthly_emi, total_interest_payable,
                    start_date, updated_at
                ) VALUES (
                    %(id)s, %(user_id)s, %(name)s, %(category)s, %(principal_amount)s, %(interest_rate_pct)s,
                    %(tenure_months)s, %(remaining_months)s, %(monthly_emi)s, %(total_interest_payable)s,
                    %(start_date)s, CURRENT_TIMESTAMP
                )
                RETURNING *;
                """
                with get_db_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute(insert_query, emi_data)
                        row = cur.fetchone()
                        if row:
                            emi_data = dict(row)
            except Exception:
                pass

        # Recalibrate profile's active_emis and active_loans
        self._sync_profile_emis(user_id)
        return UserEMIResponse(**emi_data)

    def update_emi(self, user_id: str, emi_id: str, updates: UserEMIUpdate) -> Optional[UserEMIResponse]:
        """Update an existing EMI and recalibrate profile."""
        existing = _SHARED_EMIS.get(emi_id)
        if not existing and settings.is_db_configured():
            try:
                with get_db_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute("SELECT * FROM user_emis WHERE id = %(id)s AND user_id = %(user_id)s;", {"id": emi_id, "user_id": user_id})
                        row = cur.fetchone()
                        if row:
                            existing = dict(row)
            except Exception:
                pass

        if not existing:
            return None

        current = dict(existing)
        for field, val in updates.model_dump(exclude_unset=True).items():
            if val is not None:
                current[field] = val

        calc_emi, rem_months, total_interest = self._calculate_emi_details(
            principal_amount=current["principal_amount"],
            interest_rate_pct=current["interest_rate_pct"],
            tenure_months=current["tenure_months"],
            remaining_months=current.get("remaining_months"),
            monthly_emi=current.get("monthly_emi"),
        )
        current["monthly_emi"] = calc_emi
        current["remaining_months"] = rem_months
        current["total_interest_payable"] = total_interest

        _SHARED_EMIS[emi_id] = current

        if settings.is_db_configured():
            try:
                update_query = """
                UPDATE user_emis SET
                    name = %(name)s,
                    category = %(category)s,
                    principal_amount = %(principal_amount)s,
                    interest_rate_pct = %(interest_rate_pct)s,
                    tenure_months = %(tenure_months)s,
                    remaining_months = %(remaining_months)s,
                    monthly_emi = %(monthly_emi)s,
                    total_interest_payable = %(total_interest_payable)s,
                    start_date = %(start_date)s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %(id)s AND user_id = %(user_id)s
                RETURNING *;
                """
                with get_db_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute(update_query, current)
                        row = cur.fetchone()
                        if row:
                            current = dict(row)
            except Exception:
                pass

        self._sync_profile_emis(user_id)
        return UserEMIResponse(**current)

    def delete_emi(self, user_id: str, emi_id: str) -> bool:
        """Delete / close an active EMI and recalibrate profile."""
        deleted = False
        if emi_id in _SHARED_EMIS:
            del _SHARED_EMIS[emi_id]
            deleted = True

        if settings.is_db_configured():
            try:
                with get_db_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute("DELETE FROM user_emis WHERE id = %(id)s AND user_id = %(user_id)s RETURNING id;", {"id": emi_id, "user_id": user_id})
                        if cur.fetchone():
                            deleted = True
            except Exception:
                pass

        self._sync_profile_emis(user_id)
        return deleted

    def _sync_profile_emis(self, user_id: str) -> None:
        """Recalculates profile active_emis (monthly) and active_loans (principal) from user EMIs."""
        emis = self.get_emis(user_id)
        total_monthly_emis = round(sum(e.monthly_emi for e in emis), 2)
        total_loans = round(sum(e.principal_amount for e in emis), 2)
        self.upsert_profile(user_id, FinancialProfileUpdate(
            active_emis=total_monthly_emis,
            active_loans=total_loans,
        ))

    def _calculate_subscription_details(self, amount: float, billing_frequency: str) -> tuple[float, float]:
        """Calculates exact amortized monthly equivalent and annual cost."""
        freq = (billing_frequency or "monthly").lower().strip()
        amt = float(amount)
        if freq == "yearly" or freq == "annual":
            monthly_equiv = round(amt / 12.0, 2)
            annual_cost = round(amt, 2)
        elif freq == "quarterly":
            monthly_equiv = round(amt / 3.0, 2)
            annual_cost = round(amt * 4.0, 2)
        else:  # monthly
            monthly_equiv = round(amt, 2)
            annual_cost = round(amt * 12.0, 2)
        return monthly_equiv, annual_cost

    def get_subscriptions(self, user_id: str) -> List[UserSubscriptionResponse]:
        """Fetch all active subscriptions for a user."""
        if not settings.is_db_configured():
            subs = [
                UserSubscriptionResponse(**item)
                for item in _SHARED_SUBSCRIPTIONS.values()
                if item.get("user_id") == user_id
            ]
            return sorted(subs, key=lambda x: x.monthly_equivalent, reverse=True)

        try:
            query = """
            SELECT id, user_id, name, category, billing_frequency, amount,
                   monthly_equivalent, annual_cost, renewal_date, status, auto_renew,
                   created_at, updated_at
            FROM user_subscriptions
            WHERE user_id = %(user_id)s
            ORDER BY monthly_equivalent DESC;
            """
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(query, {"user_id": user_id})
                    rows = cur.fetchall()
                    return [UserSubscriptionResponse(**dict(row)) for row in rows]
        except Exception:
            subs = [
                UserSubscriptionResponse(**item)
                for item in _SHARED_SUBSCRIPTIONS.values()
                if item.get("user_id") == user_id
            ]
            return sorted(subs, key=lambda x: x.monthly_equivalent, reverse=True)

    def create_subscription(self, user_id: str, sub_in: UserSubscriptionCreate) -> UserSubscriptionResponse:
        """Create a new subscription and automatically recalibrate user profile."""
        sub_id = f"sub_{uuid.uuid4().hex[:8]}"
        monthly_equiv, annual_cost = self._calculate_subscription_details(
            amount=sub_in.amount,
            billing_frequency=sub_in.billing_frequency,
        )

        sub_data = {
            "id": sub_id,
            "user_id": user_id,
            "name": sub_in.name,
            "category": sub_in.category or "Streaming",
            "billing_frequency": (sub_in.billing_frequency or "monthly").lower(),
            "amount": float(sub_in.amount),
            "monthly_equivalent": monthly_equiv,
            "annual_cost": annual_cost,
            "renewal_date": sub_in.renewal_date,
            "status": sub_in.status or "active",
            "auto_renew": bool(sub_in.auto_renew),
        }

        _SHARED_SUBSCRIPTIONS[sub_id] = sub_data

        if settings.is_db_configured():
            try:
                insert_query = """
                INSERT INTO user_subscriptions (
                    id, user_id, name, category, billing_frequency, amount,
                    monthly_equivalent, annual_cost, renewal_date, status, auto_renew, updated_at
                ) VALUES (
                    %(id)s, %(user_id)s, %(name)s, %(category)s, %(billing_frequency)s, %(amount)s,
                    %(monthly_equivalent)s, %(annual_cost)s, %(renewal_date)s, %(status)s, %(auto_renew)s, CURRENT_TIMESTAMP
                )
                RETURNING *;
                """
                with get_db_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute(insert_query, sub_data)
                        row = cur.fetchone()
                        if row:
                            sub_data = dict(row)
            except Exception:
                pass

        self._sync_profile_subscriptions(user_id)
        return UserSubscriptionResponse(**sub_data)

    def update_subscription(self, user_id: str, sub_id: str, updates: UserSubscriptionUpdate) -> Optional[UserSubscriptionResponse]:
        """Update an existing subscription and recalibrate profile."""
        existing = _SHARED_SUBSCRIPTIONS.get(sub_id)
        if not existing and settings.is_db_configured():
            try:
                with get_db_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute("SELECT * FROM user_subscriptions WHERE id = %(id)s AND user_id = %(user_id)s;", {"id": sub_id, "user_id": user_id})
                        row = cur.fetchone()
                        if row:
                            existing = dict(row)
            except Exception:
                pass

        if not existing:
            return None

        current = dict(existing)
        for field, val in updates.model_dump(exclude_unset=True).items():
            if val is not None:
                current[field] = val

        monthly_equiv, annual_cost = self._calculate_subscription_details(
            amount=current["amount"],
            billing_frequency=current.get("billing_frequency", "monthly"),
        )
        current["monthly_equivalent"] = monthly_equiv
        current["annual_cost"] = annual_cost

        _SHARED_SUBSCRIPTIONS[sub_id] = current

        if settings.is_db_configured():
            try:
                update_query = """
                UPDATE user_subscriptions SET
                    name = %(name)s,
                    category = %(category)s,
                    billing_frequency = %(billing_frequency)s,
                    amount = %(amount)s,
                    monthly_equivalent = %(monthly_equivalent)s,
                    annual_cost = %(annual_cost)s,
                    renewal_date = %(renewal_date)s,
                    status = %(status)s,
                    auto_renew = %(auto_renew)s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %(id)s AND user_id = %(user_id)s
                RETURNING *;
                """
                with get_db_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute(update_query, current)
                        row = cur.fetchone()
                        if row:
                            current = dict(row)
            except Exception:
                pass

        self._sync_profile_subscriptions(user_id)
        return UserSubscriptionResponse(**current)

    def delete_subscription(self, user_id: str, sub_id: str) -> bool:
        """Delete / cancel a subscription and recalibrate profile."""
        deleted = False
        if sub_id in _SHARED_SUBSCRIPTIONS:
            del _SHARED_SUBSCRIPTIONS[sub_id]
            deleted = True

        if settings.is_db_configured():
            try:
                with get_db_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute("DELETE FROM user_subscriptions WHERE id = %(id)s AND user_id = %(user_id)s RETURNING id;", {"id": sub_id, "user_id": user_id})
                        if cur.fetchone():
                            deleted = True
            except Exception:
                pass

        self._sync_profile_subscriptions(user_id)
        return deleted

    def _sync_profile_subscriptions(self, user_id: str) -> None:
        """Recalculates profile other_recurring_expenses from user active subscriptions."""
        subs = self.get_subscriptions(user_id)
        active_subs = [s for s in subs if s.status.lower() != "cancelled"]
        total_monthly_recurring = round(sum(s.monthly_equivalent for s in active_subs), 2)
        self.upsert_profile(user_id, FinancialProfileUpdate(
            other_recurring_expenses=total_monthly_recurring,
        ))

    def _calculate_investment_annual(self, monthly_amount: float) -> float:
        """Calculate annual invested capital from monthly amount."""
        return round(float(monthly_amount) * 12, 2)

    def get_investments(self, user_id: str) -> List[UserInvestmentResponse]:
        """Fetch all active and tracked investments / SIPs for a user."""
        if not settings.is_db_configured():
            user_invs = [
                UserInvestmentResponse(**item)
                for item in _SHARED_INVESTMENTS.values()
                if item.get("user_id") == user_id
            ]
            return sorted(user_invs, key=lambda x: x.monthly_amount, reverse=True)

        try:
            query = """
            SELECT id, user_id, name, category, asset_class, monthly_amount,
                   expected_return_pct, sip_date, status, created_at, updated_at
            FROM user_investments
            WHERE user_id = %(user_id)s
            ORDER BY monthly_amount DESC;
            """
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(query, {"user_id": user_id})
                    rows = cur.fetchall()
                    result = []
                    for row in rows:
                        d = dict(row)
                        d["annual_contribution"] = round(float(d["monthly_amount"]) * 12, 2)
                        result.append(UserInvestmentResponse(**d))
                    return result
        except Exception:
            user_invs = [
                UserInvestmentResponse(**item)
                for item in _SHARED_INVESTMENTS.values()
                if item.get("user_id") == user_id
            ]
            return sorted(user_invs, key=lambda x: x.monthly_amount, reverse=True)

    def create_investment(self, user_id: str, inv_in: UserInvestmentCreate) -> UserInvestmentResponse:
        """Create a new monthly investment/SIP and auto-recalibrate user profile."""
        inv_id = f"inv_{uuid.uuid4().hex[:8]}"
        monthly_amt = float(inv_in.monthly_amount)
        annual_contrib = round(monthly_amt * 12, 2)

        inv_data = {
            "id": inv_id,
            "user_id": user_id,
            "name": inv_in.name,
            "category": inv_in.category or "Mutual Fund SIP",
            "asset_class": inv_in.asset_class or "Equity",
            "monthly_amount": monthly_amt,
            "annual_contribution": annual_contrib,
            "expected_return_pct": float(inv_in.expected_return_pct),
            "sip_date": inv_in.sip_date,
            "status": inv_in.status or "active",
        }

        _SHARED_INVESTMENTS[inv_id] = inv_data

        if settings.is_db_configured():
            try:
                insert_query = """
                INSERT INTO user_investments (
                    id, user_id, name, category, asset_class, monthly_amount,
                    expected_return_pct, sip_date, status, updated_at
                ) VALUES (
                    %(id)s, %(user_id)s, %(name)s, %(category)s, %(asset_class)s, %(monthly_amount)s,
                    %(expected_return_pct)s, %(sip_date)s, %(status)s, CURRENT_TIMESTAMP
                )
                RETURNING *;
                """
                with get_db_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute(insert_query, {
                            "id": inv_id,
                            "user_id": user_id,
                            "name": inv_data["name"],
                            "category": inv_data["category"],
                            "asset_class": inv_data["asset_class"],
                            "monthly_amount": inv_data["monthly_amount"],
                            "expected_return_pct": inv_data["expected_return_pct"],
                            "sip_date": inv_data["sip_date"],
                            "status": inv_data["status"],
                        })
                        row = cur.fetchone()
                        if row:
                            row_d = dict(row)
                            row_d["annual_contribution"] = annual_contrib
                            inv_data = row_d
            except Exception:
                pass

        self._sync_profile_investments(user_id)
        return UserInvestmentResponse(**inv_data)

    def update_investment(self, user_id: str, inv_id: str, updates: UserInvestmentUpdate) -> Optional[UserInvestmentResponse]:
        """Update an existing investment and recalibrate profile."""
        existing = _SHARED_INVESTMENTS.get(inv_id)
        if not existing and settings.is_db_configured():
            try:
                with get_db_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute("SELECT * FROM user_investments WHERE id = %(id)s AND user_id = %(user_id)s;", {"id": inv_id, "user_id": user_id})
                        row = cur.fetchone()
                        if row:
                            existing = dict(row)
            except Exception:
                pass

        if not existing:
            return None

        current = dict(existing)
        for field, val in updates.model_dump(exclude_unset=True).items():
            if val is not None:
                current[field] = val

        monthly_amt = float(current["monthly_amount"])
        annual_contrib = round(monthly_amt * 12, 2)
        current["monthly_amount"] = monthly_amt
        current["annual_contribution"] = annual_contrib

        _SHARED_INVESTMENTS[inv_id] = current

        if settings.is_db_configured():
            try:
                update_query = """
                UPDATE user_investments SET
                    name = %(name)s,
                    category = %(category)s,
                    asset_class = %(asset_class)s,
                    monthly_amount = %(monthly_amount)s,
                    expected_return_pct = %(expected_return_pct)s,
                    sip_date = %(sip_date)s,
                    status = %(status)s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %(id)s AND user_id = %(user_id)s
                RETURNING *;
                """
                with get_db_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute(update_query, {
                            "id": inv_id,
                            "user_id": user_id,
                            "name": current["name"],
                            "category": current["category"],
                            "asset_class": current["asset_class"],
                            "monthly_amount": current["monthly_amount"],
                            "expected_return_pct": current["expected_return_pct"],
                            "sip_date": current.get("sip_date"),
                            "status": current.get("status", "active"),
                        })
                        row = cur.fetchone()
                        if row:
                            row_d = dict(row)
                            row_d["annual_contribution"] = annual_contrib
                            current = row_d
            except Exception:
                pass

        self._sync_profile_investments(user_id)
        return UserInvestmentResponse(**current)

    def delete_investment(self, user_id: str, inv_id: str) -> bool:
        """Delete / stop tracking an investment and recalibrate profile."""
        deleted = False
        if inv_id in _SHARED_INVESTMENTS:
            del _SHARED_INVESTMENTS[inv_id]
            deleted = True

        if settings.is_db_configured():
            try:
                with get_db_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute("DELETE FROM user_investments WHERE id = %(id)s AND user_id = %(user_id)s RETURNING id;", {"id": inv_id, "user_id": user_id})
                        if cur.fetchone():
                            deleted = True
            except Exception:
                pass

        self._sync_profile_investments(user_id)
        return deleted

    def _sync_profile_investments(self, user_id: str) -> None:
        """Recalculates profile monthly_investments from user active investments / SIPs."""
        invs = self.get_investments(user_id)
        active_invs = [i for i in invs if i.status.lower() != "paused"]
        total_monthly_investments = round(sum(i.monthly_amount for i in active_invs), 2)
        self.upsert_profile(user_id, FinancialProfileUpdate(
            monthly_investments=total_monthly_investments,
        ))


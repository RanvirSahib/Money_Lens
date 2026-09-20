"""
Financial Profile Service.
Calculates deterministic financial indicators, metrics, and detects discrepancies with statement activity.
"""

from typing import Optional, Dict, Any, List
from app.repositories.postgres_profile_repo import PostgresProfileRepository
from app.repositories.postgres_statement_repo import PostgresStatementRepository
from app.schemas.profile import FinancialProfileResponse, FinancialProfileUpdate, DiscrepancyComparison


class ProfileService:
    def __init__(
        self,
        profile_repo: Optional[PostgresProfileRepository] = None,
        statement_repo: Optional[PostgresStatementRepository] = None,
    ):
        self.profile_repo = profile_repo or PostgresProfileRepository()
        self.statement_repo = statement_repo or PostgresStatementRepository()

    def get_profile(self, user_id: str) -> FinancialProfileResponse:
        return self.profile_repo.get_profile(user_id)

    def update_profile(self, user_id: str, updates: FinancialProfileUpdate) -> FinancialProfileResponse:
        return self.profile_repo.upsert_profile(user_id, updates)

    def check_discrepancies(self, user_id: str) -> List[DiscrepancyComparison]:
        """Compares user's reported financial profile with statement-derived aggregates."""
        profile = self.get_profile(user_id)
        latest_stmt = self.statement_repo.get_latest_statement(user_id)
        discrepancies = []

        if not latest_stmt or not profile:
            return discrepancies

        # Check total monthly expenses vs statement monthly debits
        stmt_debits = float(latest_stmt.get("total_debits", 0.0))
        prof_expenses = profile.total_monthly_expenses

        if stmt_debits > 0 and prof_expenses > 0:
            diff = stmt_debits - prof_expenses
            pct_diff = round((diff / prof_expenses) * 100, 1)

            if abs(diff) > 2000:  # Material difference threshold
                if diff > 0:
                    note = f"Statement activity (₹{stmt_debits:,.0f}) is ₹{diff:,.0f} ({pct_diff}%) higher than reported profile expenses (₹{prof_expenses:,.0f})."
                    rec = "Consider updating your profile's discretionary or recurring expense fields to match your real-world outflows."
                else:
                    note = f"Statement activity (₹{stmt_debits:,.0f}) is lower than reported profile expenses (₹{prof_expenses:,.0f})."
                    rec = "Ensure all external bank accounts, cash payments, or investments are accounted for."

                discrepancies.append(
                    DiscrepancyComparison(
                        metric="Monthly Expenses",
                        profile_value=prof_expenses,
                        statement_value=stmt_debits,
                        variance=diff,
                        variance_pct=pct_diff,
                        note=note,
                        recommendation=rec,
                    )
                )

        return discrepancies

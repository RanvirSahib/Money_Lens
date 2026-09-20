"""
Financial Profile Service.
Calculates deterministic financial indicators, metrics, and detects discrepancies with statement activity.
"""

from typing import Optional, Dict, Any, List
from app.repositories.postgres_profile_repo import PostgresProfileRepository
from app.repositories.postgres_statement_repo import PostgresStatementRepository
from app.schemas.profile import (
    FinancialProfileResponse,
    FinancialProfileUpdate,
    DiscrepancyComparison,
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

    def get_emis(self, user_id: str) -> List[UserEMIResponse]:
        return self.profile_repo.get_emis(user_id)

    def create_emi(self, user_id: str, emi_in: UserEMICreate) -> UserEMIResponse:
        return self.profile_repo.create_emi(user_id, emi_in)

    def update_emi(self, user_id: str, emi_id: str, updates: UserEMIUpdate) -> Optional[UserEMIResponse]:
        return self.profile_repo.update_emi(user_id, emi_id, updates)

    def delete_emi(self, user_id: str, emi_id: str) -> bool:
        return self.profile_repo.delete_emi(user_id, emi_id)

    def get_subscriptions(self, user_id: str) -> List[UserSubscriptionResponse]:
        return self.profile_repo.get_subscriptions(user_id)

    def create_subscription(self, user_id: str, sub_in: UserSubscriptionCreate) -> UserSubscriptionResponse:
        return self.profile_repo.create_subscription(user_id, sub_in)

    def update_subscription(self, user_id: str, sub_id: str, updates: UserSubscriptionUpdate) -> Optional[UserSubscriptionResponse]:
        return self.profile_repo.update_subscription(user_id, sub_id, updates)

    def delete_subscription(self, user_id: str, sub_id: str) -> bool:
        return self.profile_repo.delete_subscription(user_id, sub_id)

    def get_investments(self, user_id: str) -> List[UserInvestmentResponse]:
        return self.profile_repo.get_investments(user_id)

    def create_investment(self, user_id: str, inv_in: UserInvestmentCreate) -> UserInvestmentResponse:
        return self.profile_repo.create_investment(user_id, inv_in)

    def update_investment(self, user_id: str, inv_id: str, updates: UserInvestmentUpdate) -> Optional[UserInvestmentResponse]:
        return self.profile_repo.update_investment(user_id, inv_id, updates)

    def delete_investment(self, user_id: str, inv_id: str) -> bool:
        return self.profile_repo.delete_investment(user_id, inv_id)

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

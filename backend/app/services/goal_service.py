"""
Goal Service.
Handles forward goal calculation, reverse goal engineering,
and in-memory goal tracking.
"""

import uuid
from typing import List, Optional, Dict, Any
from datetime import date
from app.utils.calculations import (
    calculate_monthly_surplus,
    calculate_goal_feasibility,
    calculate_reverse_goal
)
from app.schemas.goals import (
    GoalCreateRequest,
    GoalResponse,
    GoalCalculationRequest,
    GoalCalculationResponse,
    ReverseGoalRequest,
    ReverseGoalResponse
)


class InMemoryGoalRepository:
    """In-memory store for user financial goals."""

    def __init__(self):
        self._storage: Dict[str, Dict[str, Any]] = {}
        self._seed_sample_goals()

    def _seed_sample_goals(self):
        sample_goals = [
            {
                "title": "Emergency Fund Corpus",
                "target_amount": 300000.0,
                "current_savings_allocated": 100000.0,
                "target_months": 12,
                "target_date": date(2027, 9, 1),
                "category": "Emergency",
                "priority": "high"
            },
            {
                "title": "International Vacation Fund",
                "target_amount": 150000.0,
                "current_savings_allocated": 20000.0,
                "target_months": 6,
                "target_date": date(2027, 3, 1),
                "category": "Travel",
                "priority": "medium"
            }
        ]
        for g in sample_goals:
            self.create(GoalCreateRequest(**g))

    def create(self, data: GoalCreateRequest, user_id: Optional[str] = None) -> GoalResponse:
        goal_id = f"goal_{uuid.uuid4().hex[:12]}"
        effective_user_id = user_id or data.user_id or "usr_demo_01"
        record = {
            "id": goal_id,
            "user_id": effective_user_id,
            **data.model_dump(exclude={"user_id"})
        }
        self._storage[goal_id] = record
        return GoalResponse(**record)

    def get_all(self, user_id: Optional[str] = None) -> List[GoalResponse]:
        if user_id:
            return [GoalResponse(**r) for r in self._storage.values() if r.get("user_id") == user_id]
        return [GoalResponse(**r) for r in self._storage.values()]

    def get_by_id(self, goal_id: str) -> Optional[GoalResponse]:
        record = self._storage.get(goal_id)
        if record:
            return GoalResponse(**record)
        return None

    def delete(self, goal_id: str, user_id: Optional[str] = None) -> bool:
        if goal_id in self._storage:
            if user_id and self._storage[goal_id].get("user_id") not in (user_id, None):
                return False
            del self._storage[goal_id]
            return True
        return False


from app.core.config import settings
from app.repositories.postgres_goal_repo import PostgresGoalRepository


class GoalRepositoryProxy:
    """
    Repository interface proxy for GoalRepository.
    Directs operations to PostgresGoalRepository when database configuration is present.
    Uses InMemoryGoalRepository when no database configuration is provided (local dev/testing).
    If database configuration is present but connection fails, PostgresGoalRepository surfaces the error directly.
    """

    def __init__(self):
        self._in_memory = InMemoryGoalRepository()
        self._postgres = PostgresGoalRepository()

    @property
    def active_repo(self):
        if settings.is_db_configured():
            return self._postgres
        return self._in_memory

    def create(self, data: GoalCreateRequest, user_id: Optional[str] = None) -> GoalResponse:
        return self.active_repo.create(data, user_id=user_id)

    def get_all(self, user_id: Optional[str] = None) -> List[GoalResponse]:
        return self.active_repo.get_all(user_id=user_id)

    def get_by_id(self, goal_id: str) -> Optional[GoalResponse]:
        return self.active_repo.get_by_id(goal_id)

    def delete(self, goal_id: str, user_id: Optional[str] = None) -> bool:
        return self.active_repo.delete(goal_id, user_id=user_id)


class GoalService:
    """Goal evaluation and calculation engine."""

    def __init__(self, repository=None):
        self.repository = repository if repository is not None else GoalRepositoryProxy()

    def get_saved_goals(self, user_id: Optional[str] = None) -> List[GoalResponse]:
        return self.repository.get_all(user_id=user_id)

    def save_goal(self, req: GoalCreateRequest, user_id: Optional[str] = None) -> GoalResponse:
        return self.repository.create(req, user_id=user_id)

    @staticmethod
    def calculate_forward_goal(req: GoalCalculationRequest) -> GoalCalculationResponse:
        months = req.target_months or 12
        if req.target_date and not req.target_months:
            # Approximate months from date
            today = date.today()
            months = max(1, (req.target_date.year - today.year) * 12 + (req.target_date.month - today.month))

        calc = calculate_goal_feasibility(
            target_amount=req.target_amount,
            current_savings_allocated=req.current_savings_allocated,
            target_months=months,
            monthly_income=req.monthly_income,
            monthly_expenses=req.monthly_expenses,
            existing_emi=req.existing_emi,
            expected_annual_return_pct=req.expected_annual_return_pct
        )

        return GoalCalculationResponse(**calc)

    @staticmethod
    def calculate_reverse_goal_engine(req: ReverseGoalRequest) -> ReverseGoalResponse:
        income = req.current_monthly_income if req.current_monthly_income is not None else 80000.0
        expenses = req.current_monthly_expenses if req.current_monthly_expenses is not None else 45000.0
        emi = req.existing_emi or 0.0
        
        if req.current_monthly_surplus is not None and req.current_monthly_surplus > 0:
            current_surplus = req.current_monthly_surplus
        else:
            current_surplus = calculate_monthly_surplus(income, expenses, emi)
        
        allocated = req.current_savings_allocated or 0.0

        calc = calculate_reverse_goal(
            target_amount=req.target_amount,
            target_months=req.target_months,
            current_monthly_surplus=current_surplus,
            expected_annual_return_pct=req.expected_annual_return_pct,
            current_savings_allocated=allocated
        )

        req_monthly = calc["levers"]["required_monthly_saving"]
        gap = calc["levers"]["additional_monthly_needed"]
        alt_months = calc["levers"]["alternative_timeline_at_current_surplus_months"]
        is_sufficient = calc["levers"]["is_currently_sufficient"]

        # Actionable levers: trade-off options for the user
        expense_cut_pct_needed = round((gap / expenses * 100), 2) if expenses > 0 and gap > 0 else 0.0
        income_boost_pct_needed = round((gap / income * 100), 2) if income > 0 and gap > 0 else 0.0

        actionable_levers = {
            "required_monthly_saving": req_monthly,
            "current_surplus": current_surplus,
            "additional_monthly_needed": gap,
            "suggested_expense_cut_amount": gap if gap > 0 else 0.0,
            "suggested_expense_reduction_pct": min(100.0, expense_cut_pct_needed),
            "suggested_income_increase_pct": round(income_boost_pct_needed, 2),
            "suggested_extended_timeline_months": alt_months
        }

        return ReverseGoalResponse(
            target_amount=calc["target_amount"],
            current_savings_allocated=allocated,
            remaining_target_amount=calc["remaining_target_amount"],
            target_months=calc["target_months"],
            required_monthly_saving=req_monthly,
            current_monthly_surplus=current_surplus,
            additional_monthly_needed=gap,
            is_currently_sufficient=is_sufficient,
            is_feasible=is_sufficient,
            alternative_timeline_at_current_surplus_months=alt_months,
            alternative_months_at_current_surplus=alt_months,
            actionable_levers=actionable_levers,
            assumptions=calc["assumptions"]
        )


goal_service = GoalService()

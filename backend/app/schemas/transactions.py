"""
Pydantic Schemas for Transaction Processing.
Supports income, expense, categories, recurring frequencies, and aggregations.
"""

from enum import Enum
from typing import Optional, List, Dict
from datetime import date
from pydantic import BaseModel, Field


class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"


class TransactionCategory(str, Enum):
    SALARY = "Salary"
    FREELANCE = "Freelance"
    INVESTMENTS = "Investments"
    RENT = "Rent"
    GROCERIES = "Groceries"
    UTILITIES = "Utilities"
    ENTERTAINMENT = "Entertainment"
    DINING = "Dining"
    SHOPPING = "Shopping"
    HEALTHCARE = "Healthcare"
    TRANSPORT = "Transport"
    EDUCATION = "Education"
    SUBSCRIPTIONS = "Subscriptions"
    EMI_LOAN = "EMI/Loan"
    MISCELLANEOUS = "Miscellaneous"


class RecurringFrequency(str, Enum):
    NONE = "none"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class TransactionBase(BaseModel):
    title: str = Field(..., examples=["Monthly Salary"], min_length=1)
    type: TransactionType = Field(..., examples=[TransactionType.INCOME])
    amount: float = Field(..., gt=0, examples=[80000.0])
    category: str = Field(default="Miscellaneous", examples=["Salary"])
    transaction_date: date = Field(default_factory=date.today, examples=["2026-09-01"])
    is_recurring: bool = Field(default=False, examples=[True])
    recurring_frequency: RecurringFrequency = Field(default=RecurringFrequency.NONE, examples=[RecurringFrequency.MONTHLY])
    description: Optional[str] = Field(default=None, examples=["Primary job salary deposit"])


class TransactionCreate(TransactionBase):
    pass


class TransactionResponse(TransactionBase):
    id: str = Field(..., examples=["txn_01j7abcde1234567"])

    model_config = {"from_attributes": True}


class CategorySpending(BaseModel):
    category: str
    total_amount: float
    percentage_of_total_expense: float
    transaction_count: int


class RecurringSummary(BaseModel):
    total_recurring_income: float
    total_recurring_expenses: float
    recurring_items_count: int


class TransactionSummaryResponse(BaseModel):
    total_income: float = Field(..., examples=[80000.0])
    total_expenses: float = Field(..., examples=[45000.0])
    net_savings: float = Field(..., examples=[35000.0])
    savings_rate_pct: float = Field(..., examples=[43.75])
    monthly_estimated_income: float = Field(..., examples=[80000.0])
    monthly_estimated_expenses: float = Field(..., examples=[45000.0])
    monthly_estimated_savings: float = Field(..., examples=[35000.0])
    category_wise_spending: List[CategorySpending]
    recurring_summary: RecurringSummary
    total_transactions: int

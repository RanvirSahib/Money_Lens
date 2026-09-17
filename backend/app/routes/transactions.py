"""
Transaction API Routes.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.transactions import (
    TransactionCreate,
    TransactionResponse,
    TransactionSummaryResponse,
    TransactionType
)
from app.services.transaction_service import transaction_repository

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post(
    "",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record a new transaction"
)
def create_transaction(payload: TransactionCreate):
    """
    Add a new income or expense transaction.
    Accepts category, amount, date, recurring settings, and notes.
    """
    return transaction_repository.create(payload)


@router.get(
    "",
    response_model=List[TransactionResponse],
    summary="List all recorded transactions"
)
def list_transactions(
    transaction_type: Optional[TransactionType] = Query(None, description="Filter by 'income' or 'expense'"),
    category: Optional[str] = Query(None, description="Filter by category name"),
    is_recurring: Optional[bool] = Query(None, description="Filter by recurring flag")
):
    """Retrieve all recorded transactions with optional filtering."""
    return transaction_repository.get_all(
        transaction_type=transaction_type,
        category=category,
        is_recurring=is_recurring
    )


@router.get(
    "/summary",
    response_model=TransactionSummaryResponse,
    summary="Get aggregated transaction summary"
)
def get_transaction_summary():
    """
    Calculate and return:
    - Total income
    - Total expenses
    - Net savings & savings rate (%)
    - Monthly estimated cash flows
    - Category-wise spending breakdown
    - Recurring commitments breakdown
    """
    return transaction_repository.get_summary()


@router.get(
    "/{txn_id}",
    response_model=TransactionResponse,
    summary="Get a transaction by ID"
)
def get_transaction(txn_id: str):
    record = transaction_repository.get_by_id(txn_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction with ID '{txn_id}' not found."
        )
    return record


@router.delete(
    "/{txn_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a transaction"
)
def delete_transaction(txn_id: str):
    success = transaction_repository.delete(txn_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction with ID '{txn_id}' not found."
        )
    return {"success": True, "message": f"Transaction {txn_id} successfully deleted."}

"""
Bank Statement API Routes.
Provides endpoints for statement uploads with privacy consent, processing summaries, and derived analytics.
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from typing import Optional, List
from app.schemas.statements import StatementAnalysisSummary, StatementTransactionItem
from app.services.statement_service import StatementService

router = APIRouter(prefix="/statements", tags=["Statements"])
statement_service = StatementService()


@router.post("/upload", response_model=StatementAnalysisSummary)
async def upload_statement(
    file: UploadFile = File(...),
    save_raw: bool = Form(default=False),
    user_id: Optional[str] = Form(default="usr_demo_01"),
):
    """
    Upload and process a bank statement (CSV or PDF).
    Adheres strictly to the user's `save_raw` privacy choice.
    """
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    summary, _ = statement_service.process_statement(
        user_id=user_id,
        filename=file.filename or "statement.csv",
        content_bytes=content,
        save_raw=save_raw,
    )
    return summary


@router.get("/history", response_model=List[dict])
def get_user_statements(user_id: Optional[str] = Query(default="usr_demo_01")):
    """Get list of previously processed statement summaries."""
    return statement_service.statement_repo.get_user_statements(user_id)


@router.get("/transactions", response_model=List[dict])
def get_statement_transactions(user_id: Optional[str] = Query(default="usr_demo_01")):
    """Get all categorized transactions extracted from statements."""
    return statement_service.statement_repo.get_user_transactions(user_id)

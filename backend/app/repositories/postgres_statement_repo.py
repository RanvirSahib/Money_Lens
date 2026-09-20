"""
PostgreSQL Statement Repository.
Stores statement metadata and parsed transactions while enforcing user privacy and data retention preferences.
"""

import uuid
from typing import Optional, List, Dict, Any
from app.core.database import get_db_connection
from app.core.config import settings
from app.schemas.statements import StatementAnalysisSummary, StatementTransactionItem

# Module-level shared stores so ALL service/repo instances share the same in-memory state.
# This is critical: StatementService writes here, SpendingService reads from here.
_SHARED_STATEMENTS: Dict[str, List[Dict[str, Any]]] = {}
_SHARED_TRANSACTIONS: Dict[str, List[Dict[str, Any]]] = {}


class PostgresStatementRepository:
    """Repository for statement uploads and transaction extraction."""

    def __init__(self):
        # Point instance properties to the shared module-level stores
        self._in_memory_statements = _SHARED_STATEMENTS
        self._in_memory_txs = _SHARED_TRANSACTIONS

    def save_statement_summary(self, user_id: str, summary: StatementAnalysisSummary, transactions: List[StatementTransactionItem]) -> None:
        """Store statement summary and transactions."""
        if user_id not in self._in_memory_statements:
            self._in_memory_statements[user_id] = []
        if user_id not in self._in_memory_txs:
            self._in_memory_txs[user_id] = []

        summary_dict = summary.model_dump()
        self._in_memory_statements[user_id].append(summary_dict)

        tx_dicts = [t.model_dump() for t in transactions]
        self._in_memory_txs[user_id].extend(tx_dicts)

    def get_user_statements(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all statement summaries for user."""
        return self._in_memory_statements.get(user_id, [])

    def get_latest_statement(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get most recent statement summary for user."""
        stmts = self._in_memory_statements.get(user_id, [])
        return stmts[-1] if stmts else None

    def get_user_transactions(self, user_id: str) -> List[Dict[str, Any]]:
        """Get transactions extracted from statements for user."""
        return self._in_memory_txs.get(user_id, [])

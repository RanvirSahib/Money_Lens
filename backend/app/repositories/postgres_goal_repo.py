"""
PostgreSQL Goal Repository.
Provides CRUD operations for financial goals using PostgreSQL / AWS RDS and psycopg (v3).
Maintains exact interface parity with InMemoryGoalRepository without auto-seeding data.
"""

import uuid
from typing import List, Optional
from app.core.database import get_db_connection
from app.schemas.goals import GoalCreateRequest, GoalResponse


class PostgresGoalRepository:
    """PostgreSQL / RDS implementation of the Goal Repository."""

    def create(self, data: GoalCreateRequest) -> GoalResponse:
        goal_id = f"goal_{uuid.uuid4().hex[:12]}"
        query = """
        INSERT INTO goals (
            id, title, target_amount, current_savings_allocated,
            target_months, target_date, category, priority
        ) VALUES (
            %(id)s, %(title)s, %(target_amount)s, %(current_savings_allocated)s,
            %(target_months)s, %(target_date)s, %(category)s, %(priority)s
        )
        RETURNING id, title, target_amount, current_savings_allocated, target_months, target_date, category, priority;
        """
        params = {
            "id": goal_id,
            "title": data.title,
            "target_amount": float(data.target_amount),
            "current_savings_allocated": float(data.current_savings_allocated),
            "target_months": data.target_months,
            "target_date": data.target_date,
            "category": data.category,
            "priority": data.priority,
        }
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, params)
                row = cur.fetchone()
                return GoalResponse(**row)

    def get_all(self) -> List[GoalResponse]:
        query = """
        SELECT id, title, target_amount, current_savings_allocated, target_months, target_date, category, priority
        FROM goals
        ORDER BY created_at DESC;
        """
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query)
                rows = cur.fetchall()
                return [GoalResponse(**r) for r in rows]

    def get_by_id(self, goal_id: str) -> Optional[GoalResponse]:
        query = """
        SELECT id, title, target_amount, current_savings_allocated, target_months, target_date, category, priority
        FROM goals
        WHERE id = %(id)s;
        """
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, {"id": goal_id})
                row = cur.fetchone()
                if row:
                    return GoalResponse(**row)
                return None

    def delete(self, goal_id: str) -> bool:
        query = "DELETE FROM goals WHERE id = %(id)s RETURNING id;"
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, {"id": goal_id})
                deleted = cur.fetchone()
                return deleted is not None

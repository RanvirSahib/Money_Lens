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

    def create(self, data: GoalCreateRequest, user_id: Optional[str] = None) -> GoalResponse:
        goal_id = f"goal_{uuid.uuid4().hex[:12]}"
        effective_user_id = user_id or data.user_id or "usr_demo_01"
        query = """
        INSERT INTO goals (
            id, user_id, title, target_amount, current_savings_allocated,
            target_months, target_date, category, priority
        ) VALUES (
            %(id)s, %(user_id)s, %(title)s, %(target_amount)s, %(current_savings_allocated)s,
            %(target_months)s, %(target_date)s, %(category)s, %(priority)s
        )
        RETURNING id, user_id, title, target_amount, current_savings_allocated, target_months, target_date, category, priority;
        """
        params = {
            "id": goal_id,
            "user_id": effective_user_id,
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

    def get_all(self, user_id: Optional[str] = None) -> List[GoalResponse]:
        if user_id:
            query = """
            SELECT id, user_id, title, target_amount, current_savings_allocated, target_months, target_date, category, priority
            FROM goals
            WHERE user_id = %(user_id)s
            ORDER BY created_at DESC;
            """
            params = {"user_id": user_id}
        else:
            query = """
            SELECT id, user_id, title, target_amount, current_savings_allocated, target_months, target_date, category, priority
            FROM goals
            ORDER BY created_at DESC;
            """
            params = {}
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, params)
                rows = cur.fetchall()
                return [GoalResponse(**r) for r in rows]

    def get_by_id(self, goal_id: str) -> Optional[GoalResponse]:
        query = """
        SELECT id, user_id, title, target_amount, current_savings_allocated, target_months, target_date, category, priority
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

    def delete(self, goal_id: str, user_id: Optional[str] = None) -> bool:
        if user_id:
            query = "DELETE FROM goals WHERE id = %(id)s AND (user_id = %(user_id)s OR user_id IS NULL) RETURNING id;"
            params = {"id": goal_id, "user_id": user_id}
        else:
            query = "DELETE FROM goals WHERE id = %(id)s RETURNING id;"
            params = {"id": goal_id}
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, params)
                deleted = cur.fetchone()
                return deleted is not None


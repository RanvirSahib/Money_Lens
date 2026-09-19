"""
PostgreSQL User Repository.
Provides CRUD and authentication operations for MoneyLens user accounts using AWS RDS / PostgreSQL.
"""

import uuid
import hashlib
from typing import Optional
from app.core.database import get_db_connection
from app.schemas.auth import UserRegisterRequest, UserResponse, UserProfileUpdateRequest


def hash_password(password: str) -> str:
    """Hash password using SHA-256 with salt."""
    salt = "moneylens_secure_salt_v1"
    return hashlib.sha256((password + salt).encode("utf-8")).hexdigest()


class PostgresUserRepository:
    """PostgreSQL / RDS implementation of User Repository."""

    def calculate_health_score(self, income: float, expenses: float, savings: float) -> int:
        surplus = income - expenses
        runway = savings / expenses if expenses > 0 else 3.0
        score = int(50 + (runway * 8) + (15 if surplus > 0 else -15))
        return min(98, max(50, score))

    def create(self, data: UserRegisterRequest) -> UserResponse:
        user_id = f"usr_{uuid.uuid4().hex[:12]}"
        pwd_hash = hash_password(data.password)
        inc = float(data.monthly_income or 85000.0)
        exp = float(data.monthly_expenses or 35000.0)
        sav = float(data.current_savings or 150000.0)
        score = self.calculate_health_score(inc, exp, sav)
        uname = (data.username or data.email.split("@")[0]).strip().lower()

        query = """
        INSERT INTO users (
            id, email, username, name, password_hash,
            monthly_income, monthly_expenses, current_savings, health_score
        ) VALUES (
            %(id)s, %(email)s, %(username)s, %(name)s, %(password_hash)s,
            %(monthly_income)s, %(monthly_expenses)s, %(current_savings)s, %(health_score)s
        )
        RETURNING id, email, username, name, monthly_income, monthly_expenses, current_savings, health_score, created_at;
        """
        params = {
            "id": user_id,
            "email": data.email.lower().strip(),
            "username": uname,
            "name": data.name.strip(),
            "password_hash": pwd_hash,
            "monthly_income": inc,
            "monthly_expenses": exp,
            "current_savings": sav,
            "health_score": score,
        }
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, params)
                row = cur.fetchone()
                return UserResponse(**row)

    def get_by_email(self, email: str) -> Optional[dict]:
        query = """
        SELECT id, email, username, name, password_hash, monthly_income, monthly_expenses, current_savings, health_score, created_at
        FROM users
        WHERE LOWER(email) = LOWER(%(email)s);
        """
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, {"email": email.strip()})
                return cur.fetchone()

    def get_by_username(self, username: str) -> Optional[dict]:
        query = """
        SELECT id, email, username, name, password_hash, monthly_income, monthly_expenses, current_savings, health_score, created_at
        FROM users
        WHERE LOWER(username) = LOWER(%(username)s);
        """
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, {"username": username.strip()})
                return cur.fetchone()

    def get_by_identifier(self, identifier: str) -> Optional[dict]:
        """Looks up a user by either email or username."""
        clean = identifier.strip().lower()
        query = """
        SELECT id, email, username, name, password_hash, monthly_income, monthly_expenses, current_savings, health_score, created_at
        FROM users
        WHERE LOWER(email) = %(val)s OR LOWER(username) = %(val)s;
        """
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, {"val": clean})
                return cur.fetchone()

    def get_by_id(self, user_id: str) -> Optional[UserResponse]:
        query = """
        SELECT id, email, username, name, monthly_income, monthly_expenses, current_savings, health_score, created_at
        FROM users
        WHERE id = %(id)s;
        """
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, {"id": user_id})
                row = cur.fetchone()
                if row:
                    return UserResponse(**row)
                return None

    def update_profile(self, user_id: str, data: UserProfileUpdateRequest) -> Optional[UserResponse]:
        current = self.get_by_id(user_id)
        if not current:
            return None

        inc = float(data.monthly_income if data.monthly_income is not None else current.monthly_income)
        exp = float(data.monthly_expenses if data.monthly_expenses is not None else current.monthly_expenses)
        sav = float(data.current_savings if data.current_savings is not None else current.current_savings)
        name = data.name if data.name is not None else current.name
        score = self.calculate_health_score(inc, exp, sav)

        query = """
        UPDATE users
        SET name = %(name)s,
            monthly_income = %(monthly_income)s,
            monthly_expenses = %(monthly_expenses)s,
            current_savings = %(current_savings)s,
            health_score = %(health_score)s,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = %(id)s
        RETURNING id, email, username, name, monthly_income, monthly_expenses, current_savings, health_score, created_at;
        """
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, {
                    "id": user_id,
                    "name": name,
                    "monthly_income": inc,
                    "monthly_expenses": exp,
                    "current_savings": sav,
                    "health_score": score,
                })
                row = cur.fetchone()
                if row:
                    return UserResponse(**row)
                return None


user_repo = PostgresUserRepository()

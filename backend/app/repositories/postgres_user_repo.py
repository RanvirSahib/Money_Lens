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
        inc = float(data.monthly_income if data.monthly_income is not None else 0.0)
        
        # Calculate essential and discretionary expenses
        if data.essential_expenses is not None or data.discretionary_expenses is not None:
            essential = float(data.essential_expenses if data.essential_expenses is not None else 0.0)
            discretionary = float(data.discretionary_expenses if data.discretionary_expenses is not None else 0.0)
            exp = round(essential + discretionary, 2)
        elif data.monthly_expenses is not None:
            exp = float(data.monthly_expenses)
            essential = round(exp * 0.6, 2)
            discretionary = round(exp * 0.4, 2)
        else:
            exp = 0.0
            essential = 0.0
            discretionary = 0.0

        sav = float(data.current_savings if data.current_savings is not None else 0.0)
        score = self.calculate_health_score(inc, exp, sav)
        uname = (data.username or data.email.split("@")[0]).strip().lower()
        mobile = data.mobile.strip() if data.mobile else None

        query = """
        INSERT INTO users (
            id, email, username, name, mobile, password_hash,
            monthly_income, monthly_expenses, current_savings, health_score
        ) VALUES (
            %(id)s, %(email)s, %(username)s, %(name)s, %(mobile)s, %(password_hash)s,
            %(monthly_income)s, %(monthly_expenses)s, %(current_savings)s, %(health_score)s
        )
        RETURNING id, email, username, name, mobile, monthly_income, monthly_expenses, current_savings, health_score, created_at;
        """
        params = {
            "id": user_id,
            "email": data.email.lower().strip(),
            "username": uname,
            "name": data.name.strip(),
            "mobile": mobile,
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
                user_res = UserResponse(**row)

                # Initialize user_profiles table for this user
                prof_query = """
                INSERT INTO user_profiles (
                    id, user_id, name, monthly_income, essential_expenses, discretionary_expenses,
                    current_savings, monthly_investments, active_emis, active_loans, other_recurring_expenses, updated_at
                ) VALUES (
                    %(prof_id)s, %(user_id)s, %(name)s, %(monthly_income)s, %(essential_expenses)s, %(discretionary_expenses)s,
                    %(current_savings)s, 0.0, 0.0, 0.0, 0.0, CURRENT_TIMESTAMP
                )
                ON CONFLICT (user_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    monthly_income = EXCLUDED.monthly_income,
                    essential_expenses = EXCLUDED.essential_expenses,
                    discretionary_expenses = EXCLUDED.discretionary_expenses,
                    current_savings = EXCLUDED.current_savings;
                """
                cur.execute(prof_query, {
                    "prof_id": f"prof_{user_id}",
                    "user_id": user_id,
                    "name": data.name.strip(),
                    "monthly_income": inc,
                    "essential_expenses": essential,
                    "discretionary_expenses": discretionary,
                    "current_savings": sav,
                })
                return user_res


    def get_by_email(self, email: str) -> Optional[dict]:
        query = """
        SELECT id, email, username, name, mobile, password_hash, monthly_income, monthly_expenses, current_savings, health_score, created_at
        FROM users
        WHERE LOWER(email) = LOWER(%(email)s);
        """
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, {"email": email.strip()})
                return cur.fetchone()

    def get_by_username(self, username: str) -> Optional[dict]:
        query = """
        SELECT id, email, username, name, mobile, password_hash, monthly_income, monthly_expenses, current_savings, health_score, created_at
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
        SELECT id, email, username, name, mobile, password_hash, monthly_income, monthly_expenses, current_savings, health_score, created_at
        FROM users
        WHERE LOWER(email) = %(val)s OR LOWER(username) = %(val)s;
        """
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, {"val": clean})
                return cur.fetchone()

    def get_by_id(self, user_id: str) -> Optional[UserResponse]:
        query = """
        SELECT id, email, username, name, mobile, monthly_income, monthly_expenses, current_savings, health_score, created_at
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

    def get_by_id_with_hash(self, user_id: str) -> Optional[dict]:
        query = """
        SELECT id, email, username, name, mobile, password_hash, monthly_income, monthly_expenses, current_savings, health_score, created_at
        FROM users
        WHERE id = %(id)s;
        """
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, {"id": user_id})
                return cur.fetchone()

    def update_password(self, email: str, new_password: str) -> Optional[UserResponse]:
        pwd_hash = hash_password(new_password)
        query = """
        UPDATE users
        SET password_hash = %(password_hash)s,
            updated_at = CURRENT_TIMESTAMP
        WHERE LOWER(email) = LOWER(%(email)s)
        RETURNING id, email, username, name, mobile, monthly_income, monthly_expenses, current_savings, health_score, created_at;
        """
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, {
                    "email": email.strip(),
                    "password_hash": pwd_hash,
                })
                row = cur.fetchone()
                if row:
                    return UserResponse(**row)
                return None

    def update_profile(self, user_id: str, data: UserProfileUpdateRequest) -> Optional[UserResponse]:
        current = self.get_by_id(user_id)
        if not current:
            return None

        # 1. Username uniqueness check
        uname = current.username
        if data.username and data.username.lower() != (current.username or "").lower():
            existing = self.get_by_username(data.username)
            if existing and existing["id"] != user_id:
                raise HTTPException(
                    status_code=400,
                    detail=f"Username '@{data.username}' is already taken by another account."
                )
            uname = data.username.lower().strip()

        # 2. Password change check
        pwd_hash = None
        if data.new_password:
            user_rec = self.get_by_id_with_hash(user_id)
            if user_rec and data.current_password:
                if hash_password(data.current_password) != user_rec.get("password_hash"):
                    raise HTTPException(
                        status_code=400,
                        detail="Current password entered is incorrect."
                    )
            pwd_hash = hash_password(data.new_password)

        inc = float(data.monthly_income if data.monthly_income is not None else current.monthly_income)
        essential = float(data.essential_expenses if data.essential_expenses is not None else 0.0)
        discretionary = float(data.discretionary_expenses if data.discretionary_expenses is not None else 0.0)
        calc_expenses = essential + discretionary
        exp = float(data.monthly_expenses if data.monthly_expenses is not None else (calc_expenses if calc_expenses > 0 else current.monthly_expenses))
        sav = float(data.current_savings if data.current_savings is not None else current.current_savings)
        name = data.name.strip() if data.name is not None else current.name
        mobile = data.mobile.strip() if data.mobile is not None else current.mobile
        score = self.calculate_health_score(inc, exp, sav)

        query = """
        UPDATE users
        SET name = %(name)s,
            username = %(username)s,
            mobile = %(mobile)s,
            monthly_income = %(monthly_income)s,
            monthly_expenses = %(monthly_expenses)s,
            current_savings = %(current_savings)s,
            health_score = %(health_score)s,
            password_hash = COALESCE(%(password_hash)s, password_hash),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = %(id)s
        RETURNING id, email, username, name, mobile, monthly_income, monthly_expenses, current_savings, health_score, created_at;
        """
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, {
                    "id": user_id,
                    "name": name,
                    "username": uname,
                    "mobile": mobile,
                    "monthly_income": inc,
                    "monthly_expenses": exp,
                    "current_savings": sav,
                    "health_score": score,
                    "password_hash": pwd_hash,
                })
                row = cur.fetchone()

                # Sync user_profiles table
                cur.execute("""
                UPDATE user_profiles
                SET name = %(name)s,
                    monthly_income = %(monthly_income)s,
                    essential_expenses = CASE WHEN %(essential_expenses)s > 0 THEN %(essential_expenses)s ELSE essential_expenses END,
                    discretionary_expenses = CASE WHEN %(discretionary_expenses)s > 0 THEN %(discretionary_expenses)s ELSE discretionary_expenses END,
                    current_savings = %(current_savings)s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = %(user_id)s;
                """, {
                    "user_id": user_id,
                    "name": name,
                    "monthly_income": inc,
                    "essential_expenses": essential,
                    "discretionary_expenses": discretionary,
                    "current_savings": sav,
                })

                if row:
                    return UserResponse(**row)
                return None


user_repo = PostgresUserRepository()


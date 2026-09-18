"""
PostgreSQL / AWS RDS Database Connectivity Module.
Provides connection lifecycle management and DDL table initializations using psycopg (v3).
"""

import logging
from contextlib import contextmanager
from typing import Generator, Dict, Any, Optional

import psycopg
from psycopg.rows import dict_row

from app.core.config import settings

logger = logging.getLogger(__name__)


class DatabaseConnectionError(Exception):
    """Raised when connecting or querying PostgreSQL / RDS fails."""
    pass


class DatabaseNotConfiguredError(Exception):
    """Raised when a database operation is requested but no DB configuration is provided."""
    pass


@contextmanager
def get_db_connection() -> Generator[psycopg.Connection, None, None]:
    """
    Context manager yielding an active psycopg connection with dictionary row factory.
    Commits on successful block completion, rolls back on exception, and closes connection.
    Raises DatabaseConnectionError if connection to RDS/PostgreSQL fails.
    """
    if not settings.is_db_configured():
        raise DatabaseNotConfiguredError("No PostgreSQL / RDS connection configuration found in environment.")

    dsn = settings.get_database_dsn()
    try:
        conn = psycopg.connect(dsn, row_factory=dict_row)
    except psycopg.Error as e:
        logger.error("Failed to connect to PostgreSQL/RDS database: %s", str(e))
        raise DatabaseConnectionError(f"PostgreSQL/RDS database connection error: {str(e)}") from e

    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        logger.error("Database transaction rolled back due to error: %s", str(e))
        raise
    finally:
        conn.close()


def init_db() -> None:
    """
    Initializes PostgreSQL / RDS schema tables and indexes if they do not exist.
    Tables start empty with zero auto-seeded records.
    """
    if not settings.is_db_configured():
        logger.info("Database configuration not provided; skipping PostgreSQL table initialization.")
        return

    ddl = """
    CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(32) NOT NULL,
        amount NUMERIC(14, 2) NOT NULL,
        category VARCHAR(128) NOT NULL,
        transaction_date DATE NOT NULL,
        is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
        recurring_frequency VARCHAR(32) NOT NULL DEFAULT 'none',
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);

    CREATE TABLE IF NOT EXISTS goals (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        target_amount NUMERIC(14, 2) NOT NULL,
        current_savings_allocated NUMERIC(14, 2) NOT NULL DEFAULT 0.0,
        target_months INTEGER,
        target_date DATE,
        category VARCHAR(128),
        priority VARCHAR(32),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """
    logger.info("Initializing PostgreSQL schema tables on RDS/PostgreSQL...")
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(ddl)
    logger.info("PostgreSQL schema tables verified and ready.")


def check_db_health() -> Dict[str, Any]:
    """Checks database connectivity status and returns diagnostic health info."""
    if not settings.is_db_configured():
        return {
            "mode": "in-memory",
            "connected": False,
            "details": "No database credentials configured; using in-memory store"
        }

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1 as ping;")
                res = cur.fetchone()
                if res and res.get("ping") == 1:
                    return {
                        "mode": "postgresql-rds",
                        "connected": True,
                        "details": "Successfully connected to PostgreSQL/RDS database"
                    }
        return {
            "mode": "postgresql-rds",
            "connected": False,
            "details": "Unexpected ping response from database"
        }
    except Exception as e:
        return {
            "mode": "postgresql-rds",
            "connected": False,
            "error": str(e)
        }

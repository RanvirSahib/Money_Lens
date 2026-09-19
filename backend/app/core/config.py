"""
MoneyLens Core Configuration.
Contains application metadata, API prefix settings, and financial engine defaults.
"""

import os
from typing import List, Optional
from dotenv import load_dotenv
from pydantic import BaseModel, Field

# Load environment variables from .env file if present
load_dotenv()



class Settings(BaseModel):
    PROJECT_NAME: str = "MoneyLens - AI-Powered Financial Future Simulator Backend"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    
    # Financial Engine Defaults & Rule-based Thresholds
    DEFAULT_EMERGENCY_FUND_MONTHS: int = 3
    CRITICAL_EMERGENCY_FUND_MONTHS: int = 1
    HIGH_EXPENSE_DEVIATION_MULTIPLIER: float = 1.5  # 1.5x average monthly expense
    HIGH_EXPENSE_INCOME_RATIO: float = 0.35         # Single expense > 35% monthly income
    HEALTHY_SAVINGS_RATE_PCT: float = 20.0          # Recommended >= 20%
    HIGH_DEBT_TO_INCOME_PCT: float = 40.0           # Total EMI > 40% monthly income
    
    # AI Service Configuration (Groq-powered MoneyLens AI microservice)
    AI_SERVICE_URL: str = Field(default_factory=lambda: os.getenv("AI_SERVICE_URL", "http://localhost:8001"))

    # AWS & Amazon Bedrock Configuration
    AWS_REGION: str = Field(default_factory=lambda: os.getenv("AWS_REGION", "us-east-1"))
    BEDROCK_MODEL_ID: str = Field(default_factory=lambda: os.getenv("BEDROCK_MODEL_ID", "amazon.nova-micro-v1:0"))
    AWS_ACCESS_KEY_ID: Optional[str] = Field(default_factory=lambda: os.getenv("AWS_ACCESS_KEY_ID", None))
    AWS_SECRET_ACCESS_KEY: Optional[str] = Field(default_factory=lambda: os.getenv("AWS_SECRET_ACCESS_KEY", None))
    AWS_SESSION_TOKEN: Optional[str] = Field(default_factory=lambda: os.getenv("AWS_SESSION_TOKEN", None))

    # Independent MoneyLens AI Insight Service Configuration
    AI_SERVICE_URL: str = Field(default_factory=lambda: os.getenv("AI_SERVICE_URL", "http://localhost:8001"))

    # PostgreSQL / AWS RDS Configuration
    DATABASE_URL: Optional[str] = Field(default_factory=lambda: os.getenv("DATABASE_URL", None))
    DB_HOST: Optional[str] = Field(default_factory=lambda: os.getenv("DB_HOST", os.getenv("RDS_HOSTNAME", None)))
    DB_PORT: int = Field(default_factory=lambda: int(os.getenv("DB_PORT", os.getenv("RDS_PORT", "5432"))))
    DB_NAME: str = Field(default_factory=lambda: os.getenv("DB_NAME", os.getenv("RDS_DB_NAME", "moneylens")))
    DB_USER: Optional[str] = Field(default_factory=lambda: os.getenv("DB_USER", os.getenv("RDS_USERNAME", None)))
    DB_PASSWORD: Optional[str] = Field(default_factory=lambda: os.getenv("DB_PASSWORD", os.getenv("RDS_PASSWORD", None)))
    DB_SSLMODE: str = Field(default_factory=lambda: os.getenv("DB_SSLMODE", os.getenv("RDS_SSLMODE", "require")))

    def is_db_configured(self) -> bool:
        """Returns True if database connection information is provided in the environment."""
        if self.DATABASE_URL and self.DATABASE_URL.strip():
            return True
        if self.DB_HOST and self.DB_HOST.strip():
            return True
        return False

    def get_database_dsn(self) -> Optional[str]:
        """Constructs a PostgreSQL DSN string for psycopg."""
        if self.DATABASE_URL and self.DATABASE_URL.strip():
            dsn = self.DATABASE_URL.strip()
            if "sslmode=" not in dsn and self.DB_SSLMODE:
                separator = "&" if "?" in dsn else "?"
                dsn = f"{dsn}{separator}sslmode={self.DB_SSLMODE}"
            return dsn

        if self.DB_HOST and self.DB_HOST.strip():
            user = self.DB_USER or "postgres"
            password = f":{self.DB_PASSWORD}" if self.DB_PASSWORD else ""
            host = self.DB_HOST
            port = self.DB_PORT
            dbname = self.DB_NAME
            sslmode = self.DB_SSLMODE
            return f"postgresql://{user}{password}@{host}:{port}/{dbname}?sslmode={sslmode}"

        return None

    # CORS settings - allow frontend connections
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
        "*"
    ]


settings = Settings()



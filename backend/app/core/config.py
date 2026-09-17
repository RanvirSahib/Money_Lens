"""
MoneyLens Core Configuration.
Contains application metadata, API prefix settings, and financial engine defaults.
"""

from typing import List
from pydantic import BaseModel


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

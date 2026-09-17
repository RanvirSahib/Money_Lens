"""
MoneyLens Common Schemas and Enums.
"""

from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class SeverityLevel(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class HealthStatus(str, Enum):
    EXCELLENT = "excellent"
    HEALTHY = "healthy"
    VULNERABLE = "vulnerable"
    AT_RISK = "at_risk"


class StandardResponse(BaseModel):
    success: bool = True
    message: str = "Operation successful"
    data: Optional[Any] = None

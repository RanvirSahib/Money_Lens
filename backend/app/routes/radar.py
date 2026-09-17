"""
Financial Radar API Routes.
Provides rule-based anomaly detection, health scoring, and cash-flow warnings.
"""

from typing import Optional
from fastapi import APIRouter, status
from app.schemas.radar import (
    FinancialRadarResponse,
    RadarProfileRequest
)
from app.services.radar_service import radar_service

router = APIRouter(prefix="/radar", tags=["Financial Radar"])


@router.get(
    "",
    response_model=FinancialRadarResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Financial Radar health and alerts"
)
def get_financial_radar():
    """
    Evaluates rule-based radar signals based on current user transactions:
    - Recurring fixed obligations burden
    - Unusually high expense anomalies
    - Emergency fund / low balance runway
    - Cash flow deficit / tight margin alerts
    - Deterministic 0-100 Financial Health Score
    """
    return radar_service.evaluate_radar()


@router.post(
    "/analyze",
    response_model=FinancialRadarResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate Financial Radar with custom profile"
)
def analyze_financial_radar_custom(payload: RadarProfileRequest):
    """
    Run rule-based radar checks against a custom or hypothetical financial profile.
    """
    return radar_service.evaluate_radar(profile=payload)

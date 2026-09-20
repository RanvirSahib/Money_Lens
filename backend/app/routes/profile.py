"""
Financial Profile API Routes.
Provides endpoints to fetch and update the user's detailed financial profile and check for statement discrepancies.
"""

from fastapi import APIRouter, HTTPException, Header, Query
from typing import Optional, List
from app.schemas.profile import (
    FinancialProfileResponse,
    FinancialProfileUpdate,
    DiscrepancyComparison,
    UserEMICreate,
    UserEMIUpdate,
    UserEMIResponse,
    UserSubscriptionCreate,
    UserSubscriptionUpdate,
    UserSubscriptionResponse,
    UserInvestmentCreate,
    UserInvestmentUpdate,
    UserInvestmentResponse,
)
from app.services.profile_service import ProfileService

router = APIRouter(prefix="/profile", tags=["Profile"])
profile_service = ProfileService()


@router.get("", response_model=FinancialProfileResponse)
def get_user_profile(user_id: Optional[str] = Query(default="usr_demo_01")):
    """Get the current user's financial profile."""
    prof = profile_service.get_profile(user_id)
    if not prof:
        raise HTTPException(status_code=404, detail="Profile not found")
    return prof


@router.get("/discrepancies", response_model=List[DiscrepancyComparison])
def get_profile_discrepancies(user_id: Optional[str] = Query(default="usr_demo_01")):
    """Compares user's reported financial profile with bank statement activity."""
    return profile_service.check_discrepancies(user_id)


@router.put("", response_model=FinancialProfileResponse)
@router.patch("", response_model=FinancialProfileResponse)
def update_user_profile(updates: FinancialProfileUpdate, user_id: Optional[str] = Query(default="usr_demo_01")):
    """Update the current user's financial profile."""
    return profile_service.update_profile(user_id, updates)


@router.get("/emis", response_model=List[UserEMIResponse])
def get_user_emis(user_id: Optional[str] = Query(default="usr_demo_01")):
    """Get all active EMIs and loan obligations for the current user."""
    return profile_service.get_emis(user_id)


@router.post("/emis", response_model=UserEMIResponse, status_code=201)
def create_user_emi(payload: UserEMICreate, user_id: Optional[str] = Query(default="usr_demo_01")):
    """Add a new active EMI with interest rate and auto-recalibrate financial baseline."""
    return profile_service.create_emi(user_id, payload)


@router.put("/emis/{emi_id}", response_model=UserEMIResponse)
@router.patch("/emis/{emi_id}", response_model=UserEMIResponse)
def update_user_emi(emi_id: str, payload: UserEMIUpdate, user_id: Optional[str] = Query(default="usr_demo_01")):
    """Update an active EMI and recalibrate baseline."""
    updated = profile_service.update_emi(user_id, emi_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="EMI not found")
    return updated


@router.delete("/emis/{emi_id}", status_code=200)
def delete_user_emi(emi_id: str, user_id: Optional[str] = Query(default="usr_demo_01")):
    """Remove/close an active EMI and recalibrate baseline."""
    success = profile_service.delete_emi(user_id, emi_id)
    if not success:
        raise HTTPException(status_code=404, detail="EMI not found")
    return {"status": "success", "message": f"EMI {emi_id} closed/removed successfully."}


@router.get("/subscriptions", response_model=List[UserSubscriptionResponse])
def get_user_subscriptions(user_id: Optional[str] = Query(default="usr_demo_01")):
    """Get all active subscriptions and recurring memberships for current user."""
    return profile_service.get_subscriptions(user_id)


@router.post("/subscriptions", response_model=UserSubscriptionResponse, status_code=201)
def create_user_subscription(payload: UserSubscriptionCreate, user_id: Optional[str] = Query(default="usr_demo_01")):
    """Add a new recurring subscription (monthly or yearly) and auto-recalibrate financial baseline."""
    return profile_service.create_subscription(user_id, payload)


@router.put("/subscriptions/{sub_id}", response_model=UserSubscriptionResponse)
@router.patch("/subscriptions/{sub_id}", response_model=UserSubscriptionResponse)
def update_user_subscription(sub_id: str, payload: UserSubscriptionUpdate, user_id: Optional[str] = Query(default="usr_demo_01")):
    """Update an active subscription and recalibrate baseline."""
    updated = profile_service.update_subscription(user_id, sub_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return updated


@router.delete("/subscriptions/{sub_id}", status_code=200)
def delete_user_subscription(sub_id: str, user_id: Optional[str] = Query(default="usr_demo_01")):
    """Remove/cancel an active subscription and recalibrate baseline."""
    success = profile_service.delete_subscription(user_id, sub_id)
    if not success:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return {"status": "success", "message": f"Subscription {sub_id} removed successfully."}


@router.get("/investments", response_model=List[UserInvestmentResponse])
def get_user_investments(user_id: Optional[str] = Query(default="usr_demo_01")):
    """Get all active investments and SIPs for current user."""
    return profile_service.get_investments(user_id)


@router.post("/investments", response_model=UserInvestmentResponse, status_code=201)
def create_user_investment(payload: UserInvestmentCreate, user_id: Optional[str] = Query(default="usr_demo_01")):
    """Add a new monthly investment / SIP and auto-recalibrate financial baseline."""
    return profile_service.create_investment(user_id, payload)


@router.put("/investments/{inv_id}", response_model=UserInvestmentResponse)
@router.patch("/investments/{inv_id}", response_model=UserInvestmentResponse)
def update_user_investment(inv_id: str, payload: UserInvestmentUpdate, user_id: Optional[str] = Query(default="usr_demo_01")):
    """Update an active investment and recalibrate baseline."""
    updated = profile_service.update_investment(user_id, inv_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Investment not found")
    return updated


@router.delete("/investments/{inv_id}", status_code=200)
def delete_user_investment(inv_id: str, user_id: Optional[str] = Query(default="usr_demo_01")):
    """Remove/stop tracking an active investment and recalibrate baseline."""
    success = profile_service.delete_investment(user_id, inv_id)
    if not success:
        raise HTTPException(status_code=404, detail="Investment not found")
    return {"status": "success", "message": f"Investment {inv_id} removed successfully."}


from pydantic import BaseModel, Field

class FeedbackSubmission(BaseModel):
    name: Optional[str] = Field(default=None, examples=["Aarnav"])
    email: Optional[str] = Field(default=None, examples=["user@example.com"])
    category: str = Field(default="Feedback", examples=["Bug Report", "Feature Request", "Customer Care"])
    rating: Optional[int] = Field(default=5, ge=1, le=5)
    message: str = Field(..., min_length=2, examples=["Great experience with the reverse time machine."])


@router.post("/feedback", status_code=200)
def submit_user_feedback(payload: FeedbackSubmission):
    """Submit customer care feedback or feature requests."""
    return {
        "status": "success",
        "message": "Thank you for your feedback. The Monexa product team has received your message.",
        "feedback": payload.model_dump()
    }


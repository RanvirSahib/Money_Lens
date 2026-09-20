import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.profile import UserEMICreate, UserEMIUpdate
from app.repositories.postgres_profile_repo import PostgresProfileRepository

client = TestClient(app)


def test_emi_calculation_formula():
    repo = PostgresProfileRepository()
    # Loan: 5,00,000 at 10% p.a. for 36 months
    # Formula: E = P * r * (1+r)^n / ((1+r)^n - 1)
    # Monthly rate = 0.10 / 12 = 0.008333333
    # Monthly EMI ~ 16,133.60
    emi, rem, total_interest = repo._calculate_emi_details(
        principal_amount=500000,
        interest_rate_pct=10.0,
        tenure_months=36
    )
    assert 16130 <= emi <= 16140
    assert rem == 36
    assert total_interest > 0


def test_emi_crud_and_profile_recalibration():
    user_id = "test_emi_user"
    
    # 1. Create Profile with baseline
    prof_resp = client.put(f"/api/v1/profile?user_id={user_id}", json={
        "name": "Test EMI User",
        "monthly_income": 100000,
        "essential_expenses": 30000,
        "discretionary_expenses": 10000,
        "current_savings": 200000,
        "monthly_investments": 10000,
        "active_emis": 0,
        "active_loans": 0
    })
    assert prof_resp.status_code == 200

    # 2. Add an EMI (e.g. Car Loan of 6,00,000 at 9.0% for 48 months)
    emi_payload = {
        "name": "HDFC Car Loan",
        "category": "Auto Loan",
        "principal_amount": 600000,
        "interest_rate_pct": 9.0,
        "tenure_months": 48,
        "remaining_months": 48,
    }
    create_resp = client.post(f"/api/v1/profile/emis?user_id={user_id}", json=emi_payload)
    assert create_resp.status_code == 201
    emi_data = create_resp.json()
    assert emi_data["id"].startswith("emi_")
    assert emi_data["name"] == "HDFC Car Loan"
    assert emi_data["monthly_emi"] > 0
    assert emi_data["total_interest_payable"] > 0
    emi_id = emi_data["id"]
    monthly_emi_1 = emi_data["monthly_emi"]

    # 3. Check that user profile active_emis and active_loans are automatically synced!
    updated_prof = client.get(f"/api/v1/profile?user_id={user_id}").json()
    assert updated_prof["active_loans"] == 600000
    assert round(updated_prof["active_emis"]) == round(monthly_emi_1)
    # DTI ratio = (active_emis / 100000) * 100
    expected_dti = round((monthly_emi_1 / 100000) * 100, 1)
    assert abs(updated_prof["dti_ratio_pct"] - expected_dti) < 0.2

    # 4. Fetch all EMIs
    list_resp = client.get(f"/api/v1/profile/emis?user_id={user_id}")
    assert list_resp.status_code == 200
    emis_list = list_resp.json()
    assert len(emis_list) >= 1
    assert any(e["id"] == emi_id for e in emis_list)

    # 5. Update EMI (e.g. change interest rate to 8.5%)
    update_resp = client.put(f"/api/v1/profile/emis/{emi_id}?user_id={user_id}", json={
        "interest_rate_pct": 8.5
    })
    assert update_resp.status_code == 200
    assert update_resp.json()["interest_rate_pct"] == 8.5

    # 6. Delete EMI
    del_resp = client.delete(f"/api/v1/profile/emis/{emi_id}?user_id={user_id}")
    assert del_resp.status_code == 200

    # 7. Check that profile active_emis is reset to 0
    final_prof = client.get(f"/api/v1/profile?user_id={user_id}").json()
    assert final_prof["active_emis"] == 0
    assert final_prof["active_loans"] == 0

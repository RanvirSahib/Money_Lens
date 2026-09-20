import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.repositories.postgres_profile_repo import PostgresProfileRepository

client = TestClient(app)


def test_investment_annual_calculation():
    repo = PostgresProfileRepository()
    # Monthly 5000 -> Annual 60000
    annual = repo._calculate_investment_annual(monthly_amount=5000.0)
    assert annual == 60000.0

    # Monthly 12500 -> Annual 150000 (PPF max limit)
    annual_ppf = repo._calculate_investment_annual(monthly_amount=12500.0)
    assert annual_ppf == 150000.0


def test_investment_crud_and_profile_recalibration():
    user_id = "test_invest_user"

    # 1. Create baseline profile
    prof_resp = client.put(f"/api/v1/profile?user_id={user_id}", json={
        "name": "Test Investment User",
        "monthly_income": 120000,
        "essential_expenses": 35000,
        "discretionary_expenses": 15000,
        "current_savings": 300000,
        "monthly_investments": 0,
        "active_emis": 0,
        "active_loans": 0,
        "other_recurring_expenses": 0
    })
    assert prof_resp.status_code == 200

    # 2. Add Monthly SIP 1 (e.g. Nifty 50 Index: 5000/mo)
    inv1_payload = {
        "name": "Nifty 50 Index Fund SIP",
        "category": "Mutual Fund SIP",
        "asset_class": "Equity",
        "monthly_amount": 5000.0,
        "expected_return_pct": 12.5,
        "sip_date": 5,
        "status": "active"
    }
    create_resp1 = client.post(f"/api/v1/profile/investments?user_id={user_id}", json=inv1_payload)
    assert create_resp1.status_code == 201
    inv1_data = create_resp1.json()
    assert inv1_data["monthly_amount"] == 5000.0
    assert inv1_data["annual_contribution"] == 60000.0
    inv1_id = inv1_data["id"]

    # 3. Add Monthly SIP 2 (e.g. PPF: 12500/mo)
    inv2_payload = {
        "name": "Public Provident Fund (PPF)",
        "category": "PPF / EPF / VPF",
        "asset_class": "Retirement / Pension",
        "monthly_amount": 12500.0,
        "expected_return_pct": 7.1,
        "sip_date": 1,
        "status": "active"
    }
    create_resp2 = client.post(f"/api/v1/profile/investments?user_id={user_id}", json=inv2_payload)
    assert create_resp2.status_code == 201
    inv2_data = create_resp2.json()
    assert inv2_data["monthly_amount"] == 12500.0
    assert inv2_data["annual_contribution"] == 150000.0
    inv2_id = inv2_data["id"]

    # 4. Check that user profile monthly_investments is auto-synchronized!
    # Total monthly investments = 5000 + 12500 = 17500
    updated_prof = client.get(f"/api/v1/profile?user_id={user_id}").json()
    assert updated_prof["monthly_investments"] == 17500.0

    # 5. List investments
    list_resp = client.get(f"/api/v1/profile/investments?user_id={user_id}")
    assert list_resp.status_code == 200
    inv_list = list_resp.json()
    assert len(inv_list) >= 2

    # 6. Update investment (e.g. increase Nifty 50 SIP to 8000/mo)
    update_resp = client.put(f"/api/v1/profile/investments/{inv1_id}?user_id={user_id}", json={
        "monthly_amount": 8000.0
    })
    assert update_resp.status_code == 200
    assert update_resp.json()["monthly_amount"] == 8000.0
    assert update_resp.json()["annual_contribution"] == 96000.0

    # Profile monthly_investments should now be 8000 + 12500 = 20500
    updated_prof2 = client.get(f"/api/v1/profile?user_id={user_id}").json()
    assert updated_prof2["monthly_investments"] == 20500.0

    # 7. Delete investments
    del1 = client.delete(f"/api/v1/profile/investments/{inv1_id}?user_id={user_id}")
    del2 = client.delete(f"/api/v1/profile/investments/{inv2_id}?user_id={user_id}")
    assert del1.status_code == 200
    assert del2.status_code == 200

    # 8. Profile monthly_investments should be reset to 0
    final_prof = client.get(f"/api/v1/profile?user_id={user_id}").json()
    assert final_prof["monthly_investments"] == 0

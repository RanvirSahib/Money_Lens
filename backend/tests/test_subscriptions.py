import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.repositories.postgres_profile_repo import PostgresProfileRepository

client = TestClient(app)


def test_subscription_amortization_math():
    repo = PostgresProfileRepository()
    # Yearly plan of 1,499 -> Monthly equivalent: 124.92, Annual: 1499.0
    monthly_equiv, annual_cost = repo._calculate_subscription_details(
        amount=1499.0,
        billing_frequency="yearly"
    )
    assert monthly_equiv == 124.92
    assert annual_cost == 1499.0

    # Monthly plan of 649 -> Monthly equivalent: 649.0, Annual: 7788.0
    monthly_equiv_m, annual_cost_m = repo._calculate_subscription_details(
        amount=649.0,
        billing_frequency="monthly"
    )
    assert monthly_equiv_m == 649.0
    assert annual_cost_m == 7788.0


def test_subscription_crud_and_profile_recalibration():
    user_id = "test_sub_user"

    # 1. Create baseline profile
    prof_resp = client.put(f"/api/v1/profile?user_id={user_id}", json={
        "name": "Test Subscription User",
        "monthly_income": 100000,
        "essential_expenses": 30000,
        "discretionary_expenses": 10000,
        "current_savings": 200000,
        "monthly_investments": 10000,
        "active_emis": 0,
        "active_loans": 0,
        "other_recurring_expenses": 0
    })
    assert prof_resp.status_code == 200

    # 2. Add Monthly Subscription (e.g. Netflix Premium: 649/mo)
    sub1_payload = {
        "name": "Netflix Premium",
        "category": "Streaming",
        "billing_frequency": "monthly",
        "amount": 649.0,
        "renewal_date": "2026-10-01",
        "status": "active",
        "auto_renew": True
    }
    create_resp1 = client.post(f"/api/v1/profile/subscriptions?user_id={user_id}", json=sub1_payload)
    assert create_resp1.status_code == 201
    sub1_data = create_resp1.json()
    assert sub1_data["monthly_equivalent"] == 649.0
    sub1_id = sub1_data["id"]

    # 3. Add Annual Subscription (e.g. Amazon Prime: 1499/yr -> ~124.92/mo)
    sub2_payload = {
        "name": "Amazon Prime",
        "category": "Streaming",
        "billing_frequency": "yearly",
        "amount": 1499.0,
        "renewal_date": "2027-09-20",
        "status": "active",
        "auto_renew": True
    }
    create_resp2 = client.post(f"/api/v1/profile/subscriptions?user_id={user_id}", json=sub2_payload)
    assert create_resp2.status_code == 201
    sub2_data = create_resp2.json()
    assert sub2_data["monthly_equivalent"] == 124.92
    sub2_id = sub2_data["id"]

    # 4. Check that user profile other_recurring_expenses is auto-synchronized!
    # Total monthly = 649 + 124.92 = 773.92
    updated_prof = client.get(f"/api/v1/profile?user_id={user_id}").json()
    assert updated_prof["other_recurring_expenses"] == 773.92

    # 5. List subscriptions
    list_resp = client.get(f"/api/v1/profile/subscriptions?user_id={user_id}")
    assert list_resp.status_code == 200
    subs_list = list_resp.json()
    assert len(subs_list) >= 2

    # 6. Update subscription (e.g. change Netflix amount to 199 mobile plan)
    update_resp = client.put(f"/api/v1/profile/subscriptions/{sub1_id}?user_id={user_id}", json={
        "amount": 199.0
    })
    assert update_resp.status_code == 200
    assert update_resp.json()["amount"] == 199.0
    assert update_resp.json()["monthly_equivalent"] == 199.0

    # 7. Delete subscriptions
    del1 = client.delete(f"/api/v1/profile/subscriptions/{sub1_id}?user_id={user_id}")
    del2 = client.delete(f"/api/v1/profile/subscriptions/{sub2_id}?user_id={user_id}")
    assert del1.status_code == 200
    assert del2.status_code == 200

    # 8. Profile other_recurring_expenses should be reset to 0
    final_prof = client.get(f"/api/v1/profile?user_id={user_id}").json()
    assert final_prof["other_recurring_expenses"] == 0

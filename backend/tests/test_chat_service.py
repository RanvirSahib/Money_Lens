"""
Unit tests for ChatService conversational intelligence:
- Parsing liquid cash, savings, salary, expenses, EMIs, investments, goals
- Natural language multi-turn confirmation ("Yes, update savings", "Yes", "Confirm", "Add this goal")
- Natural language cancellation ("Cancel", "Don't update")
- Real-time profile state recalibration upon action execution
"""

import pytest
from app.services.chat_service import ChatService
from app.services.profile_service import ProfileService
from app.services.goal_service import GoalService
from app.services.spending_service import SpendingService
from app.services.intent_service import IntentService


def test_liquid_cash_and_natural_language_confirmation():
    user_id = "usr_test_liquid_cash"
    session_id = "sess_test_123"
    profile_service = ProfileService()
    chat_service = ChatService(profile_service=profile_service)

    # 1. User says "Update the liquid cash to 10000"
    res1 = chat_service.handle_chat_message(
        message="Update the liquid cash to 10000",
        user_id=user_id,
        session_id=session_id,
    )
    assert res1.action_payload is not None
    assert res1.action_payload.action_type == "UPDATE_PROFILE"
    assert res1.action_payload.data.get("current_savings") == 10000.0
    assert not res1.action_payload.confirmed
    assert "10,000" in res1.reply

    # 2. User confirms by replying "Yes, update savings" without clicking any button
    res2 = chat_service.handle_chat_message(
        message="Yes, update savings",
        user_id=user_id,
        session_id=session_id,
    )
    assert res2.action_payload is not None
    assert res2.action_payload.confirmed is True
    assert "Profile successfully updated" in res2.reply or "recalibrated" in res2.reply

    # 3. Verify PostgreSQL/in-memory profile updated immediately
    updated_profile = profile_service.get_profile(user_id)
    assert updated_profile.current_savings == 10000.0


def test_liquid_cash_alternative_phrasings():
    user_id = "usr_test_phrasings"
    session_id = "sess_test_456"
    profile_service = ProfileService()
    chat_service = ChatService(profile_service=profile_service)

    # "my liquid cash is 15000"
    res = chat_service.handle_chat_message(
        message="my liquid cash is 15000",
        user_id=user_id,
        session_id=session_id,
    )
    assert res.action_payload is not None
    assert res.action_payload.data.get("current_savings") == 15000.0

    # Confirm with plain "Yes"
    res_conf = chat_service.handle_chat_message(
        message="Yes",
        user_id=user_id,
        session_id=session_id,
    )
    assert res_conf.action_payload.confirmed is True
    assert profile_service.get_profile(user_id).current_savings == 15000.0


def test_income_update_and_cancellation():
    user_id = "usr_test_income_cancel"
    session_id = "sess_test_789"
    profile_service = ProfileService()
    chat_service = ChatService(profile_service=profile_service)

    # 1. Propose income change
    res1 = chat_service.handle_chat_message(
        message="My salary increased to ₹95,000",
        user_id=user_id,
        session_id=session_id,
    )
    assert res1.action_payload is not None
    assert res1.action_payload.data.get("monthly_income") == 95000.0

    # 2. Cancel
    res_cancel = chat_service.handle_chat_message(
        message="Cancel",
        user_id=user_id,
        session_id=session_id,
    )
    assert "cancelled" in res_cancel.reply.lower()

    # 3. Subsequent "Yes" does nothing because pending action was cancelled
    res_after = chat_service.handle_chat_message(
        message="Yes",
        user_id=user_id,
        session_id=session_id,
    )
    assert res_after.action_payload is None


def test_goal_creation_and_natural_language_confirmation():
    user_id = "usr_test_goal"
    session_id = "sess_test_goal"
    goal_service = GoalService()
    chat_service = ChatService(goal_service=goal_service)

    res1 = chat_service.handle_chat_message(
        message="I want to buy a 6 lakh car in 18 months",
        user_id=user_id,
        session_id=session_id,
    )
    assert res1.action_payload is not None
    assert res1.action_payload.action_type == "CREATE_GOAL"
    assert res1.action_payload.data.get("target_amount") == 600000.0

    # Confirm with "Add this goal"
    res2 = chat_service.handle_chat_message(
        message="Add this goal",
        user_id=user_id,
        session_id=session_id,
    )
    assert res2.action_payload is not None
    assert res2.action_payload.confirmed is True


def test_goal_creation_custom_months():
    user_id = "usr_test_goal_2m"
    session_id = "sess_test_goal_2m"
    goal_service = GoalService()
    chat_service = ChatService(goal_service=goal_service)

    res = chat_service.handle_chat_message(
        message="add a goal of saving 10000 in 2 months",
        user_id=user_id,
        session_id=session_id,
    )
    assert res.action_payload is not None
    assert res.action_payload.action_type == "CREATE_GOAL"
    assert res.action_payload.data.get("target_amount") == 10000.0
    assert res.action_payload.data.get("target_months") == 2
    assert res.action_payload.data.get("monthly_contribution") == 5000.0
    assert "2 months" in res.reply


"""
Pytest configuration and fixtures.
Ensures unit test suite runs in hermetic in-memory mode without external network calls.
"""

import os
import pytest
from app.core.config import settings

@pytest.fixture(autouse=True)
def reset_test_environment(monkeypatch):
    """Ensure tests run against in-memory stores unless explicitly testing DB connectors."""
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("DB_HOST", raising=False)
    monkeypatch.delenv("RDS_HOSTNAME", raising=False)
    monkeypatch.delenv("DB_USER", raising=False)
    monkeypatch.delenv("RDS_USERNAME", raising=False)
    monkeypatch.delenv("DB_PASSWORD", raising=False)
    monkeypatch.delenv("RDS_PASSWORD", raising=False)

    monkeypatch.setattr(settings, "DATABASE_URL", None)
    monkeypatch.setattr(settings, "DB_HOST", None)
    monkeypatch.setattr(settings, "DB_USER", None)
    monkeypatch.setattr(settings, "AWS_ACCESS_KEY_ID", None)
    monkeypatch.setattr(settings, "AWS_SECRET_ACCESS_KEY", None)

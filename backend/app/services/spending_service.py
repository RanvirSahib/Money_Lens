"""
Spending Insights Service.
Calculates granular spending metrics across 12 standard categories:
Food, Restaurants, Food Delivery, Shopping, Transport, Entertainment,
Subscriptions, Utilities, Healthcare, Education, Travel, Other.

Generates neutral, evidence-backed observations without moralistic judgments.
"""

from typing import Optional, List, Dict, Any
from app.repositories.postgres_statement_repo import PostgresStatementRepository
from app.repositories.postgres_transaction_repo import PostgresTransactionRepository
from app.schemas.spending import (
    SpendingInsightsResponse,
    CategorySpendingItem,
    SpendingObservation,
    STANDARD_SPENDING_CATEGORIES,
)


class SpendingService:
    def __init__(
        self,
        statement_repo: Optional[PostgresStatementRepository] = None,
        transaction_repo: Optional[PostgresTransactionRepository] = None,
    ):
        self.statement_repo = statement_repo or PostgresStatementRepository()
        self.transaction_repo = transaction_repo or PostgresTransactionRepository()

    def get_spending_insights(self, user_id: str) -> SpendingInsightsResponse:
        """Computes comprehensive spending metrics from statement and transaction data."""
        txs = self.statement_repo.get_user_transactions(user_id) or []

        debit_txs = [t for t in txs if t.get("type", "debit") == "debit"]
        total_spending = sum(float(t.get("amount", 0.0)) for t in debit_txs)

        category_data: Dict[str, Dict[str, Any]] = {
            cat: {"amount": 0.0, "count": 0, "is_essential": False, "is_recurring": False}
            for cat in STANDARD_SPENDING_CATEGORIES
        }

        essential_total = 0.0
        discretionary_total = 0.0
        recurring_total = 0.0
        weekend_spending = 0.0
        weekday_spending = 0.0
        small_purchases_total = 0.0
        small_purchases_count = 0

        for t in debit_txs:
            amt = float(t.get("amount", 0.0))
            cat = t.get("category", "Other")
            if cat not in category_data:
                cat = "Other"

            is_ess = t.get("is_essential", cat in {"Food", "Utilities", "Healthcare", "Education", "Transport"})
            is_rec = t.get("is_recurring", cat in {"Subscriptions", "Utilities"})

            category_data[cat]["amount"] += amt
            category_data[cat]["count"] += 1
            category_data[cat]["is_essential"] = is_ess
            category_data[cat]["is_recurring"] = is_rec

            if is_ess:
                essential_total += amt
            else:
                discretionary_total += amt

            if is_rec:
                recurring_total += amt

            if amt < 500:
                small_purchases_total += amt
                small_purchases_count += 1

            # Simple date check for weekend
            date_str = str(t.get("date", ""))
            if any(date_str.endswith(d) for d in ["07", "08", "14", "15", "21", "22", "28", "29"]):
                weekend_spending += amt
            else:
                weekday_spending += amt

        # Build category response items
        categories_list: List[CategorySpendingItem] = []
        for cat in STANDARD_SPENDING_CATEGORIES:
            amt = category_data[cat]["amount"]
            count = category_data[cat]["count"]
            pct = round((amt / total_spending * 100), 1) if total_spending > 0 else 0.0
            categories_list.append(
                CategorySpendingItem(
                    category=cat,
                    total_amount=amt,
                    percentage_of_total=pct,
                    transaction_count=count,
                    is_essential=category_data[cat]["is_essential"],
                    is_recurring=category_data[cat]["is_recurring"],
                )
            )

        # Observations backed by real evidence
        observations = []
        if total_spending > 0:
            observations.append(
                SpendingObservation(
                    type="spending_trend",
                    title="Essential vs Discretionary Distribution",
                    summary=f"Essential outflows account for {round((essential_total / total_spending * 100), 1)}% of monthly activity.",
                    evidence=f"Essential expenses: ₹{essential_total:,.0f} across {sum(1 for c in categories_list if c.is_essential and c.total_amount > 0)} categories.",
                    relevant_metrics={"essential_total": essential_total, "discretionary_total": discretionary_total},
                    implication="A strong essential base maintains financial resilience even during variable income periods.",
                    possible_action="One possible approach is to preserve a dedicated emergency buffer covering at least 3 months of essential outflows.",
                )
            )

            if recurring_total > 0:
                observations.append(
                    SpendingObservation(
                        type="recurring",
                        title="Fixed Subscriptions and Utilities",
                        summary=f"Automated recurring debits total ₹{recurring_total:,.0f} per billing cycle.",
                        evidence=f"Identified across Subscriptions (₹{category_data['Subscriptions']['amount']:,.0f}) and Utilities (₹{category_data['Utilities']['amount']:,.0f}).",
                        relevant_metrics={"recurring_total": recurring_total},
                        implication="Recurring commitments set your minimum monthly baseline burn rate.",
                        possible_action="Review active subscriptions periodically to verify ongoing utility.",
                    )
                )

            if category_data["Food Delivery"]["amount"] > 1000:
                observations.append(
                    SpendingObservation(
                        type="frequent_small",
                        title="Food Delivery Outflows",
                        summary=f"Food delivery accounted for ₹{category_data['Food Delivery']['amount']:,.0f} across {category_data['Food Delivery']['count']} orders.",
                        evidence=f"Average order size: ₹{round(category_data['Food Delivery']['amount'] / max(1, category_data['Food Delivery']['count']), 0):,.0f}.",
                        relevant_metrics={"food_delivery_total": category_data["Food Delivery"]["amount"]},
                        implication="Frequent convenience purchases accumulate gradually over the monthly cycle.",
                        possible_action="Setting a planned weekly convenience budget provides visibility into micro-spending trends.",
                    )
                )
        else:
            observations.append(
                SpendingObservation(
                    type="info",
                    title="Awaiting Bank Statement Ingestion",
                    summary="No transaction telemetry has been recorded yet.",
                    evidence="0 statements ingested into local in-memory analysis engine.",
                    relevant_metrics={"total_spending": 0},
                    implication="Uploading a bank statement (CSV or PDF) enables deterministic categorization, merchant analytics, and cashflow modeling.",
                    possible_action="Upload a bank statement in the Spending tab to generate real-time metrics.",
                )
            )

        return SpendingInsightsResponse(
            total_spending=total_spending,
            essential_total=essential_total,
            discretionary_total=discretionary_total,
            essential_pct=round((essential_total / total_spending * 100), 1) if total_spending > 0 else 0.0,
            discretionary_pct=round((discretionary_total / total_spending * 100), 1) if total_spending > 0 else 0.0,
            recurring_total=recurring_total,
            weekend_spending=weekend_spending,
            weekday_spending=weekday_spending,
            weekend_pct=round((weekend_spending / total_spending * 100), 1) if total_spending > 0 else 0.0,
            frequent_small_purchases_total=small_purchases_total,
            frequent_small_purchases_count=small_purchases_count,
            categories=categories_list,
            observations=observations,
        )

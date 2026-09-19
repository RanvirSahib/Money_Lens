"""
Unit tests for MoneyLens Natural Language Intent and Indian Currency Parser.
"""

import pytest
from app.services.intent_service import intent_service, MoneyLensIntent


class TestIndianCurrencyParser:
    def test_parses_lakh_variations(self):
        assert intent_service.parse_indian_amount("I want to buy a 6 lakh car") == 600000.0
        assert intent_service.parse_indian_amount("Car worth 6 lakhs") == 600000.0
        assert intent_service.parse_indian_amount("2.5 lac deposit") == 250000.0
        assert intent_service.parse_indian_amount("₹10 lakh fund") == 1000000.0
        assert intent_service.parse_indian_amount("5 lacs") == 500000.0

    def test_parses_crore_variations(self):
        assert intent_service.parse_indian_amount("₹5 crore house") == 50000000.0
        assert intent_service.parse_indian_amount("1.5 cr apartment") == 15000000.0
        assert intent_service.parse_indian_amount("2 crores retirement") == 20000000.0

    def test_parses_thousand_variations(self):
        assert intent_service.parse_indian_amount("50 thousand phone") == 50000.0
        assert intent_service.parse_indian_amount("₹70,000 laptop") == 70000.0
        assert intent_service.parse_indian_amount("80k budget") == 80000.0
        assert intent_service.parse_indian_amount("45 thousands") == 45000.0

    def test_parses_written_words(self):
        assert intent_service.parse_indian_amount("six lakh car") == 600000.0
        assert intent_service.parse_indian_amount("fifty thousand rupees") == 50000.0
        assert intent_service.parse_indian_amount("five crore") == 50000000.0

    def test_parses_standard_numbers_and_commas(self):
        assert intent_service.parse_indian_amount("6,00,000") == 600000.0
        assert intent_service.parse_indian_amount("600000") == 600000.0
        assert intent_service.parse_indian_amount("₹70000") == 70000.0


class TestIntentClassification:
    def test_time_machine_intents(self):
        res1 = intent_service.parse_intent("I want to buy a 6 lakh car")
        assert res1.intent == MoneyLensIntent.TIME_MACHINE
        assert res1.amount == 600000.0
        assert res1.item == "car"

        res2 = intent_service.parse_intent("Can I afford a 6 lakh car with my current savings?")
        assert res2.intent == MoneyLensIntent.TIME_MACHINE
        assert res2.amount == 600000.0

        res3 = intent_service.parse_intent("What happens if I buy a phone for ₹70,000?")
        assert res3.intent == MoneyLensIntent.TIME_MACHINE
        assert res3.amount == 70000.0
        assert res3.item == "phone"

        res4 = intent_service.parse_intent("What if I spend six lakh on a car?")
        assert res4.intent == MoneyLensIntent.TIME_MACHINE
        assert res4.amount == 600000.0

        res5 = intent_service.parse_intent("can I afford 600000 car")
        assert res5.intent == MoneyLensIntent.TIME_MACHINE
        assert res5.amount == 600000.0

    def test_goal_analysis_intents(self):
        res1 = intent_service.parse_intent("I want to save ₹5 lakh in one year")
        assert res1.intent == MoneyLensIntent.GOAL_ANALYSIS
        assert res1.amount == 500000.0
        assert res1.timeline_months == 12

        res2 = intent_service.parse_intent("I aim to save 2 lakh in 6 months")
        assert res2.intent == MoneyLensIntent.GOAL_ANALYSIS
        assert res2.amount == 200000.0
        assert res2.timeline_months == 6

    def test_reverse_analysis_intents(self):
        res1 = intent_service.parse_intent("How much should I save every month to reach ₹5 lakh?")
        assert res1.intent == MoneyLensIntent.REVERSE_ANALYSIS
        assert res1.amount == 500000.0

        res2 = intent_service.parse_intent("how much do I need to save monthly for 5 lakh")
        assert res2.intent == MoneyLensIntent.REVERSE_ANALYSIS
        assert res2.amount == 500000.0

        res3 = intent_service.parse_intent("How much to save per month to reach 10 lakh in 2 years")
        assert res3.intent == MoneyLensIntent.REVERSE_ANALYSIS
        assert res3.amount == 1000000.0
        assert res3.timeline_months == 24

    def test_experiment_analysis_intents(self):
        res1 = intent_service.parse_intent("Compare buying this car now versus waiting 6 months")
        assert res1.intent == MoneyLensIntent.EXPERIMENT_ANALYSIS
        assert res1.item == "car"

        res2 = intent_service.parse_intent("Compare cash vs EMI for a 5 lakh purchase")
        assert res2.intent == MoneyLensIntent.EXPERIMENT_ANALYSIS
        assert res2.amount == 500000.0

    def test_radar_analysis_intents(self):
        res1 = intent_service.parse_intent("Do I have enough emergency savings?")
        assert res1.intent == MoneyLensIntent.RADAR_ANALYSIS

        res2 = intent_service.parse_intent("Are there any financial problems coming up?")
        assert res2.intent == MoneyLensIntent.RADAR_ANALYSIS

        res3 = intent_service.parse_intent("Check my financial risks and cash flow health")
        assert res3.intent == MoneyLensIntent.RADAR_ANALYSIS

    def test_ambiguous_or_empty_queries(self):
        res1 = intent_service.parse_intent("Hello")
        assert res1.intent == MoneyLensIntent.CLARIFICATION_NEEDED
        assert res1.is_ambiguous is True
        assert res1.clarification_question is not None

        res2 = intent_service.parse_intent("")
        assert res2.intent == MoneyLensIntent.CLARIFICATION_NEEDED

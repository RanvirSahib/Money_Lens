"""
MoneyLens Natural Language Intent & Indian Currency Parser.

Extracts structured financial intent and parses Indian currency expressions
(e.g., '6 lakh', '₹5 crore', '50 thousand', '6,00,000', 'six lakh') without performing
any financial calculations.

The parsed intent maps directly to one of the 5 MoneyLens deterministic capabilities:
- TIME_MACHINE
- GOAL_ANALYSIS
- REVERSE_ANALYSIS
- EXPERIMENT_ANALYSIS
- RADAR_ANALYSIS
"""

import re
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class MoneyLensIntent(str, Enum):
    TIME_MACHINE = "time_machine"
    GOAL_ANALYSIS = "goal_analysis"
    REVERSE_ANALYSIS = "reverse_analysis"
    EXPERIMENT_ANALYSIS = "experiment_analysis"
    RADAR_ANALYSIS = "radar_analysis"
    CLARIFICATION_NEEDED = "clarification_needed"


class ParsedFinancialIntent(BaseModel):
    intent: MoneyLensIntent
    raw_query: str
    item: Optional[str] = None
    amount: Optional[float] = None
    timeline_months: Optional[int] = None
    payment_method: Optional[str] = None  # 'cash', 'emi', etc.
    goal_title: Optional[str] = None
    confidence_score: float = 0.95
    is_ambiguous: bool = False
    clarification_question: Optional[str] = None
    extracted_entities: Dict[str, Any] = Field(default_factory=dict)


# Word number mapping
WORD_TO_NUM = {
    "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14, "fifteen": 15,
    "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19, "twenty": 20,
    "thirty": 30, "forty": 40, "fifty": 50, "sixty": 60, "seventy": 70,
    "eighty": 80, "ninety": 90, "hundred": 100,
}


class IntentService:
    """Deterministic, high-accuracy natural language parser for Indian financial queries."""

    @staticmethod
    def parse_indian_amount(text: str) -> Optional[float]:
        """
        Parses Indian financial expressions into raw float amounts in INR.
        Supports:
        - '6 lakh', '6 lakhs', '6 lac', '6 lacs', '6L', '6.5 lakh'
        - '₹5 crore', '5 crore', '5 crores', '5 cr', '2.5 cr'
        - '50 thousand', '50k', '50,000', '₹70,000'
        - '6,00,000', '600000'
        - 'six lakh', 'fifty thousand', 'five crore'
        """
        if not text:
            return None

        clean = text.lower().strip()
        # Remove currency symbols and formatting noise
        clean = re.sub(r"[₹\$]", " ", clean)
        clean = re.sub(r"\brs\.?\b|\binr\b", " ", clean)
        
        # Remove commas inside numbers (e.g. 6,00,000 -> 600000, 70,000 -> 70000)
        clean = re.sub(r"(?<=\d),(?=\d)", "", clean)
        clean = clean.replace(",", " ")

        # 1. Check for word combinations with crore / lakh / thousand
        word_scale_pattern = r"\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)\s*(crore|crores|cr|lakh|lakhs|lac|lacs|l|thousand|thousands|k)\b"
        word_scale_match = re.search(word_scale_pattern, clean)
        if word_scale_match:
            num_word = word_scale_match.group(1)
            scale_word = word_scale_match.group(2)
            base_val = float(WORD_TO_NUM.get(num_word, 1))
            multiplier = 1.0
            if scale_word in ("crore", "crores", "cr"):
                multiplier = 10_000_000.0
            elif scale_word in ("lakh", "lakhs", "lac", "lacs", "l"):
                multiplier = 100_000.0
            elif scale_word in ("thousand", "thousands", "k"):
                multiplier = 1_000.0
            return base_val * multiplier

        # 2. Check for numeric values with crore / cr
        cr_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:crore|crores|cr)\b", clean)
        if cr_match:
            return float(cr_match.group(1)) * 10_000_000.0

        # 3. Check for numeric values with lakh / lac / l
        lakh_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|l)\b", clean)
        if lakh_match:
            return float(lakh_match.group(1)) * 100_000.0

        # 4. Check for numeric values with k / thousand
        k_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:thousand|thousands|k)\b", clean)
        if k_match:
            return float(k_match.group(1)) * 1_000.0

        # 5. Check for plain standalone numbers (e.g., 600000, 70000, 50000)
        num_matches = re.findall(r"\b\d+(?:\.\d+)?\b", clean)
        if num_matches:
            candidates = [float(n) for n in num_matches if float(n) >= 100]
            if candidates:
                return candidates[0]
            return float(num_matches[0])

        return None

    @staticmethod
    def parse_timeline_months(text: str) -> Optional[int]:
        """
        Parses time periods from query into integer months.
        Supports:
        - '1 year', '2 years', '1 yr', '5 yrs' -> 12, 24, 12, 60
        - '6 months', '12 months', '3m', '6mo' -> 6, 12, 3, 6
        - 'next month' -> 1
        - 'in a year' -> 12
        - 'in one year' -> 12
        """
        if not text:
            return None

        clean = text.lower()

        # Year patterns
        yr_word_match = re.search(r"\b(one|two|three|four|five|six|ten)\s*(?:year|years|yr|yrs)\b", clean)
        if yr_word_match:
            val = WORD_TO_NUM.get(yr_word_match.group(1), 1)
            return val * 12

        yr_num_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:year|years|yr|yrs)\b", clean)
        if yr_num_match:
            return int(float(yr_num_match.group(1)) * 12)

        if "next month" in clean or "in a month" in clean:
            return 1
        if "in a year" in clean or "in one year" in clean:
            return 12

        # Month patterns
        mo_word_match = re.search(r"\b(one|two|three|four|five|six|nine|twelve|eighteen|twenty four)\s*(?:month|months|mo|mos)\b", clean)
        if mo_word_match:
            return WORD_TO_NUM.get(mo_word_match.group(1), 6)

        mo_num_match = re.search(r"(\d+)\s*(?:month|months|mo|mos|m)\b", clean)
        if mo_num_match:
            return int(mo_num_match.group(1))

        return None

    @staticmethod
    def extract_item(text: str) -> Optional[str]:
        """Extracts common item / purchase subjects from financial queries."""
        clean = text.lower()
        common_items = [
            "car", "phone", "iphone", "mobile", "laptop", "macbook",
            "bike", "motorcycle", "house", "flat", "apartment",
            "vacation", "trip", "holiday", "wedding", "tv",
            "education", "gadget", "watch", "camera"
        ]
        for item in common_items:
            if re.search(rf"\b{item}\b", clean):
                return item
        return None

    def parse_intent(self, query: str) -> ParsedFinancialIntent:
        """
        Classifies user query into one of the 5 MoneyLens modes and extracts parameters.
        """
        if not query or not query.strip():
            return ParsedFinancialIntent(
                intent=MoneyLensIntent.CLARIFICATION_NEEDED,
                raw_query="",
                is_ambiguous=True,
                clarification_question="Please tell me what financial decision or question you'd like to evaluate."
            )

        q = query.strip()
        lower = q.lower()

        amount = self.parse_indian_amount(q)
        timeline = self.parse_timeline_months(q)
        item = self.extract_item(q)

        # Payment method detection
        payment_method = None
        if re.search(r"\b(emi|loan|financed|installments?|monthly installments?)\b", lower):
            payment_method = "emi"
        elif re.search(r"\b(cash|lump\s*sum|upfront|savings?|one\s*time)\b", lower):
            payment_method = "cash"

        # -------------------------------------------------------------
        # 1. RADAR_ANALYSIS
        # Checks emergency fund, risks, warnings, alerts, upcoming problems, runway
        # -------------------------------------------------------------
        radar_patterns = [
            r"\b(emergency\s*fund|emergency\s*savings|runway|safety\s*cushion)\b",
            r"\b(risks?|problems?|alerts?|warnings?|financial\s*health|troubles?|danger)\b",
            r"\b(do i have enough|is my money safe|am i safe|cash\s*flow\s*health)\b",
            r"\b(coming\s*up|upcoming\s*risks|radar)\b"
        ]
        if any(re.search(p, lower) for p in radar_patterns) and not re.search(r"\b(save\s*for|reach|buy|purchase|compare)\b", lower):
            return ParsedFinancialIntent(
                intent=MoneyLensIntent.RADAR_ANALYSIS,
                raw_query=q,
                amount=amount,
                confidence_score=0.96,
                extracted_entities={"category": "risk_surveillance"}
            )

        # -------------------------------------------------------------
        # 2. EXPERIMENT_ANALYSIS
        # Multi-scenario comparison (vs, compare, wait vs buy, cash vs emi)
        # -------------------------------------------------------------
        experiment_patterns = [
            r"\b(compare|versus|vs\.?|which is better|difference between|option a|option b)\b",
            r"\b(buying\s*now\s*vs|now\s*versus\s*waiting|cash\s*vs\s*emi)\b",
            r"\b(scenario|alternative\s*paths?)\b"
        ]
        if any(re.search(p, lower) for p in experiment_patterns):
            return ParsedFinancialIntent(
                intent=MoneyLensIntent.EXPERIMENT_ANALYSIS,
                raw_query=q,
                item=item,
                amount=amount,
                timeline_months=timeline,
                payment_method=payment_method,
                confidence_score=0.94,
                extracted_entities={"comparison": True}
            )

        # -------------------------------------------------------------
        # 3. REVERSE_ANALYSIS
        # Backward-propagation ("How much should I save every month?", "How much do I need to save monthly")
        # -------------------------------------------------------------
        reverse_patterns = [
            r"how\s*much\b.*(save|put\s*away).*(month|monthly|per\s*month)",
            r"how\s*much\s*monthly\s*(saving|savings|contribution|needed)",
            r"what\s*(should\s*my|is\s*the)\s*monthly\s*saving",
            r"monthly\s*savings?\s*needed\s*for",
            r"how\s*much\s*to\s*save\s*monthly"
        ]
        if any(re.search(p, lower) for p in reverse_patterns):
            return ParsedFinancialIntent(
                intent=MoneyLensIntent.REVERSE_ANALYSIS,
                raw_query=q,
                amount=amount,
                timeline_months=timeline or 12,
                item=item,
                goal_title=item or (f"Target ₹{amount:,.0f}" if amount else "Financial Target"),
                confidence_score=0.97,
                extracted_entities={"target_amount": amount, "target_months": timeline or 12}
            )

        # -------------------------------------------------------------
        # 4. GOAL_ANALYSIS
        # Forward goal tracking ("I want to save 5 lakh in 1 year", "add a goal of saving 10000 in 2 months")
        # -------------------------------------------------------------
        goal_patterns = [
            r"\b(add|create|set|make|start|track|new)\b.*\bgoal\b",
            r"\bgoal\b",
            r"\bi\s*(want|need|plan|aim|wish)\s*to\s*save\b",
            r"\bcan\s*i\s*(reach|achieve|save|hit)\b",
            r"\bsav(e|ing)\s*(for|to|of|towards|\d+)\b",
            r"\btarget\s*(of|amount|corpus|for)\b",
            r"\baccumulate\b",
        ]
        if any(re.search(p, lower) for p in goal_patterns):
            resolved_title = item.title() if item else (f"Savings Goal (₹{amount:,.0f})" if amount else "Savings Goal")
            return ParsedFinancialIntent(
                intent=MoneyLensIntent.GOAL_ANALYSIS,
                raw_query=q,
                amount=amount,
                timeline_months=timeline or 12,
                item=item,
                goal_title=resolved_title,
                confidence_score=0.95,
                extracted_entities={"target_amount": amount, "target_months": timeline or 12}
            )

        # -------------------------------------------------------------
        # 5. TIME_MACHINE
        # Purchase, expense, decision simulation ("I want to buy a 6 lakh car", "What if I spend ₹70k")
        # -------------------------------------------------------------
        time_machine_patterns = [
            r"\b(buy|purchase|spend|get|afford|cost|buying|order)\b",
            r"\bwhat\s*(happens|if)\s*(i|we)\s*(buy|spend|purchase|get)\b",
            r"\bcan\s*i\s*afford\b",
            r"\bwhat\s*if\s*i\b",
            r"\bsimulat(e|ion)\b",
            r"\b(car|phone|laptop|house|iphone|bike|trip)\b"
        ]
        if any(re.search(p, lower) for p in time_machine_patterns) or (amount is not None and not timeline):
            return ParsedFinancialIntent(
                intent=MoneyLensIntent.TIME_MACHINE,
                raw_query=q,
                item=item or "Purchase",
                amount=amount,
                timeline_months=timeline or 12,
                payment_method=payment_method or ("emi" if "emi" in lower else "cash"),
                confidence_score=0.95,
                extracted_entities={
                    "purchase_amount": amount,
                    "item": item or "item",
                    "payment_method": payment_method or "cash"
                }
            )

        # -------------------------------------------------------------
        # Ambiguous / General Query
        # -------------------------------------------------------------
        return ParsedFinancialIntent(
            intent=MoneyLensIntent.CLARIFICATION_NEEDED,
            raw_query=q,
            amount=amount,
            timeline_months=timeline,
            item=item,
            is_ambiguous=True,
            confidence_score=0.50,
            clarification_question="Could you specify what you'd like to simulate? For example: 'I want to buy a 6 lakh car' or 'How much to save monthly for ₹5 lakh in 1 year?'"
        )


intent_service = IntentService()

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional


@dataclass
class FAQItem:
    question: str
    answer: str
    keywords: List[str]


FAQ_DATABASE: List[FAQItem] = [
    FAQItem(
        question="What are your hours of operation?",
        answer=(
            "Most Dobbs locations are open Monday through Saturday, roughly 7AM to 6PM. "
            "Hours may vary by location. For specific hours at your nearest location, "
            "please contact them directly."
        ),
        keywords=["hours", "open", "close", "schedule", "time", "when"],
    ),
    FAQItem(
        question="What tire brands do you carry?",
        answer=(
            "Dobbs carries all major tire brands including Michelin, Goodyear, Bridgestone, "
            "Firestone, Continental, Pirelli, Cooper Tire, BF Goodrich, Sumitomo, Kelly Tires, "
            "and Crosswind. We have over 40 locations and can make it happen if you're looking "
            "for a specific brand!"
        ),
        keywords=[
            "tire",
            "brand",
            "michelin",
            "goodyear",
            "bridgestone",
            "firestone",
            "continental",
            "pirelli",
            "cooper",
            "carry",
        ],
    ),
    FAQItem(
        question="What services do you offer?",
        answer=(
            "Dobbs Tire & Auto Centers provides comprehensive auto services including tire sales "
            "and installation, oil changes, brake service, wheel alignments, battery replacement, "
            "and general auto repair. Our ASE-certified technicians handle everything from routine "
            "maintenance to complex diagnostic repairs."
        ),
        keywords=["service", "offer", "do", "provide", "repair", "maintenance"],
    ),
    FAQItem(
        question="How many locations do you have?",
        answer=(
            "Dobbs has over 50 convenient locations throughout the St. Louis area, including Ballwin, "
            "Chesterfield, Clayton, Fenton, Florissant, Kirkwood, Maryland Heights, O'Fallon, "
            "St. Charles, St. Peters, and many more."
        ),
        keywords=["location", "where", "near", "address", "find", "close"],
    ),
    FAQItem(
        question="Do you offer free tire inspections?",
        answer=(
            "Yes! Dobbs offers free tire inspections at all our locations. We'll check your tire tread "
            "depth, air pressure, and overall condition to help you stay safe on the road."
        ),
        keywords=["free", "inspection", "check", "tire", "tread"],
    ),
    FAQItem(
        question="What is your price-match guarantee?",
        answer=(
            "Dobbs will match any advertised sale price from a local store or dealer stocking the same "
            "new tire. Even after your purchase, if you find a lower price within 30 days (including our "
            "own sale prices), we'll refund 100% of the difference plus one dollar. This guarantee does "
            "not apply to bonus offers, installation, rebates, limited quantity offers, internet offers, "
            "or club membership outlets."
        ),
        keywords=["price", "match", "guarantee", "beat", "lowest", "cheap", "cost"],
    ),
    FAQItem(
        question="How do I schedule an appointment?",
        answer=(
            "You can schedule an appointment online at any of our 52 store locations, or I can help you "
            "collect your information right now and have our team contact you to confirm. Appointments "
            "are not booked directly through this chat, but we'll make sure someone follows up with you quickly."
        ),
        keywords=["appointment", "schedule", "book", "reserve", "when"],
    ),
    FAQItem(
        question="Do you offer oil change services?",
        answer=(
            "Yes, Dobbs provides professional oil change services using quality products. Prices vary by "
            "vehicle type and oil grade. We recommend regular oil changes to keep your engine running smoothly."
        ),
        keywords=["oil", "change", "lube", "synthetic", "conventional"],
    ),
    FAQItem(
        question="What brake services do you provide?",
        answer=(
            "Dobbs offers complete brake services including inspection, brake pad replacement, rotor "
            "resurfacing or replacement, brake fluid flush, and full brake system repairs. Our technicians "
            "use quality parts and ensure your vehicle's braking system is safe and reliable."
        ),
        keywords=["brake", "pad", "rotor", "stop", "squeaking", "grinding"],
    ),
    FAQItem(
        question="Do you do wheel alignments?",
        answer=(
            "Yes, we offer professional wheel alignment services to ensure proper tire wear and vehicle handling. "
            "Signs you may need an alignment include uneven tire wear, your vehicle pulling to one side, or a "
            "crooked steering wheel when driving straight."
        ),
        keywords=["alignment", "wheel", "pull", "pulling", "crooked", "steering"],
    ),
    FAQItem(
        question="Can you replace my car battery?",
        answer=(
            "Absolutely! Dobbs provides battery testing and replacement services. We carry quality batteries for "
            "all vehicle types. If your car is slow to start or you're experiencing electrical issues, bring it "
            "in for a free battery test."
        ),
        keywords=["battery", "dead", "start", "electrical", "alternator", "charge"],
    ),
    FAQItem(
        question="Do you work on all vehicle types?",
        answer=(
            "Yes! Whether you drive a new car, used car, domestic vehicle, or import - car, light truck, or SUV - "
            "our ASE-certified technicians can handle your service needs."
        ),
        keywords=["vehicle", "car", "truck", "suv", "import", "domestic", "type"],
    ),
    FAQItem(
        question="How long has Dobbs been in business?",
        answer=(
            "Dobbs Tire & Auto Centers is a family-operated business that has been serving the St. Louis area since "
            "1976. That's nearly 50 years of expert auto service!"
        ),
        keywords=["history", "family", "long", "years", "business", "established", "since"],
    ),
    FAQItem(
        question="Do you offer any specials or coupons?",
        answer=(
            "Yes, Dobbs regularly offers specials and promotions on various services. Visit our website at "
            "gotodobbs.com/specials to see current offers, or ask about available discounts when you call your local store."
        ),
        keywords=["special", "coupon", "deal", "discount", "promotion", "save", "offer"],
    ),
    FAQItem(
        question="What if I need a tire size I'm not sure about?",
        answer=(
            "No problem! I can help you figure out what tire size you need. Your tire size is printed on the sidewall "
            "of your current tires. It will look something like 'P215/65R15'. You can also find it on a sticker inside "
            "your driver's door jamb or in your owner's manual. What's your tire size, and I can help check availability."
        ),
        keywords=["tire size", "size", "what tire", "which tire", "sidewall", "need"],
    ),
]


def search_faq(query: str, threshold: float = 0.3) -> Optional[FAQItem]:
    """Return the best FAQ match for the provided query or None."""

    lower_query = query.lower()
    best_match: Optional[tuple[FAQItem, float]] = None

    for faq in FAQ_DATABASE:
        score = 0.0
        for keyword in faq.keywords:
            if keyword.lower() in lower_query:
                score += 1

        query_words = lower_query.split()
        for word in query_words:
            if len(word) <= 3:
                continue

            for keyword in faq.keywords:
                keyword_lower = keyword.lower()
                if keyword_lower in word or word in keyword_lower:
                    score += 0.5

        normalized = score / max(len(query_words), 1)
        if normalized > threshold and (best_match is None or normalized > best_match[1]):
            best_match = (faq, normalized)

    return best_match[0] if best_match else None


def detect_scheduling_intent(query: str) -> bool:
    scheduling_keywords = [
        "appointment",
        "schedule",
        "book",
        "reserve",
        "set up",
        "make an appointment",
        "need an appointment",
        "want to schedule",
    ]
    lower_query = query.lower()
    return any(keyword in lower_query for keyword in scheduling_keywords)


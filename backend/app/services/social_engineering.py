import re
from typing import List, Dict, Tuple
from ..models.email_models import SocialEngineeringIntel

CUES_LEXICON = {
    "urgency": [
        (r'\b(?:urgent|immediately|within\s+24\s+hours|4\s+hours|asap|today|before\s+\d+|right\s+now|at\s+once|critical\s+timeline)\b', 3),
        (r'\b(?:promptly|expire|expiration|overdue|deadline|hurry)\b', 2)
    ],
    "authority": [
        (r'\b(?:director\s+general|board\s+of\s+directors|ceo|cfo|compliance|regulatory|rbi|aicte|legal\s+notice)\b', 3),
        (r'\b(?:official|management|corporate\s+secretariat|security\s+team|administrator|headquarters)\b', 2)
    ],
    "fear": [
        (r'\b(?:freeze|frozen|permanently\s+terminated|account\s+restricted|legal\s+action|suspension|breach|unauthorized)\b', 3),
        (r'\b(?:penalty|violation|risk|loss|compromised|investigation)\b', 2)
    ],
    "credential": [
        (r'\b(?:verify\s+your\s+identity|re-kyc|confirm\s+password|login\s+now|validate\s+credentials|sso\s+password)\b', 3),
        (r'\b(?:credentials|security\s+token|secret\s+key|access\s+code|passphrase)\b', 2)
    ],
    "payment": [
        (r'\b(?:wire\s+transfer|rtgs|neft|bank\s+account|deposit|inr\s+[\d,]+|usd\s+[\d,]+|invoice\s*#)\b', 3),
        (r'\b(?:remit|clearance|payment|beneficiary|remittance|earnest\s+money)\b', 2)
    ]
}

def analyze_social_engineering(text: str) -> SocialEngineeringIntel:
    text_lower = text.lower()
    scores = {"urgency": 0, "authority": 0, "fear": 0, "credential": 0, "payment": 0}
    cues_found = []

    for category, pattern_list in CUES_LEXICON.items():
        cat_score = 0
        for pattern, weight in pattern_list:
            matches = re.findall(pattern, text_lower)
            if matches:
                cat_score += len(matches) * weight
                for m in matches[:2]:
                    cue_str = f"[{category.upper()}] '{m}' detected"
                    if cue_str not in cues_found:
                        cues_found.append(cue_str)
        # Cap score between 0 and 10
        scores[category] = min(round(cat_score * 1.5), 10)

    return SocialEngineeringIntel(
        urgency=scores["urgency"],
        authority=scores["authority"],
        fear=scores["fear"],
        credential=scores["credential"],
        payment=scores["payment"],
        extracted_cues=cues_found[:6]
    )

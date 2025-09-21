"""
Utility functions for GlobalMedTriage backend
- PII redaction for HIPAA/GDPR compliance
"""
import re

def redact_pii(text: str) -> str:
    """Redact emails, phone numbers, and names (mock)."""
    text = re.sub(r"[\w\.-]+@[\w\.-]+", "[REDACTED_EMAIL]", text)
    text = re.sub(r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b", "[REDACTED_PHONE]", text)
    # Add more rules as needed
    return text

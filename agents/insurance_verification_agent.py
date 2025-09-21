"""
Insurance Verification Agent
- Integrates with Crossmint API for payments/coverage
- Exposes async functions for backend orchestrator
"""
import os
import httpx

CROSSMINT_API_KEY = os.getenv("CROSSMINT_API_KEY", "demo")

async def verify_insurance(user_id: str) -> dict:
    """Verify insurance/payment via Crossmint API."""
    url = "https://api.crossmint.com/v1/insurance/verify"
    headers = {
        "Authorization": f"Bearer {CROSSMINT_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {"user_id": user_id}
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return {
            "verified": data.get("verified", False),
            "provider": data.get("provider", "Unknown")
        }

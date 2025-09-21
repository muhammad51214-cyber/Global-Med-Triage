from fastapi import FastAPI
import requests
import os

app = FastAPI()

CROSSMINT_API_KEY = os.getenv("CROSSMINT_API_KEY")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/pay")
def make_payment(amount: float, recipient: str):
    headers = {
        "Authorization": f"Bearer {CROSSMINT_API_KEY}",
        "Content-Type": "application/json"
    }
    # Example Crossmint endpoint (adjust based on docs)
    url = "https://staging.crossmint.com/api/payments"
    payload = {
        "amount": amount,
        "recipient": recipient,
    }
    r = requests.post(url, json=payload, headers=headers)
    return r.json()

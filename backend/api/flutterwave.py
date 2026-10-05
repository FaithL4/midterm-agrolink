import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

# Flutterwave sandbox credentials (Visa / Mastercard)
FLW_CLIENT_ID = '5b6a84de-745e-4f60-bc5c-373aa6199374'
FLW_SECRET_KEY = 'bldZaTvioSpF8tmXsYXRlYNkVP3qUXrc' # Used as Bearer Auth Token
FLW_ENCRYPTION_KEY = 'wdpEzCi9l3Q+dwf3SRSAv5V3LjhCRc1OXYw35EpALNk='

def initiate_card_payment(amount, order_id, email, name, phone, redirect_url):
    """
    Initializes a Flutterwave card payment link (Standard Checkout V3)
    """
    url = "https://api.flutterwave.com/v3/payments"
    headers = {
        "Authorization": f"Bearer {FLW_SECRET_KEY}",
        "Content-Type": "application/json"
    }

    # Ensure amount is integer or float
    float_amount = float(amount)
    
    payload = {
        "tx_ref": f"AGR-FLW-{order_id}",
        "amount": float_amount,
        "currency": "KES",
        "redirect_url": redirect_url,
        "payment_options": "card",
        "customer": {
            "email": email or "buyer@agrolink.co.ke",
            "phonenumber": phone or "254712345678",
            "name": name or "AgroLink Buyer"
        },
        "customizations": {
            "title": "AgroLink Produce Checkout",
            "description": f"Payment for Order #{order_id}",
            "logo": "https://agrolink.co.ke/logo.png"
        }
    }

    try:
        logger.info(f"Initiating Flutterwave card payment link for Order #{order_id} (Amount: KES {float_amount})")
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        # Sandbox API returns JSON with redirect link in data.link
        return response.json()
    except Exception as e:
        logger.error(f"Error during Flutterwave checkout invocation: {e}")
        return {"status": "error", "message": str(e)}

def verify_flutterwave_transaction(transaction_id):
    """
    Verifies transaction status directly from Flutterwave API
    """
    url = f"https://api.flutterwave.com/v3/transactions/{transaction_id}/verify"
    headers = {
        "Authorization": f"Bearer {FLW_SECRET_KEY}",
        "Content-Type": "application/json"
    }

    try:
        logger.info(f"Verifying Flutterwave Transaction: {transaction_id}")
        response = requests.get(url, headers=headers, timeout=15)
        return response.json()
    except Exception as e:
        logger.error(f"Error verifying Flutterwave transaction {transaction_id}: {e}")
        return None

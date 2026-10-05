import requests
import base64
from datetime import datetime
import logging
import random
import string
from django.conf import settings

logger = logging.getLogger(__name__)

# Safaricom Daraja API Sandbox Credentials
CONSUMER_KEY = getattr(settings, 'MPESA_CONSUMER_KEY', 'FS08SEO3XYXwGakBtK9sUNAp0EtlINm9MsRPIztyxSqjGdfG')
CONSUMER_SECRET = getattr(settings, 'MPESA_CONSUMER_SECRET', 'dSZpN9KU2C5IA5Abm8y0G7mk0xglb4HWUWe4kQLgdC7rhEKy276I2IGLYFj6f2UG')
BUSINESS_SHORT_CODE = '174379'
PASSKEY = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'

def format_phone_number(phone):
    """
    Formats phone numbers to the Safaricom compliant format: 2547XXXXXXXX or 2541XXXXXXXX
    """
    clean_phone = ''.join(filter(str.isdigit, str(phone)))
    if clean_phone.startswith('0'):
        clean_phone = '254' + clean_phone[1:]
    elif clean_phone.startswith('+'):
        clean_phone = clean_phone[1:]
    elif not clean_phone.startswith('254'):
        clean_phone = '254' + clean_phone
    return clean_phone

def get_access_token():
    """
    Generates OAuth Access Token from Safaricom Daraja API
    """
    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    try:
        credentials = f"{CONSUMER_KEY}:{CONSUMER_SECRET}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        headers = {"Authorization": f"Basic {encoded_credentials}"}
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        token = response.json().get('access_token')
        return token
    except Exception as e:
        logger.error(f"Error generating Safaricom access token: {e}")
        return None

def initiate_stk_push(phone, amount, order_id, callback_url):
    """
    Sends STK Push prompt (Lipa Na M-Pesa Online) to user's phone
    """
    formatted_phone = format_phone_number(phone)
    token = get_access_token()
    if not token:
        return {"error": "Failed to authenticate with Safaricom Daraja API"}

    url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    password_str = BUSINESS_SHORT_CODE + PASSKEY + timestamp
    password = base64.b64encode(password_str.encode()).decode()
    
    # Ensure amount is integer for sandbox compatibility
    int_amount = int(float(amount))
    if int_amount <= 0:
        int_amount = 1

    payload = {
        "BusinessShortCode": BUSINESS_SHORT_CODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int_amount,
        "PartyA": formatted_phone,
        "PartyB": BUSINESS_SHORT_CODE,
        "PhoneNumber": formatted_phone,
        "CallBackURL": callback_url,
        "AccountReference": f"ORD{order_id}",
        "TransactionDesc": f"Payment for Order {order_id}"
    }

    try:
        logger.info(f"Initiating Safaricom STK Push to {formatted_phone} for KES {int_amount}")
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        return response.json()
    except Exception as e:
        logger.error(f"Error during Safaricom STK Push invocation: {e}")
        return {"error": str(e)}

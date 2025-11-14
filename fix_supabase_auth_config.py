#!/usr/bin/env python3
import requests
import json
import os

# Supabase credentials
SUPABASE_PROJECT_ID = "poadoavnqqtdkqnpszaw"
SUPABASE_URL = f"https://{SUPABASE_PROJECT_ID}.supabase.co"
ACCESS_TOKEN = "sbp_oauth_3f94f99c5b863e9821351813fef821036637a3c4"

# Get current auth config
print("Fetching current auth configuration...")
url = f"https://api.supabase.com/v1/projects/{SUPABASE_PROJECT_ID}/config/auth"
headers = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)
print(f"Status: {response.status_code}")

if response.status_code == 200:
    config = response.json()
    print("\nCurrent Configuration:")
    print(f"  Email confirm: {config.get('MAILER_AUTOCONFIRM', 'N/A')}")
    print(f"  Email provider: {config.get('EXTERNAL_EMAIL_ENABLED', 'N/A')}")
    print(f"  Secure email change: {config.get('SECURITY_REFRESH_TOKEN_REUSE_INTERVAL', 'N/A')}")
    
    # Update config to disable email confirmation
    print("\nUpdating auth configuration to disable email confirmation...")
    update_data = {
        "MAILER_AUTOCONFIRM": True  # Auto-confirm emails (no email verification needed)
    }
    
    update_response = requests.patch(url, headers=headers, json=update_data)
    print(f"Update Status: {update_response.status_code}")
    
    if update_response.status_code == 200:
        print("Successfully updated auth configuration!")
        print("Email confirmation is now disabled - users can sign in immediately after signup.")
    else:
        print(f"Error updating config: {update_response.text}")
else:
    print(f"Error: {response.text}")


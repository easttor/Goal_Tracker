#!/usr/bin/env python3
import requests
import json

SUPABASE_PROJECT_ID = "poadoavnqqtdkqnpszaw"
ACCESS_TOKEN = "sbp_oauth_3f94f99c5b863e9821351813fef821036637a3c4"

print("Checking current auth configuration...")
url = f"https://api.supabase.com/v1/projects/{SUPABASE_PROJECT_ID}/config/auth"
headers = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)

if response.status_code == 200:
    config = response.json()
    print("\nKey Settings:")
    print(f"  mailer_autoconfirm: {config.get('mailer_autoconfirm')}")
    print(f"  mailer_allow_unverified_email_sign_ins: {config.get('mailer_allow_unverified_email_sign_ins')}")
    print(f"  disable_signup: {config.get('disable_signup')}")
    print(f"  external_email_enabled: {config.get('external_email_enabled')}")
else:
    print(f"Error: {response.status_code}")

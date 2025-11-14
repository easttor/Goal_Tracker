#!/usr/bin/env python3
import requests
import json

SUPABASE_PROJECT_ID = "poadoavnqqtdkqnpszaw"
ACCESS_TOKEN = "sbp_oauth_3f94f99c5b863e9821351813fef821036637a3c4"

print("Updating auth configuration...")
url = f"https://api.supabase.com/v1/projects/{SUPABASE_PROJECT_ID}/config/auth"
headers = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json"
}

# Update config to allow unverified email sign-ins
update_data = {
    "MAILER_AUTOCONFIRM": True,  # Auto-confirm emails
    "MAILER_ALLOW_UNVERIFIED_EMAIL_SIGN_INS": True  # Allow sign-in without confirmation
}

response = requests.patch(url, headers=headers, json=update_data)
print(f"Status: {response.status_code}")

if response.status_code == 200:
    print("Successfully updated auth configuration!")
    print("Settings applied:")
    print("  - Email auto-confirm: Enabled")
    print("  - Allow unverified sign-ins: Enabled")
    print("\nUsers can now sign in immediately after signup without email verification.")
else:
    print(f"Error: {response.text}")

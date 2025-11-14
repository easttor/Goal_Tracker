#!/usr/bin/env python3
import requests
import json

SUPABASE_URL = "https://poadoavnqqtdkqnpszaw.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvYWRvYXZucXF0ZGtxbnBzemF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMTM1NTgsImV4cCI6MjA3NzY4OTU1OH0.3nZZjRvIsGm2twqkSHP0UN8kCjgLpy5FYo7mBCLUoag"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvYWRvYXZucXF0ZGtxbnBzemF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjExMzU1OCwiZXhwIjoyMDc3Njg5NTU4fQ.WdwVY6z_8Nz-wL_XqU474Wj0KRkIQZmnEY0-GF5A-BA"

def test_signup(email, password):
    """Test signup flow"""
    url = f"{SUPABASE_URL}/auth/v1/signup"
    headers = {
        "apikey": ANON_KEY,
        "Content-Type": "application/json"
    }
    data = {
        "email": email,
        "password": password
    }
    
    print(f"\n[TEST] Signup with {email}")
    response = requests.post(url, headers=headers, json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response

def test_signin(email, password):
    """Test signin flow"""
    url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    headers = {
        "apikey": ANON_KEY,
        "Content-Type": "application/json"
    }
    data = {
        "email": email,
        "password": password
    }
    
    print(f"\n[TEST] Signin with {email}")
    response = requests.post(url, headers=headers, json=data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Success! User ID: {result.get('user', {}).get('id')}")
        print(f"Session exists: {bool(result.get('access_token'))}")
    else:
        print(f"Error: {json.dumps(response.json(), indent=2)}")
    return response

def test_health():
    """Test auth service health"""
    url = f"{SUPABASE_URL}/auth/v1/health"
    headers = {"apikey": ANON_KEY}
    
    print("\n[TEST] Auth Health Check")
    response = requests.get(url, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response

def main():
    print("=" * 60)
    print("SUPABASE AUTHENTICATION TESTS")
    print("=" * 60)
    
    # Test 1: Health check
    test_health()
    
    # Test 2: Demo account signup/signin
    demo_email = "demo@goalsapp.com"
    demo_password = "demo123456"
    
    # Try signin first
    signin_resp = test_signin(demo_email, demo_password)
    
    # If signin fails, try signup
    if signin_resp.status_code != 200:
        signup_resp = test_signup(demo_email, demo_password)
        if signup_resp.status_code in [200, 201]:
            # Try signin again after signup
            test_signin(demo_email, demo_password)
    
    # Test 3: New user signup
    import time
    test_email = f"test{int(time.time())}@example.com"
    test_password = "test123456"
    
    signup_resp = test_signup(test_email, test_password)
    
    # Test 4: Try signin with new user
    if signup_resp.status_code in [200, 201]:
        test_signin(test_email, test_password)
    
    print("\n" + "=" * 60)
    print("TESTS COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    main()

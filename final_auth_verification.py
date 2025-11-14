#!/usr/bin/env python3
"""
Final Comprehensive Test for Fixed Goals Tracker App
Tests all authentication flows including auto-confirm functionality.
"""
import requests
import json
import time

SUPABASE_URL = "https://poadoavnqqtdkqnpszaw.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvYWRvYXZucXF0ZGtxbnBzemF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMTM1NTgsImV4cCI6MjA3NzY4OTU1OH0.3nZZjRvIsGm2twqkSHP0UN8kCjgLpy5FYo7mBCLUoag"
DEPLOYMENT_URL = "https://mc1m4uj4xoyc.space.minimax.io"

def print_header(title):
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)

def test_demo_login():
    """Test 1: Demo Account Login"""
    print_header("TEST 1: Demo Account Login")
    
    url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    headers = {
        "apikey": ANON_KEY,
        "Content-Type": "application/json"
    }
    data = {
        "email": "demo@goalsapp.com",
        "password": "demo123456"
    }
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 200:
        result = response.json()
        print("  Result: PASS")
        print(f"  - Successfully logged in as demo user")
        print(f"  - User ID: {result.get('user', {}).get('id')}")
        print(f"  - Session active: Yes")
        return True, result.get('access_token'), result.get('user', {}).get('id')
    else:
        print("  Result: FAIL")
        print(f"  - Error: {response.json()}")
        return False, None, None

def test_new_user_signup_and_signin():
    """Test 2: New User Sign Up and Immediate Sign In"""
    print_header("TEST 2: New User Sign Up and Immediate Sign In")
    
    test_email = f"newuser{int(time.time())}@gmail.com"
    test_password = "secure123456"
    
    # Step 1: Sign up
    print(f"\n  Step 1: Creating account for {test_email}")
    signup_url = f"{SUPABASE_URL}/auth/v1/signup"
    headers = {
        "apikey": ANON_KEY,
        "Content-Type": "application/json"
    }
    signup_data = {
        "email": test_email,
        "password": test_password
    }
    
    signup_response = requests.post(signup_url, headers=headers, json=signup_data)
    
    if signup_response.status_code not in [200, 201]:
        print(f"  - Sign up failed: {signup_response.json()}")
        return False
    
    signup_result = signup_response.json()
    user_id = signup_result.get('user', {}).get('id')
    print(f"  - Account created successfully")
    print(f"  - User ID: {user_id}")
    
    # Step 2: Auto-confirm via edge function
    print(f"\n  Step 2: Auto-confirming email via edge function")
    confirm_url = f"{SUPABASE_URL}/functions/v1/auto-confirm-user"
    confirm_headers = {
        "apikey": ANON_KEY,
        "Content-Type": "application/json",
        "Authorization": f"Bearer {ANON_KEY}"
    }
    confirm_data = {
        "user_id": user_id
    }
    
    confirm_response = requests.post(confirm_url, headers=confirm_headers, json=confirm_data)
    
    if confirm_response.status_code == 200:
        print(f"  - Email auto-confirmed successfully")
    else:
        print(f"  - Warning: Auto-confirm returned {confirm_response.status_code}")
        print(f"  - Response: {confirm_response.text}")
    
    # Step 3: Sign in immediately
    print(f"\n  Step 3: Signing in with new account")
    time.sleep(2)  # Wait a bit for confirmation to propagate
    
    signin_url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    signin_data = {
        "email": test_email,
        "password": test_password
    }
    
    signin_response = requests.post(signin_url, headers=headers, json=signin_data)
    
    if signin_response.status_code == 200:
        print("  Result: PASS")
        print(f"  - Successfully signed in immediately after signup")
        print(f"  - No email confirmation required")
        return True
    else:
        print("  Result: FAIL")
        print(f"  - Sign in error: {signin_response.json()}")
        return False

def test_deployment_accessibility():
    """Test 3: Deployment Accessibility"""
    print_header("TEST 3: Deployment Accessibility")
    
    try:
        response = requests.get(DEPLOYMENT_URL, timeout=10)
        if response.status_code == 200:
            print("  Result: PASS")
            print(f"  - Website is accessible at {DEPLOYMENT_URL}")
            print(f"  - HTTP Status: 200 OK")
            return True
        else:
            print("  Result: FAIL")
            print(f"  - HTTP Status: {response.status_code}")
            return False
    except Exception as e:
        print("  Result: FAIL")
        print(f"  - Error: {str(e)}")
        return False

def main():
    print("\n" + "*" * 80)
    print("*" + " " * 78 + "*")
    print("*" + "   GOALS TRACKER APP - FINAL AUTHENTICATION FIX VERIFICATION".center(78) + "*")
    print("*" + " " * 78 + "*")
    print("*" * 80)
    
    results = {}
    
    # Test 1: Demo account
    results['demo_login'], access_token, user_id = test_demo_login()
    
    # Test 2: New user signup and immediate signin
    results['new_user_flow'] = test_new_user_signup_and_signin()
    
    # Test 3: Deployment accessibility
    results['deployment'] = test_deployment_accessibility()
    
    # Final Summary
    print_header("FINAL TEST SUMMARY")
    print("\n  Test Results:")
    print(f"    1. Demo Account Login:                {'PASS' if results.get('demo_login') else 'FAIL'}")
    print(f"    2. New User Sign Up & Sign In:        {'PASS' if results.get('new_user_flow') else 'FAIL'}")
    print(f"    3. Deployment Accessibility:          {'PASS' if results.get('deployment') else 'FAIL'}")
    
    all_passed = all(results.values())
    
    print(f"\n  Overall Status: {'ALL TESTS PASSED' if all_passed else 'SOME TESTS FAILED'}")
    
    print("\n" + "=" * 80)
    print("\n  DEPLOYMENT INFORMATION:")
    print(f"    Production URL: {DEPLOYMENT_URL}")
    print(f"\n  AUTHENTICATION STATUS:")
    print(f"    Demo Account: Ready to use")
    print(f"    Sign Up: {'Working' if results.get('new_user_flow') else 'Needs attention'}")
    print(f"    Sign In: {'Working' if results.get('new_user_flow') else 'Needs attention'}")
    print("\n  DEMO ACCOUNT CREDENTIALS:")
    print("    Email: demo@goalsapp.com")
    print("    Password: demo123456")
    print("\n" + "=" * 80 + "\n")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

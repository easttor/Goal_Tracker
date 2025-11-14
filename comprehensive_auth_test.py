#!/usr/bin/env python3
"""
Comprehensive Authentication Testing for Goals Tracker App
Tests demo account, sign up with real email domains, and sign in flows.
"""
import requests
import json
import time

SUPABASE_URL = "https://poadoavnqqtdkqnpszaw.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvYWRvYXZucXF0ZGtxbnBzemF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMTM1NTgsImV4cCI6MjA3NzY4OTU1OH0.3nZZjRvIsGm2twqkSHP0UN8kCjgLpy5FYo7mBCLUoag"

def print_section(title):
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)

def test_demo_account():
    """Test demo account login"""
    print_section("TEST 1: Demo Account Login")
    
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
        user_id = result.get('user', {}).get('id')
        has_session = bool(result.get('access_token'))
        print(f"  Status: SUCCESS")
        print(f"  User ID: {user_id}")
        print(f"  Session: {'Active' if has_session else 'None'}")
        print(f"  Email confirmed: {result.get('user', {}).get('email_confirmed_at') is not None}")
        return True, user_id
    else:
        print(f"  Status: FAILED")
        print(f"  Error: {response.json()}")
        return False, None

def test_signup_with_real_domain():
    """Test signup with a real email domain"""
    print_section("TEST 2: Sign Up with Real Email Domain")
    
    # Use a real domain that should pass validation
    test_email = f"testuser{int(time.time())}@gmail.com"
    test_password = "secure123456"
    
    url = f"{SUPABASE_URL}/auth/v1/signup"
    headers = {
        "apikey": ANON_KEY,
        "Content-Type": "application/json"
    }
    data = {
        "email": test_email,
        "password": test_password
    }
    
    print(f"  Creating account: {test_email}")
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code in [200, 201]:
        result = response.json()
        user_id = result.get('user', {}).get('id')
        has_session = bool(result.get('session'))
        print(f"  Status: SUCCESS")
        print(f"  User ID: {user_id}")
        print(f"  Session: {'Created' if has_session else 'None'}")
        print(f"  Email: {test_email}")
        print(f"  Email confirmed: {result.get('user', {}).get('email_confirmed_at') is not None}")
        return True, test_email, test_password, user_id
    else:
        print(f"  Status: FAILED")
        print(f"  Error: {response.json()}")
        return False, test_email, test_password, None

def test_signin_with_new_account(email, password):
    """Test signin with newly created account"""
    print_section("TEST 3: Sign In with New Account")
    
    url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    headers = {
        "apikey": ANON_KEY,
        "Content-Type": "application/json"
    }
    data = {
        "email": email,
        "password": password
    }
    
    print(f"  Signing in as: {email}")
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 200:
        result = response.json()
        user_id = result.get('user', {}).get('id')
        print(f"  Status: SUCCESS")
        print(f"  User ID: {user_id}")
        print(f"  Session: Active")
        return True
    else:
        print(f"  Status: FAILED")
        print(f"  Error: {response.json()}")
        return False

def test_goals_crud(access_token, user_id):
    """Test goals CRUD operations"""
    print_section("TEST 4: Goals CRUD Operations")
    
    headers = {
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # Create a goal
    print("\n  4a. Creating a test goal...")
    goal_data = {
        "user_id": user_id,
        "title": "Test Goal",
        "description": "Testing CRUD operations",
        "icon": "Target",
        "color": "blue",
        "image_url": "",
        "deadline": "2025-12-31",
        "tasks": []
    }
    
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/goals",
        headers=headers,
        json=goal_data
    )
    
    if response.status_code in [200, 201]:
        print(f"      Status: SUCCESS")
        
        # Read goals
        print("\n  4b. Reading goals...")
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/goals?user_id=eq.{user_id}",
            headers=headers
        )
        
        if response.status_code == 200:
            goals = response.json()
            print(f"      Status: SUCCESS")
            print(f"      Goals found: {len(goals)}")
            return True
        else:
            print(f"      Status: FAILED - {response.status_code}")
            return False
    else:
        print(f"      Status: FAILED - {response.status_code}")
        print(f"      Error: {response.text}")
        return False

def main():
    print("\n" + "*" * 70)
    print("*" + " " * 68 + "*")
    print("*" + "  GOALS TRACKER APP - COMPREHENSIVE AUTHENTICATION TEST".center(68) + "*")
    print("*" + " " * 68 + "*")
    print("*" * 70)
    
    results = {
        "demo_login": False,
        "signup": False,
        "signin": False,
        "crud": False
    }
    
    # Test 1: Demo account
    demo_success, demo_user_id = test_demo_account()
    results["demo_login"] = demo_success
    
    # Test 2: Sign up
    signup_success, email, password, user_id = test_signup_with_real_domain()
    results["signup"] = signup_success
    
    # Test 3: Sign in
    if signup_success:
        signin_success = test_signin_with_new_account(email, password)
        results["signin"] = signin_success
        
        # Test 4: CRUD operations (using demo account since it has confirmed email)
        if demo_success:
            # Get a fresh token for demo account
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
                access_token = response.json().get('access_token')
                crud_success = test_goals_crud(access_token, demo_user_id)
                results["crud"] = crud_success
    
    # Final report
    print_section("FINAL TEST REPORT")
    print(f"\n  Demo Account Login:        {'PASS' if results['demo_login'] else 'FAIL'}")
    print(f"  New User Sign Up:          {'PASS' if results['signup'] else 'FAIL'}")
    print(f"  New User Sign In:          {'PASS' if results['signin'] else 'FAIL'}")
    print(f"  Goals CRUD Operations:     {'PASS' if results['crud'] else 'FAIL'}")
    
    all_passed = all(results.values())
    print(f"\n  Overall Status:            {'ALL TESTS PASSED' if all_passed else 'SOME TESTS FAILED'}")
    
    print("\n" + "=" * 70)
    print("\n  DEPLOYMENT URL: https://qdfizkumoiq9.space.minimax.io")
    print("\n  Demo Account Credentials:")
    print("    Email: demo@goalsapp.com")
    print("    Password: demo123456")
    print("\n" + "=" * 70 + "\n")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

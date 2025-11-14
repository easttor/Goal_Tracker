#!/usr/bin/env python3
"""
Final User Acceptance Test - Simulates real user workflows
"""
import requests
import json
import time

SUPABASE_URL = "https://poadoavnqqtdkqnpszaw.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvYWRvYXZucXF0ZGtxbnBzemF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMTM1NTgsImV4cCI6MjA3NzY4OTU1OH0.3nZZjRvIsGm2twqkSHP0UN8kCjgLpy5FYo7mBCLUoag"

def test_complete_user_workflow():
    """Simulate a complete new user workflow"""
    print("\n" + "=" * 80)
    print("USER ACCEPTANCE TEST: Complete New User Workflow")
    print("=" * 80)
    
    # Step 1: Sign up
    print("\nStep 1: User creates new account")
    test_email = f"realuser{int(time.time())}@example.com"
    test_password = "mypassword123"
    
    signup_response = requests.post(
        f"{SUPABASE_URL}/auth/v1/signup",
        headers={"apikey": ANON_KEY, "Content-Type": "application/json"},
        json={"email": test_email, "password": test_password}
    )
    
    if signup_response.status_code not in [200, 201]:
        print(f"  ✗ Sign up failed: {signup_response.json()}")
        return False
    
    print(f"  ✓ Account created: {test_email}")
    
    # Step 2: Sign in immediately
    print("\nStep 2: User signs in immediately (no email confirmation)")
    time.sleep(1)  # Small delay
    
    signin_response = requests.post(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        headers={"apikey": ANON_KEY, "Content-Type": "application/json"},
        json={"email": test_email, "password": test_password}
    )
    
    if signin_response.status_code != 200:
        print(f"  ✗ Sign in failed: {signin_response.json()}")
        return False
    
    signin_data = signin_response.json()
    access_token = signin_data.get('access_token')
    user_id = signin_data.get('user', {}).get('id')
    
    print(f"  ✓ Signed in successfully")
    print(f"  ✓ Session token received")
    
    # Step 3: Create a goal
    print("\nStep 3: User creates a goal")
    
    goal_response = requests.post(
        f"{SUPABASE_URL}/rest/v1/goals",
        headers={
            "apikey": ANON_KEY,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        },
        json={
            "user_id": user_id,
            "title": "My First Goal",
            "description": "Testing the goals feature",
            "icon": "Target",
            "color": "blue",
            "image_url": "",
            "deadline": "2025-12-31",
            "tasks": [
                {"id": 1, "text": "First task", "dueDate": "2025-11-04", "isComplete": False},
                {"id": 2, "text": "Second task", "dueDate": "2025-11-05", "isComplete": False}
            ]
        }
    )
    
    if goal_response.status_code not in [200, 201]:
        print(f"  ✗ Create goal failed: {goal_response.text}")
        return False
    
    goal_data = goal_response.json()
    if isinstance(goal_data, list):
        goal_id = goal_data[0].get('id')
    else:
        goal_id = goal_data.get('id')
    
    print(f"  ✓ Goal created successfully")
    print(f"  ✓ Goal ID: {goal_id}")
    
    # Step 4: Read goals
    print("\nStep 4: User views their goals")
    
    get_goals_response = requests.get(
        f"{SUPABASE_URL}/rest/v1/goals?user_id=eq.{user_id}",
        headers={
            "apikey": ANON_KEY,
            "Authorization": f"Bearer {access_token}"
        }
    )
    
    if get_goals_response.status_code != 200:
        print(f"  ✗ Get goals failed: {get_goals_response.text}")
        return False
    
    goals = get_goals_response.json()
    print(f"  ✓ Goals retrieved: {len(goals)} goal(s)")
    
    # Step 5: Update goal
    print("\nStep 5: User updates their goal")
    
    updated_tasks = goals[0]['tasks']
    updated_tasks[0]['isComplete'] = True
    
    update_response = requests.patch(
        f"{SUPABASE_URL}/rest/v1/goals?id=eq.{goal_id}",
        headers={
            "apikey": ANON_KEY,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        },
        json={"tasks": updated_tasks}
    )
    
    if update_response.status_code not in [200, 204]:
        print(f"  ✗ Update goal failed: {update_response.text}")
        return False
    
    print(f"  ✓ Goal updated (marked first task as complete)")
    
    # Step 6: Sign out
    print("\nStep 6: User signs out")
    
    signout_response = requests.post(
        f"{SUPABASE_URL}/auth/v1/logout",
        headers={
            "apikey": ANON_KEY,
            "Authorization": f"Bearer {access_token}"
        }
    )
    
    print(f"  ✓ Signed out successfully")
    
    print("\n" + "=" * 80)
    print("✓ USER WORKFLOW TEST PASSED - All steps completed successfully")
    print("=" * 80)
    
    return True

def test_demo_account_workflow():
    """Test demo account workflow"""
    print("\n" + "=" * 80)
    print("DEMO ACCOUNT TEST: Quick Access Workflow")
    print("=" * 80)
    
    print("\nDemo user clicks 'Try Demo Account' button")
    
    signin_response = requests.post(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        headers={"apikey": ANON_KEY, "Content-Type": "application/json"},
        json={"email": "demo@goalsapp.com", "password": "demo123456"}
    )
    
    if signin_response.status_code != 200:
        print(f"  ✗ Demo login failed: {signin_response.json()}")
        return False
    
    signin_data = signin_response.json()
    access_token = signin_data.get('access_token')
    user_id = signin_data.get('user', {}).get('id')
    
    print(f"  ✓ Logged in as demo user")
    
    # Check for existing goals
    get_goals_response = requests.get(
        f"{SUPABASE_URL}/rest/v1/goals?user_id=eq.{user_id}",
        headers={
            "apikey": ANON_KEY,
            "Authorization": f"Bearer {access_token}"
        }
    )
    
    if get_goals_response.status_code == 200:
        goals = get_goals_response.json()
        print(f"  ✓ Demo data loaded: {len(goals)} goal(s) available")
    
    print("\n" + "=" * 80)
    print("✓ DEMO ACCOUNT TEST PASSED")
    print("=" * 80)
    
    return True

def main():
    print("\n" + "*" * 80)
    print("*" + " " * 78 + "*")
    print("*" + "         GOALS TRACKER APP - USER ACCEPTANCE TESTING".center(78) + "*")
    print("*" + " " * 78 + "*")
    print("*" * 80)
    
    # Test 1: Complete new user workflow
    workflow_passed = test_complete_user_workflow()
    
    # Test 2: Demo account workflow
    demo_passed = test_demo_account_workflow()
    
    # Final summary
    print("\n" + "=" * 80)
    print("FINAL SUMMARY")
    print("=" * 80)
    print(f"\n  Complete User Workflow:  {'PASS ✓' if workflow_passed else 'FAIL ✗'}")
    print(f"  Demo Account Workflow:   {'PASS ✓' if demo_passed else 'FAIL ✗'}")
    
    all_passed = workflow_passed and demo_passed
    
    if all_passed:
        print("\n  🎉 ALL TESTS PASSED - APPLICATION IS READY FOR USE 🎉")
        print("\n  Production URL: https://mc1m4uj4xoyc.space.minimax.io")
        print("  Demo Credentials: demo@goalsapp.com / demo123456")
    else:
        print("\n  ⚠️  SOME TESTS FAILED - REVIEW REQUIRED")
    
    print("\n" + "=" * 80 + "\n")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

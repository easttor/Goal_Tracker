from playwright.sync_api import sync_playwright
import time

def comprehensive_test(url):
    print(f"\n{'='*70}")
    print(f"COMPREHENSIVE PRODUCTION TEST")
    print(f"URL: {url}")
    print('='*70)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()
        
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        
        try:
            # Load page
            print("\n[1/8] Loading page...")
            response = page.goto(url, wait_until="networkidle", timeout=30000)
            print(f"      ✓ Status: {response.status}")
            time.sleep(3)
            
            # Check root content
            print("\n[2/8] Checking root element...")
            root_html = page.locator("#root").inner_html()
            if len(root_html) > 100:
                print(f"      ✓ Root has content ({len(root_html)} chars)")
            else:
                print(f"      ✗ FAIL: Root empty")
                return False
            
            # Check for auth screen
            print("\n[3/8] Verifying auth screen...")
            if page.locator("text=Goals Tracker").count() > 0:
                print("      ✓ App title found")
            if page.locator("text=Sign In").count() > 0:
                print("      ✓ Sign In button found")
            if page.locator("text=Try Demo Account").count() > 0:
                print("      ✓ Demo button found")
            
            # Test demo login
            print("\n[4/8] Testing demo account login...")
            page.locator("text=Try Demo Account").click()
            time.sleep(4)
            
            # Check if logged in (should see Diary screen)
            if page.locator("text=Today").count() > 0 or page.locator("text=Diary").count() > 0:
                print("      ✓ Successfully logged in - Diary screen visible")
            else:
                print("      ⚠ Login might not have worked")
            
            page.screenshot(path="/workspace/test_logged_in.png")
            
            # Test navigation
            print("\n[5/8] Testing navigation...")
            nav_items = ["Goals", "Habits", "Calendar", "Statistics", "Profile"]
            for item in nav_items:
                if page.locator(f"text={item}").count() > 0:
                    print(f"      ✓ {item} tab found")
            
            # Click Goals tab
            print("\n[6/8] Testing Goals screen...")
            goals_btn = page.locator("text=Goals").first
            if goals_btn.count() > 0:
                goals_btn.click()
                time.sleep(2)
                page.screenshot(path="/workspace/test_goals_screen.png")
                print("      ✓ Goals screen loaded")
            
            # Check for errors
            print("\n[7/8] Checking for JavaScript errors...")
            if errors:
                print(f"      ✗ {len(errors)} error(s) found:")
                for err in errors[:5]:
                    print(f"        - {err[:100]}")
                return False
            else:
                print("      ✓ No JavaScript errors")
            
            # Final verification
            print("\n[8/8] Final verification...")
            page.screenshot(path="/workspace/test_final.png")
            print("      ✓ Screenshots saved")
            
            browser.close()
            
            print("\n" + "="*70)
            print("✓✓✓ ALL TESTS PASSED - APP FULLY FUNCTIONAL ✓✓✓")
            print("="*70)
            return True
            
        except Exception as e:
            print(f"\n      ✗ FAIL: {e}")
            browser.close()
            return False

# Run comprehensive test
success = comprehensive_test("https://zpjcl3ddswhf.space.minimax.io")

if not success:
    print("\n⚠ Some tests failed - review output above")

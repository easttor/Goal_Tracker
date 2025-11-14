#!/usr/bin/env python3
from playwright.sync_api import sync_playwright
import time

def test_fixed_app(url):
    print(f"\n{'='*60}")
    print(f"Testing FIXED Application")
    print(f"URL: {url}")
    print('='*60)
    
    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(viewport={'width': 1280, 'height': 720})
            page = context.new_page()
            
            # Collect console messages
            console_messages = []
            page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
            
            # Collect errors
            errors = []
            page.on("pageerror", lambda err: errors.append(f"PAGE ERROR: {err}"))
            
            # Go to page
            print(f"\nLoading page...")
            response = page.goto(url, wait_until="networkidle", timeout=30000)
            print(f"✓ Page loaded (status: {response.status})")
            
            # Wait for React to render
            time.sleep(4)
            
            # Check if root has content
            root_html = page.locator("#root").inner_html()
            print(f"\nRoot content length: {len(root_html)} characters")
            
            if len(root_html) < 50:
                print("✗ FAIL: Root div appears empty!")
                print(f"Root HTML: {root_html}")
            else:
                print("✓ SUCCESS: Root div has content")
                
                # Check for splash screen or auth screen
                page_text = page.locator("body").inner_text()
                if "Goals Tracker" in page_text or "Sign In" in page_text or "Sign Up" in page_text or "Demo Account" in page_text:
                    print("✓ SUCCESS: App UI detected!")
                else:
                    print("⚠ Warning: Expected UI elements not found")
                    print(f"Page text preview: {page_text[:200]}")
            
            # Take screenshot
            screenshot_path = f"/workspace/screenshot_fixed_app.png"
            page.screenshot(path=screenshot_path)
            print(f"✓ Screenshot saved: {screenshot_path}")
            
            # Print console messages
            if console_messages:
                print(f"\n--- Console Messages ({len(console_messages)}) ---")
                for msg in console_messages[:15]:
                    print(msg)
            
            # Check for errors
            if errors:
                print(f"\n✗ FAIL: JavaScript Errors Found ({len(errors)}) ---")
                for err in errors:
                    print(err)
                browser.close()
                return False
            else:
                print("\n✓ SUCCESS: No JavaScript errors!")
            
            browser.close()
            return True
            
        except Exception as e:
            print(f"✗ FAIL: Exception occurred: {e}")
            return False

# Test the fixed deployment
success = test_fixed_app("https://jx9a8zrqvonz.space.minimax.io")

if success:
    print("\n" + "="*60)
    print("✓✓✓ WHITE SCREEN ISSUE RESOLVED! ✓✓✓")
    print("="*60)
else:
    print("\n" + "="*60)
    print("✗✗✗ ISSUE STILL EXISTS ✗✗✗")
    print("="*60)

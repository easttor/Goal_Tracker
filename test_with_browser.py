#!/usr/bin/env python3
from playwright.sync_api import sync_playwright
import time

def test_page_with_browser(url, name):
    print(f"\n{'='*60}")
    print(f"Testing: {name}")
    print(f"URL: {url}")
    print('='*60)
    
    with sync_playwright() as p:
        try:
            # Launch browser
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
            
            # Wait a bit for React to render
            time.sleep(3)
            
            # Check if root has content
            root_html = page.locator("#root").inner_html()
            print(f"\nRoot content length: {len(root_html)} characters")
            
            if len(root_html) < 50:
                print("✗ WARNING: Root div appears empty or minimal!")
                print(f"Root HTML: {root_html[:200]}")
            else:
                print("✓ Root div has content")
                # Check for specific content
                if "Goals Tracker" in root_html or "goal" in root_html.lower():
                    print("✓ App content detected")
                else:
                    print("⚠ App content might not be loaded properly")
            
            # Take screenshot
            screenshot_path = f"/workspace/screenshot_{name.replace(' ', '_')}.png"
            page.screenshot(path=screenshot_path)
            print(f"✓ Screenshot saved: {screenshot_path}")
            
            # Print console messages
            if console_messages:
                print(f"\n--- Console Messages ({len(console_messages)}) ---")
                for msg in console_messages[:20]:  # First 20
                    print(msg)
                if len(console_messages) > 20:
                    print(f"... and {len(console_messages) - 20} more messages")
            
            # Print errors
            if errors:
                print(f"\n--- JavaScript Errors ({len(errors)}) ---")
                for err in errors:
                    print(err)
            else:
                print("\n✓ No JavaScript errors detected")
            
            browser.close()
            return True
            
        except Exception as e:
            print(f"✗ Failed to test page: {e}")
            return False

# Test the deployments
test_cases = [
    ("https://god7aypl3xkb.space.minimax.io", "Minimal_React"),
    ("https://jecpj8btabxn.space.minimax.io", "Full_App_No_StrictMode"),
]

for url, name in test_cases:
    test_page_with_browser(url, name)

print("\n" + "="*60)
print("Testing complete. Check screenshots for visual confirmation.")
print("="*60)

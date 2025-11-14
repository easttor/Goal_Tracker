from playwright.sync_api import sync_playwright
import time

url = "https://y38vikvimtz1.space.minimax.io"
print(f"Testing: {url}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 720})
    
    errors = []
    page.on("pageerror", lambda err: errors.append(str(err)))
    
    page.goto(url, wait_until="networkidle", timeout=30000)
    time.sleep(4)
    
    root_html = page.locator("#root").inner_html()
    
    print(f"\nRoot content: {len(root_html)} chars")
    print(f"Errors: {len(errors)}")
    
    if errors:
        print("\nERRORS FOUND:")
        for err in errors:
            print(f"  - {err}")
    else:
        print("\n✓ NO ERRORS!")
    
    if len(root_html) > 100:
        print("✓ CONTENT EXISTS!")
    else:
        print("✗ NO CONTENT")
    
    page.screenshot(path="/workspace/test_fixed.png")
    browser.close()

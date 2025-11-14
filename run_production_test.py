from playwright.sync_api import sync_playwright
import time

url = "https://0g2y5s10e6ur.space.minimax.io"
print(f"Testing Production: {url}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 720})
    
    errors = []
    page.on("pageerror", lambda err: errors.append(str(err)))
    
    print("[1] Loading...")
    page.goto(url, wait_until="networkidle", timeout=30000)
    time.sleep(3)
    
    root = page.locator("#root").inner_html()
    print(f"[2] Root: {len(root)} chars")
    
    if page.locator("text=Goals Tracker").count() > 0:
        print("[3] ✓ Title found")
    
    if page.locator("text=Try Demo Account").count() > 0:
        print("[4] ✓ Demo button found")
        page.locator("text=Try Demo Account").click()
        time.sleep(4)
    
    if page.locator("text=Today").count() > 0:
        print("[5] ✓ Login successful")
    
    if page.locator("text=Goals").count() > 0:
        print("[6] ✓ Navigation found")
    
    print(f"[7] Errors: {len(errors)}")
    
    page.screenshot(path="/workspace/production_test.png")
    print("[8] ✓ Screenshot saved")
    
    browser.close()

print("\nTest complete!")

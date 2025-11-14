#!/usr/bin/env python3
import urllib.request
import json

def test_deployment(url):
    print(f"\nTesting: {url}")
    print("=" * 60)
    
    try:
        # Test HTML page
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8')
            print(f"✓ HTML loaded: {len(html)} bytes")
            print(f"  Status: {response.status}")
            
            # Check for key elements
            if '<div id="root">' in html:
                print("✓ Root div found")
            else:
                print("✗ Root div NOT found")
            
            # Extract JS file path
            import re
            js_match = re.search(r'src="(/assets/[^"]+\.js)"', html)
            if js_match:
                js_path = js_match.group(1)
                print(f"✓ JS file reference: {js_path}")
                
                # Test JS file
                js_url = url.rstrip('/') + js_path
                js_req = urllib.request.Request(js_url, headers={'User-Agent': 'Mozilla/5.0'})
                try:
                    with urllib.request.urlopen(js_req, timeout=10) as js_response:
                        js_content = js_response.read().decode('utf-8')
                        print(f"✓ JS file loaded: {len(js_content)} bytes")
                        
                        # Check for Supabase URL in JS
                        if 'poadoavnqqtdkqnpszaw' in js_content:
                            print("✓ Supabase URL embedded in JS")
                        else:
                            print("✗ Supabase URL NOT found in JS")
                            
                except Exception as e:
                    print(f"✗ Failed to load JS: {e}")
            else:
                print("✗ No JS file reference found in HTML")
            
            # Extract CSS file path
            css_match = re.search(r'href="(/assets/[^"]+\.css)"', html)
            if css_match:
                css_path = css_match.group(1)
                print(f"✓ CSS file reference: {css_path}")
                
                # Test CSS file
                css_url = url.rstrip('/') + css_path
                css_req = urllib.request.Request(css_url, headers={'User-Agent': 'Mozilla/5.0'})
                try:
                    with urllib.request.urlopen(css_req, timeout=10) as css_response:
                        print(f"✓ CSS file loaded: {len(css_response.read())} bytes")
                except Exception as e:
                    print(f"✗ Failed to load CSS: {e}")
            
    except Exception as e:
        print(f"✗ Failed to load page: {e}")

# Test all deployed versions
urls = [
    "https://god7aypl3xkb.space.minimax.io",  # Minimal
    "https://jecpj8btabxn.space.minimax.io",  # No StrictMode
    "https://p1ygh23c8w9l.space.minimax.io",  # Debug logging
]

for url in urls:
    test_deployment(url)

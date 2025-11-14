import urllib.request
import urllib.error

url = 'https://p1ygh23c8w9l.space.minimax.io'
try:
    with urllib.request.urlopen(url, timeout=10) as response:
        html = response.read().decode('utf-8')
        print("HTTP Status:", response.status)
        print("Content Length:", len(html))
        print("\nFirst 500 chars:")
        print(html[:500])
except urllib.error.URLError as e:
    print("Error:", e)
except Exception as e:
    print("Exception:", e)

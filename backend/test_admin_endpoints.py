import urllib.request
import json

paths = [
    "/",
    "/api/v1/admin/dashboard/school-001",
    "/api/v1/admin/oversight/school-001",
    "/api/v1/admin/dashboard/school-999",
]

for p in paths:
    try:
        r = urllib.request.urlopen("http://127.0.0.1:8000" + p)
        d = json.loads(r.read())
        label = d.get("school_name") or d.get("status") or list(d.keys())[:5]
        print(r.status, p, "|", label)
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, p, "-", e.read().decode()[:80])
    except Exception as e:
        print("FAIL", p, e)

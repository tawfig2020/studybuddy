import urllib.request
import json

BASE = "https://ynfqluadxtmxrssddhof.supabase.co/auth/v1"
KEY = "sb_publishable_BlbyXfX14ypfkb7q0Fr3rw_acJBAzGo"
EMAIL = "studybuddy.test.student@gmail.com"
PASSWORD = "TestPass123!"


def call(method, path, data=None, token=None):
    req = urllib.request.Request(
        f"{BASE}{path}",
        data=json.dumps(data).encode() if data else None,
        headers={
            "apikey": KEY,
            "Content-Type": "application/json",
            **({"Authorization": f"Bearer {token}"} if token else {}),
        },
        method=method,
    )
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read().decode() or "null")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode() or "null")


# 1. Settings (confirms anon key is accepted)
s, d = call("GET", "/settings")
print(f"[{s}] settings  - email auth enabled: {d.get('email') if d else '-'}")

# 2. Signup
s, d = call("POST", "/signup", {
    "email": EMAIL, "password": PASSWORD,
    "data": {"full_name": "Test Student"},
})
uid = (d or {}).get("id") or (d or {}).get("user", {}).get("id")
print(f"[{s}] signup    - user id: {uid or d}")

# 3. Signin
s, d = call("POST", "/token?grant_type=password", {
    "email": EMAIL, "password": PASSWORD,
})
token = (d or {}).get("access_token")
print(f"[{s}] signin    - access_token: {'issued' if token else d}")

# 4. Get user with token
s, d = call("GET", "/user", token=token)
print(f"[{s}] get user  - email: {(d or {}).get('email', d)}")

# 5. Signout
s, d = call("POST", "/logout", data={}, token=token)
print(f"[{s}] signout   - session revoked: {s in (200, 204)}")

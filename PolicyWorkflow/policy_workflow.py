from fastapi import FastAPI, HTTPException, Body
import json
import os
import requests
from typing import Any, List
import time

app = FastAPI()

STATUS_FILE = os.path.join(os.path.dirname(__file__), "status.json")

@app.post("/health-check")
def health_check(body: dict = Body(..., description="Target to make a health check")):
    max_retries = 5
    sleep_seconds = 1
    errors = []
    for attempt in range(1, max_retries + 1):
        try:
            resp = requests.post(
                "http://localhost:8000/health",
                timeout=3
            )
            resp.raise_for_status()
            return {"status": "ok", "attempt": attempt}
        except Exception as e:
            errors.append(f"attempt {attempt}: {e}")
            if attempt < max_retries:
                time.sleep(sleep_seconds)
                # exponential backoff (1,2,4,8...)
                sleep_seconds *= 2
            else:
                # All attempts failed
                raise HTTPException(
                    status_code=502,
                    detail={
                        "status": "unreachable",
                        "attempts": max_retries,
                        "errors": errors
                    }
                )

def _deep_match(expected: Any, actual: Any, path: str = "") -> List[str]:
    errs = []
    if isinstance(expected, dict):
        if not isinstance(actual, dict):
            errs.append(f"{path or '.'}: expected object, got {type(actual).__name__}")
            return errs
        for k, v in expected.items():
            if k not in actual:
                errs.append(f"{path + '.' if path else ''}{k}: missing key")
                continue
            errs.extend(_deep_match(v, actual[k], f"{path + '.' if path else ''}{k}"))
    elif isinstance(expected, list):
        if not isinstance(actual, list):
            errs.append(f"{path}: expected list, got {type(actual).__name__}")
            return errs
        if len(expected) > len(actual):
            errs.append(f"{path}: expected at least {len(expected)} items, got {len(actual)}")
            return errs
        for i, item in enumerate(expected):
            errs.extend(_deep_match(item, actual[i], f"{path}[{i}]"))
    else:
        if expected != actual:
            errs.append(f"{path}: expected {expected!r}, got {actual!r}")
    return errs

@app.post("/check-update")
def update_possible(body: dict = Body(..., description="Subset of required status fields")):
    expected = body.get("conditions")

    if not os.path.exists(STATUS_FILE):
        raise HTTPException(status_code=500, detail="Status file not found")
    try:
        with open(STATUS_FILE, "r") as f:
            actual = json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read status file: {e}")

    errors = _deep_match(expected, actual)
    if errors:
        raise HTTPException(status_code=400, detail={"match": False, "errors": errors})
    
    popup_res = requests.get(
      "http://localhost:8086/pop-up"    
    )

    if popup_res.status_code == 200:
        return 200
    else:
        return popup_res
    
@app.post("/update")
def update(body: dict = Body(..., description="Target to be published to the symphony api")):
    try:
        target = body.get("target")

        SYMPHONY_API_URL = "http://localhost:8082/v1alpha2/"
        auth_resp = requests.post(
            f"{SYMPHONY_API_URL}users/auth",
            headers={"Content-Type": "application/json"},
            json={"username": "admin", "password": ""}
        )
        auth_resp.raise_for_status()
        token = auth_resp.json().get("accessToken")

        target_res = requests.post(
            f"{SYMPHONY_API_URL}targets/registry/ankaios-target",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json=target
        )
        target_res.raise_for_status()

        return 200
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

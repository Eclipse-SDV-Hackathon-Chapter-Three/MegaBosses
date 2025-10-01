from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import json
import os
import time
import threading
from datetime import datetime, timezone

app = FastAPI()

STATUS_FILE = os.path.join(os.path.dirname(__file__), "status.json")

# Simple mapper for raw workload state -> normalized status
def normalize_status(raw: str) -> str:
    r = raw.lower()
    if "running(ok" in r:
        return "healthy"
    if "running" in r:
        return "running"
    if "pending" in r or "starting" in r:
        return "starting"
    if "retry" in r or "failed" in r or "error" in r or "denied" in r or "unauthorized" in r:
        return "failed"
    return "unknown"

def load_base_status():
    if not os.path.isfile(STATUS_FILE):
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "vehicle_id": "UNKNOWN",
            "overall_status": "unknown"
        }
    with open(STATUS_FILE, "r") as f:
        return json.load(f)

def build_app_health():
    try:
        from ankaios_sdk import Ankaios  # local import so file still works if SDK missing
    except ImportError:
        return {
            "ankaios_connection": {
                "status": "failed",
                "detail": "ankaios_sdk not installed"
            }
        }
    try:
        with Ankaios() as ank:
            wl_states = ank.get_workload_states().get_as_dict()
            # Expecting structure like { workloadName: { state: "...", ... }, ... }
            result = {}
            now_iso = datetime.now(timezone.utc).isoformat()
            for name, data in wl_states.items():
                # Fallbacks
                raw_state = data.get("state") if isinstance(data, dict) else str(data)
                status_norm = normalize_status(raw_state)
                result[name] = {
                    "status": status_norm,
                    "raw_state": raw_state,
                    "last_check": now_iso
                }
            return result
    except Exception as e:
        return {
            "ankaios_query": {
                "status": "failed",
                "detail": str(e)
            }
        }

@app.get("/check-update")
def health_check():
    return 200

@app.get("/status")
def get_status(refresh: bool = True):
    base = load_base_status()
    # Always refresh Ankaios snapshot when endpoint called (can toggle with ?refresh=false)
    if refresh:
        apps = build_app_health()
        base["applications_health"] = apps
    base["timestamp"] = datetime.now(timezone.utc).isoformat()
    return base


# class Truck(BaseModel):
#     current_fuel: int
#     image: str
#     name: str

# #Store truck states
# fuel_pump_truck_states = {1: None, 2: None, 3: None}
# fuel_pump_threads = {1: None, 2: None, 3: None}
# fuel_pump_locks = {1: threading.Lock(), 2: threading.Lock(), 3: threading.Lock()}

# #Get pump number of truck by name
# def get_truck_pump(truck_name):
#     for pump in fuel_pump_truck_states:
#         if fuel_pump_truck_states[pump] is not None and fuel_pump_truck_states[pump].name == truck_name:
#             return pump
#     return -1

# #Get state of truck by name
# def get_truck_state(truck_name):
#     pump = get_truck_pump(truck_name)
#     if pump == -1:
#         return None
#     return fuel_pump_truck_states[pump]

# #Get next empty pump
# def get_empty_pump():
#     for pump in fuel_pump_truck_states:
#         if fuel_pump_truck_states[pump] is None:
#             return pump
#     return -1

# #Start filling fuel process
# def fill_fuel(pump: int):
#     if pump < 1 or pump > 3:
#         return -1
    
#     global fuel_pump_truck_states
#     if not pump in fuel_pump_truck_states or fuel_pump_truck_states[pump] is None:
#         return -1
    
#     with fuel_pump_locks[pump]:
#         while fuel_pump_truck_states[pump].current_fuel < 100:
#             fuel_pump_truck_states[pump].current_fuel += 1
#             time.sleep(0.2)        

# #Get current fuel level by name
# @app.post("/fuel")
# def get_fuel_state(request: dict):
#     state = get_truck_state(request["name"])
#     if state is None:
#         raise HTTPException(status_code=404, detail="Truck not found")
#     return state.current_fuel

# #Get truck data by pump id
# @app.get("/pump_truck")
# def get_fuel_state_by_id(pump: int):
#     if not pump in fuel_pump_truck_s/home/jorge/Documents/maestro/docker/fuel-pump/fuel-pump.py /home/jorge/Documents/maestro/docker/fuel-pump/dockerfile
# def update_dock_state(truck: Truck):
#     if truck.current_fuel < 0:
#         raise HTTPException(status_code=400, detail="Invalid fuel values")
#     pump = get_empty_pump()
#     if pump == -1:
#         raise HTTPException(status_code=400, detail="All pumps are full")
#     fuel_pump_truck_states[pump] = truck
#     return 200

# #Undock truck by name
# @app.post("/undock")
# def undock_truck(request: dict):
#     pump = get_truck_pump(request["name"])
#     if pump == -1:
#         raise HTTPException(status_code=404, detail="Truck not found")
#     fuel_pump_truck_states[pump] = None
#     return 200

# #Start the fueling process by pump id
# @app.post("/start_fueling")
# def start_fueling(pump: int):
#     if pump < 1 or pump > 3:
#         raise HTTPException(status_code=400, detail="Invalid pump number")
    
#     global fuel_pump_threads
#     if fuel_pump_threads[pump] is None or not fuel_pump_threads[pump].is_alive():
#         fuel_pump_threads[pump] = threading.Thread(target=fill_fuel, args=(pump,))
#         fuel_pump_threads[pump].start()
#     else:
#         raise HTTPException(status_code=400, detail="Fuel update already in progress")
#     return 200

# app.mount("/", StaticFiles(directory="static", html=True), name="static")
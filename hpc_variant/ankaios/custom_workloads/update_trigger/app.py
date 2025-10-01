# main.py
import asyncio
import uvicorn

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# Replace these imports with the real names from your SDK
from ankaios_sdk import Ankaios, WorkloadStateEnum, AnkaiosException

app = FastAPI()

# Serve static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

SYMPHONY_WORKLOAD_FIELD_MASK = "desiredState.workloads.symphony"
AGENT_NAME = "agent_A"

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


# WebSocket endpoint for trigger + push notifications
@app.websocket("/ws/trigger-update")
async def websocket_trigger(websocket: WebSocket):
    await websocket.accept()
    try:
        # 1) Apply workload in a background thread (blocking SDK calls)
        try:
            workload_instance_name = await asyncio.to_thread(_apply_workload_and_get_instance)
            instance_name_str = str(workload_instance_name)
        except AnkaiosException as e:
            # SDK-specific error
            await websocket.send_json({"status": "ERROR", "message": f"Ankaios error: {e}"})
            await websocket.close()
            return
        except Exception as e:
            await websocket.send_json({"status": "ERROR", "message": f"Apply error: {e}"})
            await websocket.close()
            return

        # Notify the client that the workload was triggered and provide instance name
        await websocket.send_json({"status": "TRIGGERED", "instance": instance_name_str})

        # 2) Wait for the workload to reach RUNNING in a thread (so we don't block the event loop)
        try:
            wait_result = await asyncio.to_thread(_wait_for_running, workload_instance_name, timeout_seconds=30)
        except Exception as e:
            # Unexpected errors while waiting
            await websocket.send_json({"status": "ERROR", "message": f"Waiting error: {e}"})
            await websocket.close()
            return

        if wait_result == "RUNNING":
            await websocket.send_json({"status": "RUNNING", "instance": instance_name_str})
        elif wait_result == "TIMEOUT":
            await websocket.send_json({"status": "TIMEOUT", "instance": instance_name_str})
        else:
            # any other return value treated as error
            await websocket.send_json({"status": "ERROR", "message": f"Unknown wait result: {wait_result}"})

        # Close politely
        await websocket.close()

    except WebSocketDisconnect:
        # client disconnected; nothing more to do here
        print("WebSocket client disconnected.")
    except Exception as e:
        # fallback send (may fail if socket closed)
        try:
            await websocket.send_json({"status": "ERROR", "message": f"Server error: {e}"})
            await websocket.close()
        except Exception:
            pass
        print("Unhandled websocket error:", e)


def _apply_workload_and_get_instance() -> str:
    """
    Blocking function run in a thread. Applies the symphony workload by setting the agent
    and returns the workload instance name created by apply_workload.
    Raises AnkaiosException or other exceptions on failure.
    """
    # All synchronous SDK operations must be performed in this thread
    with Ankaios() as ankaios:
        # Fetch the unscheduled symphony workload
        current_state = ankaios.get_state(field_masks=[SYMPHONY_WORKLOAD_FIELD_MASK])
        if current_state is None:
            raise RuntimeError("Failed to get state from Ankaios")

        unscheduled = current_state.get_workload("symphony")
        if unscheduled is None:
            raise RuntimeError("No 'symphony' workload found in current state")

        # Assign the agent so it will be scheduled
        unscheduled.update_agent_name(AGENT_NAME)

        # Apply the workload config (this is a blocking SDK call)
        update_response = ankaios.apply_workload(unscheduled)
        if not update_response or not getattr(update_response, "added_workloads", None):
            raise RuntimeError("apply_workload did not return added_workloads")

        workload_instance_name = update_response.added_workloads[0]
        print(f"Applied workload, instance: {workload_instance_name}")
        return workload_instance_name


def _wait_for_running(instance_name: str, timeout_seconds: int = 30) -> str:
    """
    Blocking function that waits until the named workload instance reaches RUNNING.
    Returns "RUNNING" or "TIMEOUT". May raise AnkaiosException on SDK errors.
    """
    with Ankaios() as ankaios:
        try:
            ankaios.wait_for_workload_to_reach_state(
                instance_name,
                state=WorkloadStateEnum.RUNNING,
                timeout=timeout_seconds,
            )
            print(f"Workload {instance_name} reached RUNNING")
            return "RUNNING"
        except TimeoutError:
            print(f"Workload {instance_name} did not reach RUNNING within {timeout_seconds}s")
            return "TIMEOUT"


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=5500)

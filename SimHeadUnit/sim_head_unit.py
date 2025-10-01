from fastapi import FastAPI, HTTPException, Body
from fastapi.responses import HTMLResponse
import threading

app = FastAPI()

# Confirmation state (single pending request model)
CONFIRM_LOCK = threading.Lock()
CONFIRM_STATE = {
    "pending": False,
    "event": threading.Event(),
    "result": None  # "accept" | "reject" | None
}

@app.get("/", response_class=HTMLResponse)
def root_page():
    return """
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>car_app</title>
<style>
  body{
    margin:0;
    background:#111;
    font-family:system-ui,Arial,sans-serif;
    color:#eee;
    display:flex;
    justify-content:center;
    align-items:center;
    min-height:100vh;
  }
  .radio{
    width:340px;
    background:#1c1f21;
    border:2px solid #2d3234;
    border-radius:20px;
    padding:18px 20px 26px;
    box-shadow:0 4px 14px rgba(0,0,0,0.55), inset 0 0 0 1px #24282a;
    position:relative;
  }
  .radio:before, .radio:after{
    content:"";
    position:absolute;
    top:50%;
    width:30px;
    height:30px;
    background:#2a2f31;
    border:2px solid #383f42;
    border-radius:50%;
    transform:translateY(-50%);
    box-shadow:inset 0 4px 8px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.5);
  }
  .radio:before{ left:-15px; }
  .radio:after{ right:-15px; }
  h1{
    margin:0 0 10px;
    font-size:14px;
    letter-spacing:3px;
    text-align:center;
    font-weight:600;
    color:#9bd3b4;
  }
  .screen{
    background:linear-gradient(#101314,#0b0d0e);
    border:1px solid #2c3234;
    border-radius:10px;
    height:70px;
    padding:10px 14px;
    font-family:"IBM Plex Mono", monospace;
    font-size:15px;
    display:flex;
    flex-direction:column;
    justify-content:center;
    gap:4px;
    box-shadow:inset 0 0 0 1px rgba(255,255,255,0.03), inset 0 -12px 20px -12px rgba(0,0,0,0.9);
  }
  .row{
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis;
    color:#89caa4;
  }
  .buttons{
    display:flex;
    gap:8px;
    margin-top:14px;
    flex-wrap:wrap;
    justify-content:center;
  }
  button{
    background:#262b2d;
    color:#ddd;
    border:1px solid #363c3f;
    padding:8px 14px;
    border-radius:6px;
    font-size:12px;
    letter-spacing:1px;
    cursor:pointer;
    font-weight:600;
    min-width:80px;
  }
  button:hover{
    background:#2f3638;
  }
  footer{
    margin-top:18px;
    text-align:center;
    font-size:10px;
    letter-spacing:1px;
    opacity:.45;
  }
  .hidden{ display:none; }
  .confirm-box{
    margin-top:14px;
    border:1px dashed #4d6;
    border-radius:10px;
    padding:10px;
    text-align:center;
    background:#18231a;
  }
</style>
</head>
<body>
<div class="radio">
  <h1>Head Unit</h1>
  <div class="screen">
    <div class="row" id="r1">Hello from the car_app</div>
    <div class="row" id="r2">Idle</div>
  </div>
  <div id="confirmBox" class="confirm-box hidden">
     <div style="margin-bottom:8px;">Proceed with update?</div>
     <div class="buttons" style="margin-top:4px;">
       <button id="acceptBtn" style="background:#245c34;border-color:#2f8d49;">ACCEPT</button>
       <button id="rejectBtn" style="background:#5a2323;border-color:#7d3434;">REJECT</button>
     </div>
  </div>
  <div class="buttons">
    <button>PREV</button>
    <button>NEXT</button>
    <button>SCAN</button>
    <button>MODE</button>
  </div>
  <footer>Test Cluster</footer>
</div>
<script>
let showingConfirm = false;

async function poll(){
  try{
    const r = await fetch('/confirm-status');
    const data = await r.json();
    if(data.pending && !showingConfirm){
       showingConfirm = true;
       document.getElementById('confirmBox').classList.remove('hidden');
       document.getElementById('r2').textContent = "Awaiting user decision";
    } else if(!data.pending && showingConfirm){
       showingConfirm = false;
       document.getElementById('confirmBox').classList.add('hidden');
       document.getElementById('r2').textContent = "Decision recorded";
    }
  }catch(e){
    document.getElementById('r2').textContent = "Connection error";
  }
  setTimeout(poll, 2000);
}

async function sendDecision(decision){
  try{
    const r = await fetch('/confirm', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({decision})
    });
    const data = await r.json();
    if(data.status === "accept"){
      document.getElementById('r2').textContent = "Update accepted";
    } else if(data.status === "reject"){
      document.getElementById('r2').textContent = "Update rejected";
    } else {
      document.getElementById('r2').textContent = "No pending update";
    }
  }catch(e){
    document.getElementById('r2').textContent = "Decision error";
  }
}

document.getElementById('acceptBtn').onclick = () => sendDecision("accept");
document.getElementById('rejectBtn').onclick = () => sendDecision("reject");

window.onload = () => {
  document.getElementById('r1').textContent = "Hello from the car_app";
  poll();
};
</script>
</body>
</html>
"""

@app.get("/pop-up")
def pop_up():
    # No errors: trigger confirmation workflow
    with CONFIRM_LOCK:
        # Reset state
        CONFIRM_STATE["pending"] = True
        CONFIRM_STATE["result"] = None
        CONFIRM_STATE["event"].clear()

    # Wait (blocking) for user decision via browser (timeout 60s)
    waited = CONFIRM_STATE["event"].wait(timeout=60)

    with CONFIRM_LOCK:
        if not waited or CONFIRM_STATE["result"] is None:
            # Timeout / no decision
            CONFIRM_STATE["pending"] = False
            raise HTTPException(status_code=408, detail="Confirmation timeout")
        if CONFIRM_STATE["result"] == "reject":
            raise HTTPException(status_code=400, detail="User rejected update")
        # accept
        CONFIRM_STATE["pending"] = False
        return {
            "status": "accept"
        }

@app.get("/health-check")
def health_check():
    return 200

@app.get("/confirm-status")
def confirm_status():
    with CONFIRM_LOCK:
        return {
            "pending": CONFIRM_STATE["pending"]
        }

@app.post("/confirm")
def confirm(decision: dict = Body(...)):
    d = decision.get("decision")
    if d not in ("accept", "reject"):
        raise HTTPException(status_code=400, detail="Invalid decision")
    with CONFIRM_LOCK:
        if not CONFIRM_STATE["pending"]:
            return {"status": "no_pending"}
        CONFIRM_STATE["result"] = d
        CONFIRM_STATE["event"].set()
        return {"status": d}

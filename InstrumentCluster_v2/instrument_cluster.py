from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()

@app.get("/health")
def health_check():
    return 400

@app.get("/", response_class=HTMLResponse)
def instrument_cluster():
    html_content = """
    <html>
        <head>
            <title>Instrument Cluster v2</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; background: #181c20; color: #e0e0e0; text-align: center; }
                .cluster { margin: 50px auto; width: 480px; background: #23272b; border-radius: 24px; padding: 36px 24px 24px 24px; box-shadow: 0 4px 24px #0008; }
                .gauges { display: flex; justify-content: space-around; margin: 30px 0 10px 0; }
                .gauge { width: 120px; height: 120px; border-radius: 50%; background: #222; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 2px 8px #0006; }
                .gauge-label { font-size: 18px; margin-bottom: 8px; color: #aaa; }
                .gauge-value { font-size: 36px; font-weight: bold; }
                .gauge-unit { font-size: 16px; color: #6cf; }
                .warning { color: #ff4444; font-weight: bold; margin-top: 18px; font-size: 20px; }
                .ok { color: #44ff44; font-weight: bold; margin-top: 18px; font-size: 20px; }
            </style>
        </head>
        <body>
            <div class="cluster">
                <h1>🚗 Instrument Cluster <span style="font-size:18px;color:#6cf;">v2</span></h1>
                <div class="gauges">
                    <div class="gauge">
                        <div class="gauge-label">Speed</div>
                        <div class="gauge-value">98</div>
                        <div class="gauge-unit">km/h</div>
                    </div>
                    <div class="gauge">
                        <div class="gauge-label">Fuel</div>
                        <div class="gauge-value">34</div>
                        <div class="gauge-unit">%</div>
                    </div>
                    <div class="gauge">
                        <div class="gauge-label">RPM</div>
                        <div class="gauge-value">3200</div>
                        <div class="gauge-unit">rpm</div>
                    </div>
                </div>
                <div class="warning">⚠️ Low Fuel! Please refuel soon.</div>
                <div class="ok">All systems: OK</div>
            </div>
        </body>
    </html>
    """
    return HTMLResponse(content=html_content, status_code=200)

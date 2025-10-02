from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()

@app.get("/health")
def health_check():
    return 200

@app.get("/", response_class=HTMLResponse)
def instrument_cluster():
    html_content = """
    <html>
        <head>
            <title>Instrument Cluster</title>
            <style>
                body { font-family: Arial, sans-serif; background: #222; color: #eee; text-align: center; }
                .cluster { margin: 50px auto; width: 400px; background: #333; border-radius: 20px; padding: 30px; }
                .speed { font-size: 48px; margin: 20px 0; }
                .fuel { font-size: 24px; margin: 10px 0; }
                .warning { color: #ff4444; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="cluster">
                <h1>🚗 Instrument Cluster</h1>
                <div class="speed">Speed: 72 km/h</div>
                <div class="fuel">Fuel: 58%</div>
                <div class="warning">No Warnings</div>
            </div>
        </body>
    </html>
    """
    return HTMLResponse(content=html_content, status_code=200)

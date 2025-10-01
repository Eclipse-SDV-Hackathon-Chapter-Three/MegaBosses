FROM python:3.9

WORKDIR /EmergencyBrake/
COPY ./requirements.txt /EmergencyBrake/requirements.txt
RUN pip install --no-cache-dir --break-system-packages -r ./requirements.txt
COPY ./emergency_brake.py /EmergencyBrake/app/main.py
WORKDIR /EmergencyBrake/app/
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
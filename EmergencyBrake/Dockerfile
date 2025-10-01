FROM python:3.9

WORKDIR /health_check/
COPY ./requirements.txt /health_check/requirements.txt
RUN pip install --no-cache-dir --break-system-packages -r ./requirements.txt
COPY ./health_check.py /health_check/app/main.py
WORKDIR /health_check/app/
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
FROM python:3.9

WORKDIR /InstrumentCluster/
COPY ./requirements.txt /InstrumentCluster/requirements.txt
RUN pip install --no-cache-dir --break-system-packages -r ./requirements.txt
COPY ./instrument_cluster.py /InstrumentCluster/app/main.py
WORKDIR /InstrumentCluster/app/
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
FROM python:3.9

WORKDIR /SimHeadUnit/
COPY ./requirements.txt /SimHeadUnit/requirements.txt
RUN pip install --no-cache-dir --break-system-packages -r ./requirements.txt
COPY ./sim_head_unit.py /SimHeadUnit/app/main.py
COPY ./status.json /SimHeadUnit/app/status.json
WORKDIR /SimHeadUnit/app/
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8086"]
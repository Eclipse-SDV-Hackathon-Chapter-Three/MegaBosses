FROM python:3.9

WORKDIR /PolicyWorkflow/
COPY ./requirements.txt /PolicyWorkflow/requirements.txt
RUN pip install --no-cache-dir --break-system-packages -r ./requirements.txt
COPY ./policy_workflow.py /PolicyWorkflow/app/main.py
COPY ./status.json /PolicyWorkflow/app/status.json
WORKDIR /PolicyWorkflow/app/
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8085"]
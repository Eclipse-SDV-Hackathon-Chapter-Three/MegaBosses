FROM python:3.9

WORKDIR /car_control/
COPY ./requirements.txt /car_control/requirements.txt
RUN pip install --no-cache-dir --break-system-packages -r ./requirements.txt
COPY ./car_control.py /car_control/app/main.py
WORKDIR /car_control/app/
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8085"]
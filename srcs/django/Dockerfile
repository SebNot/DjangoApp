FROM python:3.11
ENV PYTHONUNBUFFERED 1

WORKDIR /pong_backend

COPY requirements.txt ./
RUN pip install -r requirements.txt

RUN apt-get update && apt-get install -y postgresql-client

COPY pong_backend ./

CMD ["python", "pong_backend/manage.py", "runserver", "0.0.0.0:8000"]

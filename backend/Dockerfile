FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && \
    apt-get install -y --no-install-recommends libpq-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p staticfiles static

RUN DJANGO_SECRET_KEY=build-placeholder \
    DB_NAME=x DB_USER=x DB_PASSWORD=x DB_HOST=x \
    python manage.py collectstatic --noinput

EXPOSE 3000

CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:3000 --workers 2 --timeout 120"]

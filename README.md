# Certificate Portal

A full-stack web application for creating, managing, and distributing certificates in bulk. Upload a template image, define variable text fields (name, roll number, award, etc.), import recipient data via CSV, and generate personalized certificates as PNG or PDF.

All text rendering is performed server-side with Pillow, ensuring pixel-perfect consistency across devices and browsers.

## Tech Stack

| Layer    | Technologies                                                     |
| -------- | ---------------------------------------------------------------- |
| Backend  | Django 5.1, Django REST Framework, PostgreSQL, Pillow, ReportLab |
| Storage  | MinIO (via django-minio-storage)                                 |
| Frontend | React 18, TypeScript, Vite 5, Tailwind CSS 3, Radix UI           |
| Auth     | [ITC SSO](https://sso.tech-iitb.org)                                                   |


## Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL
- MinIO (or S3-compatible storage)

## Setup

### 1. Backend

```bash
cd backend

python3.11 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
```

Create `.env` from the example and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

| Variable                          | Description                             |
| --------------------------------- | --------------------------------------- |
| `DJANGO_SECRET_KEY`               | Django secret key                       |
| `DEBUG`                           | `True` for development                  |
| `ALLOWED_HOSTS`                   | Comma-separated hostnames               |
| `DB_NAME`                         | PostgreSQL database name                |
| `DB_USER`                         | PostgreSQL user                         |
| `DB_PASSWORD`                     | PostgreSQL password                     |
| `DB_HOST`                         | PostgreSQL host                         |
| `DB_PORT`                         | PostgreSQL port                         |
| `HOST_URL`                        | Public backend URL                      |
| `CORS_ALLOWED_ORIGINS`            | Comma-separated frontend origins        |
| `MINIO_STORAGE_ENDPOINT`          | MinIO host (e.g. `files.tech-iitb.org`) |
| `MINIO_STORAGE_ACCESS_KEY`        | MinIO access key                        |
| `MINIO_STORAGE_SECRET_KEY`        | MinIO secret key                        |
| `MINIO_STORAGE_MEDIA_BUCKET_NAME` | Bucket for uploaded files               |
| `MINIO_STORAGE_USE_HTTPS`         | `True` for production                   |

Run migrations and start the server:

```bash
python manage.py migrate
python manage.py runserver
```

### 2. Frontend

```bash
cd frontend

npm install
```

Create `.env`:

```
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_SSO_AUTH_URL=https://sso.tech-iitb.org
VITE_SSO_PROJECT_ID=<your-sso-project-id>
```

Start the dev server:

```bash
npm run dev
```

### 3. Local Development Services (Docker)

To run PostgreSQL and MinIO locally:

```bash
docker run -d --name certificate-pg \
  -e POSTGRES_PASSWORD=devpass \
  -p 5433:5432 \
  postgres:16

docker run -d --name certificate-minio \
  -p 9000:9000 -p 9001:9001 \
  minio/minio server /data --console-address ":9001"
```

Then set `DB_HOST=127.0.0.1`, `DB_PORT=5433`, `MINIO_STORAGE_ENDPOINT=127.0.0.1:9000` in the backend `.env`.

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system deps required for some Python packages (adjust as needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    libpq-dev \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Copy only dependency manifests first for better caching
COPY casemind-backend/requirements.txt ./requirements.txt
COPY casemind-backend/pyproject.toml ./pyproject.toml

# Upgrade pip and install Python deps. If you don't use requirements.txt,
# create one (e.g. `pip freeze > requirements.txt`) or adapt this Dockerfile
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt || true

# Copy application code
COPY casemind-backend/ /app/

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s CMD wget -qO- http://127.0.0.1:8000/ || exit 1

# Default command (override in your host/service settings as needed)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

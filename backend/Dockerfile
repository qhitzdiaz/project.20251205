FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    tesseract-ocr \
    tesseract-ocr-eng \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /app/uploads /app/storage /app/scanned_documents

# Expose ports (will be overridden by docker-compose)
EXPOSE 5010 5011 5012 5013

# Default command uses Gunicorn; overridden per service in docker-compose
ENV APP_MODULE=app:app
ENV APP_PORT=5010
CMD ["sh", "-c", "gunicorn -w 2 -b 0.0.0.0:${APP_PORT} ${APP_MODULE}"]

FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install lightweight CPU-only torch to keep image small and fast
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code and model weights
COPY . .

# Hugging Face uses port 7860 by default, other clouds use 5000 / $PORT
EXPOSE 7860 5000

ENV PORT=7860
ENV PYTHONUNBUFFERED=1

CMD ["gunicorn", "--bind", "0.0.0.0:7860", "app:app", "--workers", "1", "--threads", "4", "--timeout", "120"]

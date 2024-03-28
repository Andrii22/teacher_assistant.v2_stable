FROM python:3.10-slim

WORKDIR /root/teacher_assistant.v2

# Install system dependencies
RUN apt-get update && \
    apt-get install -y \
    tk-dev \
    libffi-dev \
    libssl-dev \
    pkg-config \
    libmariadb-dev-compat

COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt
    
COPY . .

EXPOSE 5000

CMD ["python", "run.py"]

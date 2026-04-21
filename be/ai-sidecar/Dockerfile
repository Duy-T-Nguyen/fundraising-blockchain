# Sử dụng Python Slim để giảm dung lượng image
FROM python:3.9-slim

# Cài đặt các thư viện hệ thống cần thiết cho torch và d3rlpy
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements và cài đặt trước để tận dụng cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code và model vào container
COPY . .

# Expose port 8000 cho Sidecar
EXPOSE 8000

# Chạy ứng dụng
CMD ["python", "main.py"]

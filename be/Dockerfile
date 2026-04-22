# Giai đoạn 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ code và build
COPY . .
RUN npm run build

# Giai đoạn 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Chỉ copy những thứ cần thiết từ builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expose port cho Backend
EXPOSE 1609

# Chạy ứng dụng ở chế độ production
CMD ["npm", "run", "start:prod"]

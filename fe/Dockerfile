# Stage 1: Build the application
FROM node:22-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN rm -f package-lock.json && npm install --include=optional

COPY . .
RUN npx vite build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the build output to the nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Add a custom nginx config to handle SPA routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# Multi-stage build for React frontend
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy application files
COPY . .

# Set build-time environment variables for API URLs
ARG REACT_APP_AUTH_API_URL=http://localhost:5010/api
ARG REACT_APP_MEDIA_API_URL=http://localhost:5011/api
ARG REACT_APP_CLOUD_API_URL=http://localhost:5012/api
ARG REACT_APP_DENTAL_API_URL=http://localhost:5013/api

ENV REACT_APP_AUTH_API_URL=$REACT_APP_AUTH_API_URL
ENV REACT_APP_MEDIA_API_URL=$REACT_APP_MEDIA_API_URL
ENV REACT_APP_CLOUD_API_URL=$REACT_APP_CLOUD_API_URL
ENV REACT_APP_DENTAL_API_URL=$REACT_APP_DENTAL_API_URL

# Build the app
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Create a simple nginx config for React SPA
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

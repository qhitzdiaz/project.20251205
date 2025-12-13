# Multi-stage build for React frontend
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy application files
COPY . .

# Do NOT set build-time environment variables for API URLs
# The frontend uses window.location.origin as default, allowing it to work
# from any network access point (localhost, IP address, domain)
# Optional: Users can set REACT_APP_*_API_URL via .env file or docker-compose environment
# ARG REACT_APP_AUTH_API_URL=http://localhost:50010/api
# ARG REACT_APP_MEDIA_API_URL=http://localhost:50011/api
# ARG REACT_APP_CLOUD_API_URL=http://localhost:50012/api
# ARG REACT_APP_DENTAL_API_URL=http://localhost:50013/api

# Leave environment variables unset so frontend uses window.location.origin

# Build the app
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config if needed
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

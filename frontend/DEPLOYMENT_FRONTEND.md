# Frontend Static Deployment (Linux)

## Overview
This package produces a tar.gz of built static assets (`dist/`) for deployment on a Linux server. Mobile builds are excluded.

## Prerequisites
- Node.js 18+
- npm, yarn, or pnpm

## Build & Package
```bash
# From repo root
chmod +x scripts/build-frontend-package.sh
scripts/build-frontend-package.sh

# Output tarball
ls package/frontend-static-*.tar.gz
```

## Deploy on Linux (Nginx example)
```bash
# Upload the tar.gz to the server
scp -i ~/.ssh/id_rsa package/frontend-static-YYYYMMDD_HHMMSS.tar.gz user@server:/var/www/html/

# On the server, extract to the desired directory
ssh -i ~/.ssh/id_rsa user@server \
  "sudo mkdir -p /var/www/html/app && sudo tar -C /var/www/html/app -xzvf /var/www/html/frontend-static-YYYYMMDD_HHMMSS.tar.gz"

# Configure Nginx server block (example)
sudo tee /etc/nginx/sites-available/app <<'CONF'
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html/app;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Example API proxy (see reverse-proxy/nginx.conf for complete configuration)
    location /api/auth/ {
        proxy_pass http://127.0.0.1:50010/; # Auth API
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
CONF

sudo ln -sf /etc/nginx/sites-available/app /etc/nginx/sites-enabled/app
sudo nginx -t && sudo systemctl reload nginx
```

## Notes
- Replace `yourdomain.com` and API proxy targets to match your environment.
- If using a reverse proxy in the repo, deploy assets into its static folder instead.
- For HTTPS, add TLS config (Certbot or custom certs).

Usage:
1. cd /Users/qhitz/dev01/qhitz-dev-macos/reverse-proxy
2. npm install
3. Set env vars as needed:
   - BACKEND_URL (default http://localhost:5000)
   - FRONTEND_BUILD_DIR (default ../frontend/build)
   - PORT (default 3000)
4. npm run start

For development with auto-reload: npm run dev

Place nginx.conf into /etc/nginx/sites-available/reverse-proxy (or include it in your nginx.conf),
then enable and reload nginx:

1. sudo cp /Users/qhitz/dev01/qhitz-dev-macos/reverse-proxy/nginx.conf /etc/nginx/sites-available/reverse-proxy
2. sudo ln -s /etc/nginx/sites-available/reverse-proxy /etc/nginx/sites-enabled/reverse-proxy
3. Edit the 'upstream backend' and 'root' paths in the config as needed.
4. sudo nginx -t
5. sudo systemctl reload nginx

Notes:
- For HTTPS, add a listen 443 block and configure TLS (certbot or your certs).
- If your backend is on another host/port, update the upstream.
- Adjust log paths and timeouts for your environment.

Docker Compose (optional)
1. Verify frontend build exists at ./frontend/build (or update docker-compose/nginx.conf to point elsewhere).
2. Edit docker-compose.yml: replace backend.image with your backend image or add a build context.
3. Start services:
   - docker-compose up -d
4. Stop services:
   - docker-compose down

Notes:
- nginx.conf already uses "backend:5000" as upstream; ensure your backend service listens on that port inside the compose network.
- For HTTPS, terminate TLS at a proxy (e.g., add a certs volume and listen 443) or place a TLS-enabled reverse proxy in front.

Docker deploy (automated)
1. Ensure node and npm are installed on host (for build step).
2. From reverse-proxy directory run:
   - ./deploy.sh
   This will build the frontend, copy the build into ./frontend/build and start nginx + services with docker-compose.
3. Verify:
   - docker-compose ps
   - docker-compose logs nginx

Notes:
- If frontend build is already present, you can skip step 1 and run: docker-compose up -d --build
- Adjust backend image in docker-compose.yml before deploying.

# FleetSync OTA - Docker Deployment Guide

## 🐳 Quick Start

### Prerequisites
- Docker installed (version 20.10+)
- Docker Compose installed (version 2.0+)
- At least 1GB free disk space

### Build and Run

```bash
# Option 1: Using Docker Compose (Recommended)
docker-compose up -d

# Option 2: Using Docker directly
docker build -t fleetsync-ota .
docker run -d -p 3000:80 --name fleetsync-ota fleetsync-ota
```

The application will be available at: **http://localhost:3000**

## 📦 Docker Setup

### Multi-Stage Build

The Dockerfile uses a multi-stage build for optimization:

1. **Builder Stage** (node:20-alpine)
   - Installs dependencies
   - Builds the Vite application
   - Creates optimized production bundle

2. **Production Stage** (nginx:alpine)
   - Copies built assets
   - Serves via Nginx
   - Minimal final image size (~50MB)

### Container Features

- ✅ Multi-stage build for smaller image size
- ✅ Nginx for production-grade serving
- ✅ Health checks configured
- ✅ Automatic restart on failure
- ✅ Gzip compression enabled
- ✅ Security headers configured
- ✅ SPA routing support
- ✅ Static asset caching

## 🚀 Usage

### Start the Container

```bash
# Start in background
docker-compose up -d

# Start with logs
docker-compose up

# Build and start
docker-compose up --build
```

### Stop the Container

```bash
# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### View Logs

```bash
# View all logs
docker-compose logs

# Follow logs
docker-compose logs -f

# View logs for specific service
docker-compose logs fleetsync-ota
```

### Restart

```bash
docker-compose restart
```

## 🔧 Configuration

### Port Configuration

By default, the app runs on port 3000. To change:

```yaml
# docker-compose.yml
ports:
  - "8080:80"  # Change 8080 to your desired port
```

### Environment Variables

Create a `.env` file for custom configuration:

```bash
# .env
NODE_ENV=production
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=https://api.fleetsync.com
```

Then update docker-compose.yml:

```yaml
services:
  fleetsync-ota:
    env_file:
      - .env
```

## 📊 Container Management

### Check Container Status

```bash
# List running containers
docker ps

# Check health status
docker inspect fleetsync-ota | grep -A 10 Health
```

### Access Container Shell

```bash
docker exec -it fleetsync-ota sh
```

### View Nginx Logs

```bash
# Access logs
docker exec fleetsync-ota cat /var/log/nginx/access.log

# Error logs
docker exec fleetsync-ota cat /var/log/nginx/error.log
```

## 🔍 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs fleetsync-ota

# Check if port is already in use
lsof -i :3000
```

### Build Fails

```bash
# Clean build
docker-compose build --no-cache

# Remove old images
docker image prune -a
```

### Health Check Failing

```bash
# Check health status
docker inspect fleetsync-ota --format='{{json .State.Health}}'

# Test manually
docker exec fleetsync-ota wget --spider http://localhost:80
```

## 🏗️ Development vs Production

### Development (Local)

```bash
# Use local development server
npm run dev
```

### Production (Docker)

```bash
# Build and deploy
docker-compose up -d
```

## 📈 Performance Optimization

The Docker setup includes:

1. **Nginx Gzip Compression**
   - Reduces payload size by ~70%
   - Configured for JS, CSS, JSON, SVG

2. **Static Asset Caching**
   - 1-year cache for immutable assets
   - Proper cache headers

3. **Alpine Linux Base**
   - Minimal image size
   - Fast pull and startup times

4. **Health Checks**
   - Automatic container restart on failure
   - 30-second health check interval

## 🔐 Security

Security features configured:

- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: enabled
- Non-root nginx user
- Minimal attack surface (Alpine)

## 📦 Image Size

| Stage | Size |
|-------|------|
| Builder (node:20-alpine) | ~200MB |
| Final (nginx:alpine) | ~50MB |

## 🌐 Deployment

### Deploy to Cloud

#### Docker Hub

```bash
# Tag image
docker tag fleetsync-ota:latest username/fleetsync-ota:latest

# Push to Docker Hub
docker push username/fleetsync-ota:latest
```

#### AWS ECS / Azure Container Instances

```bash
# Build for production
docker build -t fleetsync-ota:prod .

# Tag for registry
docker tag fleetsync-ota:prod registry.example.com/fleetsync-ota:latest

# Push to registry
docker push registry.example.com/fleetsync-ota:latest
```

## 🧪 Testing

### Test Container Locally

```bash
# Build
docker build -t fleetsync-ota:test .

# Run
docker run -p 3000:80 fleetsync-ota:test

# Test in browser
open http://localhost:3000
```

### Validate Build

```bash
# Check image layers
docker history fleetsync-ota:latest

# Check running processes
docker top fleetsync-ota
```

## 📝 Maintenance

### Update Dependencies

```bash
# Rebuild with latest packages
docker-compose build --no-cache
docker-compose up -d
```

### Clean Up

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove all (nuclear option)
docker system prune -a --volumes
```

## 🎯 Best Practices

1. ✅ Use `.dockerignore` to exclude unnecessary files
2. ✅ Multi-stage builds for smaller images
3. ✅ Health checks for reliability
4. ✅ Named volumes for persistence (if needed)
5. ✅ Environment variables for configuration
6. ✅ Non-root user in container
7. ✅ Regular security updates

## 🆘 Support

For issues:
1. Check logs: `docker-compose logs`
2. Verify health: `docker ps`
3. Test manually: `curl http://localhost:3000`
4. Check GitHub issues
5. Review nginx logs in container

## 📄 Files Structure

```
MegaBosses/
├── Dockerfile              # Multi-stage build definition
├── docker-compose.yml      # Service orchestration
├── nginx.conf             # Nginx configuration
├── .dockerignore          # Files to exclude from build
└── Docs/
    └── Docker.md          # This file
```

## 🚦 Monitoring

### Container Stats

```bash
# Real-time stats
docker stats fleetsync-ota

# Memory usage
docker stats --no-stream fleetsync-ota
```

### Logs Monitoring

```bash
# Follow logs with timestamp
docker-compose logs -f -t

# Last 100 lines
docker-compose logs --tail=100
```

---

**Ready for Production!** 🚀

Your FleetSync OTA application is now containerized and ready to deploy anywhere Docker runs.

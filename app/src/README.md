# React Portfolio - Docker Optimization Journey

A practical implementation of Docker best practices and optimization strategies, transforming a basic containerized React application into a production-ready deployment.

## Full Article

**[Read the complete guide: "Containerizing a React App: Docker Best Practices & Optimization for Production"](https://tinyurl.com/Docker-Optimization-Techniques)**


This repository serves as a hands-on companion to the article, demonstrating each optimization technique applied to a real React portfolio application.

Base Template: [React Portfolio Template](https://github.com/Liz-n-w/react-portfolio-template) - Feel free to customize to your liking!

---

## Project Overview

Starting from a basic 1.57GB Docker image running as root with slow rebuilds, this project systematically applies production-ready optimization strategies to achieve:

- **94% smaller image**: 1.57GB → 76MB
- **94% faster rebuilds**: 3 min → 10 sec
- **Zero security vulnerabilities**: Non-root execution, read-only filesystem
- **Production-ready**: Health checks, resource limits, automated scanning

## Quick Start

### Prerequisites
- Docker Desktop installed
- Node.js 18+ (for local development)


## Quick Reference Commands


```bash
# Build production image
docker build -f Dockerfile.production -t portfolio:production .

# Run container
docker run -d -p 8080:8080 --name portfolio portfolio:production

# View in browser
open http://localhost:8080

# Stop and remove
docker stop portfolio && docker rm portfolio
```

### Testing

```bash
# Run full test suite
./scripts/test-production.sh

# Manual health check
curl http://localhost:8080/health

# Check container status
docker ps

# View logs
docker logs portfolio

# Verify non-root user
docker exec portfolio whoami
```

### Security

```bash
# Vulnerability scan
trivy image --severity HIGH,CRITICAL portfolio:production

# Full scan with all severities
trivy image portfolio:production

# Save scan report
trivy image --format json --output scan.json portfolio:production
```

### Debugging

```bash
# Interactive shell access
docker exec -it portfolio sh

# Check nginx config
docker exec portfolio cat /etc/nginx/conf.d/default.conf

# View running processes
docker exec portfolio ps aux

# Inspect image layers
docker history portfolio:production
```

### Compare All Versions
```bash
# 1. Basic (1.57GB)
docker build -t portfolio:v1-basic .

# 2. Alpine (764MB)
docker build -f Dockerfile.alpine -t portfolio:v2-alpine .

# 3. Multi-stage (45MB)
docker build -f Dockerfile.multistage -t portfolio:v3-multi .

# 4. Secure (45MB + non-root)
docker build -f Dockerfile.secure -t portfolio:v4-secure .

# 5. Production (45MB + all optimizations)
docker build -f Dockerfile.production -t portfolio:v5-prod .

# Compare sizes
docker images | grep portfolio
```

## Dockerfile Evolution

Each Dockerfile represents a step in the optimization journey:

| Version | File | Focus | Key Learning |
|---------|------|-------|--------------|
| v1 | `Dockerfile` | Basic setup | Starting point - 1.57GB image |
| v2 | `Dockerfile.alpine` | Base image | Alpine reduces size by ~80% |
| v3 | `Dockerfile.multistage` | Build separation | Excludes dev dependencies from production |
| v4 | `Dockerfile.prod-deps` | Dependencies | `--production` flag reduces node_modules |
| v5 | `Dockerfile.secure` | Security | Non-root user, health checks |
| v6 | `Dockerfile.production` | Everything | All optimizations + vulnerability patching |

---

## Repository Structure

```
docker-optimized/
├── src/                        # React application source
├── public/                     # Static assets
├── build/                      # Production build output
│
├── Dockerfile                  # Basic development (starting point)
├── Dockerfile.alpine           # Alpine base exploration
├── Dockerfile.multistage       # Multi-stage build introduction
├── Dockerfile.prod-deps        # Production dependencies
├── Dockerfile.secure           # Security hardening
├── Dockerfile.production       # ✅ Final production-ready
│
├── nginx.conf                  # Production nginx configuration
├── .dockerignore               # Build context exclusions
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS processing configuration
│
├── scripts/
│   ├── test-production.sh      # Automated test suite
│   └── security-scan.sh        # Trivy vulnerability scanner
│
├── package.json
├── package-lock.json
└── README.md
```
---

## Technical Skills Demonstrated

### Docker & Containerization
- Multi-stage builds for size optimization
- Layer caching strategies for build performance
- Container security best practices
- Image vulnerability scanning and remediation

### DevOps & Production Readiness
- Infrastructure as Code (Dockerfile)
- Build optimization and CI/CD preparation
- Health checks and self-healing systems
- Resource management and limits

### Security
- Non-root user implementation
- Read-only filesystems
- Version pinning for reproducibility
- Vulnerability scanning integration

### Web Performance
- Nginx configuration for SPAs
- Static asset optimization
- Gzip compression
- Cache headers implementation

---

## Learning Outcomes

By exploring this repository, you'll understand how to:

- Reduce Docker image size by using multi-stage builds
- Speed up rebuilds by with layer caching
- Eliminate security vulnerabilities with non-root users
- Implement health checks for automatic recovery
- Configure production-ready nginx for SPAs
- Use .dockerignore to optimize build context
- Pin versions for reproducible builds
- Scan images for vulnerabilities
- Apply read-only filesystems
- Set resource limits and restart policies

---

##  Next Steps

**Deployment**: Push to Docker Hub/ECR then deploy to cloud VM or PaaS.<br>
**Kubernetes**: Create Deployment + Service manifests, or package as Helm chart.<br>
**Docker Compose**: Write docker-compose.yml with optional nginx proxy.<br>
**CI/CD**: Add GitHub Actions workflow for automated builds and scans.<br>
**Monitoring**: Add health checks and integrate with Prometheus/Grafana.<br>
**Cloud**: Deploy to AWS ECS, GCP Cloud Run, or Azure App Service.<br>
**Optimization**: Try distroless images, BuildKit caching, or multi-arch builds.<br>

---

## Resources

- [Full Article: Docker Best Practices Guide](https://medium.com/@xithira20/docker-best-practices-optimization-for-production-6c6c7182bb0b)
- [Docker Official Documentation](https://docs.docker.com/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Multi-Stage Build Documentation](https://docs.docker.com/build/building/multi-stage/)

---

## License

MIT License - Feel free to use this for your own Docker learning journey.


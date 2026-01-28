#!/bin/bash

# ===========================================
# Docker Production Image Test Suite
# ===========================================

set -e

IMAGE_NAME="portfolio:production"
CONTAINER_NAME="portfolio-test"
PORT=8080

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}✓ $1${NC}"; }
fail() { echo -e "${RED}✗ $1${NC}"; exit 1; }
info() { echo -e "${YELLOW}→ $1${NC}"; }

cleanup() {
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        docker stop $CONTAINER_NAME >/dev/null 2>&1 || true
        docker rm $CONTAINER_NAME >/dev/null 2>&1 || true
    fi
}

trap cleanup EXIT

echo ""
echo "==========================================="
echo "  Docker Production Image Test Suite"
echo "==========================================="
echo ""

# -----------------------------------------
# 1. Build
# -----------------------------------------
info "Building image..."
export DOCKER_BUILDKIT=1
docker build -f Dockerfile.production -t $IMAGE_NAME . --quiet
pass "Image built successfully"

# -----------------------------------------
# 2. Image Size
# -----------------------------------------
info "Checking image size..."
SIZE=$(docker images $IMAGE_NAME --format "{{.Size}}")
echo "   Image size: $SIZE"

SIZE_MB=$(docker images $IMAGE_NAME --format "{{.Size}}" | grep -oE '[0-9]+' | head -1)
if [ "$SIZE_MB" -lt 100 ]; then
    pass "Image size under 100MB"
else
    fail "Image too large: $SIZE"
fi

# -----------------------------------------
# 3. Run Container
# -----------------------------------------
info "Starting container..."
cleanup
docker run -d -p $PORT:8080 --name $CONTAINER_NAME $IMAGE_NAME >/dev/null
sleep 3
pass "Container started"

# -----------------------------------------
# 4. Health Check
# -----------------------------------------
info "Testing health endpoint..."
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/health)
if [ "$HEALTH" = "200" ]; then
    pass "Health endpoint responding (HTTP $HEALTH)"
else
    fail "Health endpoint failed (HTTP $HEALTH)"
fi

# -----------------------------------------
# 5. Main Page
# -----------------------------------------
info "Testing main page..."
MAIN=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/)
if [ "$MAIN" = "200" ]; then
    pass "Main page responding (HTTP $MAIN)"
else
    fail "Main page failed (HTTP $MAIN)"
fi

# -----------------------------------------
# 6. SPA Routing
# -----------------------------------------
info "Testing SPA fallback routing..."
SPA=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/any/random/route)
if [ "$SPA" = "200" ]; then
    pass "SPA routing working (HTTP $SPA)"
else
    fail "SPA routing failed (HTTP $SPA)"
fi

# -----------------------------------------
# 7. Security Headers
# -----------------------------------------
info "Checking security headers..."
HEADERS=$(curl -sI http://localhost:$PORT/)

if echo "$HEADERS" | grep -q "X-Frame-Options"; then
    pass "X-Frame-Options present"
else
    fail "X-Frame-Options missing"
fi

if echo "$HEADERS" | grep -q "X-Content-Type-Options"; then
    pass "X-Content-Type-Options present"
else
    fail "X-Content-Type-Options missing"
fi

if echo "$HEADERS" | grep -q "X-XSS-Protection"; then
    pass "X-XSS-Protection present"
else
    fail "X-XSS-Protection missing"
fi

# -----------------------------------------
# 8. Non-Root User
# -----------------------------------------
info "Verifying non-root user..."
USER=$(docker exec $CONTAINER_NAME whoami)
if [ "$USER" = "nginx" ]; then
    pass "Running as non-root user: $USER"
else
    fail "Running as root (security risk)"
fi

UID_CHECK=$(docker exec $CONTAINER_NAME id -u)
if [ "$UID_CHECK" != "0" ]; then
    pass "User ID is non-zero: $UID_CHECK"
else
    fail "Running as UID 0 (root)"
fi

# -----------------------------------------
# 9. Container Health Status
# -----------------------------------------
info "Checking Docker health status..."
info "Waiting for health check (this takes ~35 seconds)..."

# Wait for first health check to complete (start-period + interval)
for i in {1..12}; do
    sleep 5
    HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' $CONTAINER_NAME 2>/dev/null || echo "none")
    if [ "$HEALTH_STATUS" = "healthy" ]; then
        pass "Container health status: $HEALTH_STATUS"
        break
    elif [ "$HEALTH_STATUS" = "starting" ]; then
        echo -ne "\r   Waiting... ($((i*5))s)"
    else
        fail "Container unhealthy: $HEALTH_STATUS"
    fi
done

echo ""
if [ "$HEALTH_STATUS" != "healthy" ]; then
    fail "Container did not become healthy within 60s"
fi

# -----------------------------------------
# 10. Security Scan (Optional)
# -----------------------------------------
if command -v trivy &> /dev/null; then
    echo ""
    info "Running security scan..."
    VULNS=$(trivy image --severity HIGH,CRITICAL --quiet $IMAGE_NAME 2>/dev/null | grep -c "Total:" || echo "0")
    
    CRITICAL=$(trivy image --severity CRITICAL --quiet $IMAGE_NAME 2>/dev/null | grep -oP 'CRITICAL: \K\d+' || echo "0")
    HIGH=$(trivy image --severity HIGH --quiet $IMAGE_NAME 2>/dev/null | grep -oP 'HIGH: \K\d+' || echo "0")
    
    if [ "${CRITICAL:-0}" = "0" ] && [ "${HIGH:-0}" = "0" ]; then
        pass "No HIGH/CRITICAL vulnerabilities found"
    else
        echo -e "${YELLOW}  Warning: Found vulnerabilities (Critical: ${CRITICAL:-0}, High: ${HIGH:-0})${NC}"
    fi
else
    echo -e "${YELLOW}  Skipping security scan (trivy not installed)${NC}"
fi

# -----------------------------------------
# Summary
# -----------------------------------------
echo ""
echo "==========================================="
echo -e "${GREEN}  All tests passed!${NC}"
echo "==========================================="
echo ""
echo "Image: $IMAGE_NAME"
echo "Size:  $SIZE"
echo ""
echo "Ready for deployment."
echo ""

#!/bin/bash

echo "=== Docker Image Security Scan ==="
echo "Using Trivy to scan for vulnerabilities"
echo ""

# Check if Trivy is installed
if ! command -v trivy &> /dev/null; then
    echo "Trivy is not installed!"
    echo "Install: brew install aquasecurity/trivy/trivy"
    exit 1
fi

echo "Scanning: portfolio:production"
echo "Severity: HIGH, CRITICAL"
echo ""

# Scan production image
trivy image \
    --severity HIGH,CRITICAL \
    --format table \
    portfolio:production

# Get exit code
SCAN_RESULT=$?

echo ""
if [ $SCAN_RESULT -eq 0 ]; then
    echo "✅ Security scan complete"
else
    echo "⚠️  Security scan found issues"
fi

echo ""
echo "For detailed report, run:"
echo "  trivy image portfolio:production"
echo ""
echo "To save JSON report, run:"
echo "  trivy image --format json --output scan.json portfolio:production"

exit $SCAN_RESULT

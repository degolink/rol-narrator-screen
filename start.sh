#!/bin/bash

# Load environment variables from .env if it exists
if [ -f .env ]; then
    # Use allexport to load all variables without issues
    set -a
    source .env
    set +a
fi

# Check if FRONTEND_DOMAIN is defined
if [ -z "$FRONTEND_DOMAIN" ]; then
    echo "❌ Error: FRONTEND_DOMAIN is not defined in your environment or .env file."
    echo "💡 Set it to your desired domain, e.g., FRONTEND_DOMAIN=pantallanarrador.local"
    exit 1
fi

FRONTEND_URL="https://$FRONTEND_DOMAIN"

# Detect Local IP (macOS)
LOCAL_IP=$(ipconfig getifaddr en0)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ipconfig getifaddr en1)
fi

# Fallback if en0/en1 are not detected (e.g., in a different network)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
fi

if [ -z "$LOCAL_IP" ]; then
    echo "❌ Error: Could not detect local IP. Using 127.0.0.1"
    LOCAL_IP="127.0.0.1"
fi

echo "------------------------------------------------"
echo "🚀 Starting Project: Narrator Screen"
echo "📍 IP Detected: $LOCAL_IP"
echo "🌐 URL Front:   $FRONTEND_URL"
echo "------------------------------------------------"

# Create mDNS aliases in the background
# We publish both port 80 (HTTP) and 443 (HTTPS)
dns-sd -P "Pantalla Narrador HTTP" _http._tcp. . 80 "$FRONTEND_DOMAIN" "$LOCAL_IP" > /dev/null 2>&1 &
DNS_HTTP_PID=$!

dns-sd -P "Pantalla Narrador HTTPS" _https._tcp. . 443 "$FRONTEND_DOMAIN" "$LOCAL_IP" > /dev/null 2>&1 &
DNS_HTTPS_PID=$!

# Cleanup function when closing the script
cleanup() {
    echo -e "\n🛑 Stopping services..."
    kill "$DNS_HTTP_PID" "$DNS_HTTPS_PID" 2>/dev/null
    docker compose down
    exit
}

# Capture Ctrl+C (SIGINT) and SIGTERM
trap cleanup SIGINT SIGTERM

# Determine Docker command
DOCKER_CMD="docker compose up"
for arg in "$@"; do
    if [ "$arg" == "--dev" ]; then
        DOCKER_CMD="docker compose up --build"
        break
    fi
done

echo "⚙️  Executing: $DOCKER_CMD"
$DOCKER_CMD

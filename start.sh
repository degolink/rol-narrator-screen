#!/bin/bash

# Load environment variables from .env if it exists
echo "🔍 Loading environment..."
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
echo "🌐 Domain: $FRONTEND_DOMAIN"
echo "📡 Detecting local IP address..."

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

# Clean up any orphaned dns-sd processes for this domain
echo "🧹 Cleaning up orphaned dns-sd processes..."
pkill -f "dns-sd.*$FRONTEND_DOMAIN" 2>/dev/null

# Check current resolution
echo "👀 Checking DNS resolution for $FRONTEND_DOMAIN..."
resolved_ip=$(dscacheutil -q host -a name "$FRONTEND_DOMAIN" | grep "ip_address:" | awk '{print $2}' | head -n 1)
if [ -n "$resolved_ip" ] && [ "$resolved_ip" != "$LOCAL_IP" ]; then
    echo "⚠️  Warning: $FRONTEND_DOMAIN resolves to $resolved_ip, but current IP is $LOCAL_IP."
    echo "🧹 Attempting to clear mDNS cache (may require sudo)..."
    sudo killall -HUP mDNSResponder
fi

# Create mDNS aliases in the background
# We publish both port 80 (HTTP) and 443 (HTTPS)
echo "📢 Advertising services via mDNS..."
dns-sd -P "Pantalla Narrador HTTP" _http._tcp. . 80 "$FRONTEND_DOMAIN" "$LOCAL_IP" > /dev/null 2>&1 &
DNS_HTTP_PID=$!

dns-sd -P "Pantalla Narrador HTTPS" _https._tcp. . 443 "$FRONTEND_DOMAIN" "$LOCAL_IP" > /dev/null 2>&1 &
DNS_HTTPS_PID=$!

# Brief wait to allow dns-sd to register
sleep 1

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

echo "⚙️  Starting Docker containers: $DOCKER_CMD"
$DOCKER_CMD

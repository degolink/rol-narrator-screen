#!/bin/bash

# Helpers
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

trim_crlf() {
    printf "%s" "$1" | tr -d '\r\n'
}

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
    echo "💡 Set it to your desired domain, e.g., FRONTEND_DOMAIN=rol.local"
    exit 1
fi
echo "🌐 Domain: $FRONTEND_DOMAIN"
echo "📡 Detecting local IP address..."

FRONTEND_URL="https://$FRONTEND_DOMAIN"

OS_NAME=$(uname -s 2>/dev/null)
LOCAL_IP=""

case "$OS_NAME" in
    MINGW*|MSYS*|CYGWIN*)
        if [[ ! "$FRONTEND_DOMAIN" =~ \.local$ ]]; then
            echo "⚠️  Note: On Windows + Bonjour, automatic mDNS name resolution is only reliable for .local domains."
            echo "💡 '$FRONTEND_DOMAIN' will need a hosts entry or local DNS server to open in the browser."
        fi
        ;;
esac

detect_ip_macos() {
    local ip
    ip=$(ipconfig getifaddr en0 2>/dev/null)
    if [ -z "$ip" ]; then
        ip=$(ipconfig getifaddr en1 2>/dev/null)
    fi

    # Fallback if en0/en1 are not detected
    if [ -z "$ip" ] && command_exists ifconfig; then
        ip=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
    fi

    trim_crlf "$ip"
}

detect_ip_windows() {
    local ip
    ip=$(powershell.exe -NoProfile -Command '
      $excluded = "vEthernet|WSL|Hyper-V|Docker|VirtualBox|VMware|Loopback|Bluetooth";
      $route = Get-NetRoute -AddressFamily IPv4 -DestinationPrefix "0.0.0.0/0" |
        Where-Object { $_.InterfaceAlias -notmatch $excluded } |
        Sort-Object RouteMetric, InterfaceMetric |
        Select-Object -First 1;

      if ($route) {
        Get-NetIPAddress -AddressFamily IPv4 -InterfaceIndex $route.ifIndex |
          Where-Object {
            $_.IPAddress -ne "127.0.0.1" -and
            $_.IPAddress -notlike "169.254.*"
          } |
          Select-Object -First 1 -ExpandProperty IPAddress
      }
    ' 2>/dev/null)

    if [ -z "$ip" ]; then
        ip=$(powershell.exe -NoProfile -Command '
          Get-NetIPAddress -AddressFamily IPv4 |
            Where-Object {
              $_.InterfaceAlias -notmatch "vEthernet|WSL|Hyper-V|Docker|VirtualBox|VMware|Loopback|Bluetooth" -and
              $_.IPAddress -ne "127.0.0.1" -and
              $_.IPAddress -notlike "169.254.*"
            } |
            Select-Object -First 1 -ExpandProperty IPAddress
        ' 2>/dev/null)
    fi

    if [ -z "$ip" ]; then
        ip=$(ipconfig.exe 2>/dev/null | awk '
            BEGIN { ignore=1 }
            /adapter/ {
                ignore = ($0 ~ /WSL|Hyper-V|vEthernet|Docker|VirtualBox|VMware|Loopback|Bluetooth/)
            }
            /IPv4/ && !ignore {
                split($0, parts, ":")
                gsub(/\r/, "", parts[2])
                gsub(/^[ \t]+/, "", parts[2])
                print parts[2]
                exit
            }
        ')
    fi

    trim_crlf "$ip"
}

case "$OS_NAME" in
    Darwin)
        LOCAL_IP=$(detect_ip_macos)
        ;;
    MINGW*|MSYS*|CYGWIN*)
        LOCAL_IP=$(detect_ip_windows)
        ;;
    *)
        # Generic Unix fallback
        if command_exists hostname; then
            LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
        fi
        if [ -z "$LOCAL_IP" ] && command_exists ip; then
            LOCAL_IP=$(ip route get 1.1.1.1 2>/dev/null | awk '{for (i=1; i<=NF; i++) if ($i == "src") {print $(i+1); exit}}')
        fi
        if [ -z "$LOCAL_IP" ] && command_exists powershell.exe; then
            LOCAL_IP=$(detect_ip_windows)
        fi
        if [ -z "$LOCAL_IP" ] && command_exists ipconfig.exe; then
            LOCAL_IP=$(ipconfig.exe 2>/dev/null | awk -F: '/IPv4/ {gsub(/\r/, "", $2); gsub(/^[ \t]+/, "", $2); print $2; exit}')
        fi
        LOCAL_IP=$(trim_crlf "$LOCAL_IP")
        ;;
esac

if [ -z "$LOCAL_IP" ]; then
    echo "❌ Error: Could not detect local IP. Using 127.0.0.1"
    LOCAL_IP="127.0.0.1"
fi

echo "------------------------------------------------"
echo "🚀 Starting Project: Narrator Screen"
echo "📍 IP Detected: $LOCAL_IP"
echo "🌐 URL Front:   $FRONTEND_URL"
echo "------------------------------------------------"

# Resolve dns-sd command across platforms
DNS_SD_CMD=""
if command_exists dns-sd; then
    DNS_SD_CMD="dns-sd"
elif command_exists dns-sd.exe; then
    DNS_SD_CMD="dns-sd.exe"
else
    echo "❌ Error: dns-sd command was not found."
    echo "💡 Install Bonjour/mDNS tools and ensure dns-sd is available in PATH."
    exit 1
fi

# Clean up any orphaned dns-sd processes for this domain
echo "🧹 Cleaning up orphaned dns-sd processes..."
pkill -f "dns-sd(\.exe)?.*$FRONTEND_DOMAIN" 2>/dev/null

# Check current resolution
echo "👀 Checking DNS resolution for $FRONTEND_DOMAIN..."
resolved_ip=""
if command_exists dscacheutil; then
    resolved_ip=$(dscacheutil -q host -a name "$FRONTEND_DOMAIN" | grep "ip_address:" | awk '{print $2}' | head -n 1)
elif command_exists nslookup; then
    resolved_ip=$(nslookup "$FRONTEND_DOMAIN" 2>/dev/null | awk '
        /^Name:/ { seen_name=1; next }
        seen_name && /^Address: / { print $2; exit }
    ')
fi

if [ -n "$resolved_ip" ] && [ "$resolved_ip" != "$LOCAL_IP" ]; then
    echo "⚠️  Warning: $FRONTEND_DOMAIN resolves to $resolved_ip, but current IP is $LOCAL_IP."
    echo "🧹 Attempting to clear mDNS cache (may require sudo)..."

    if command_exists dscacheutil; then
        sudo killall -HUP mDNSResponder
    elif command_exists powershell.exe; then
        powershell.exe -NoProfile -Command "Clear-DnsClientCache" >/dev/null 2>&1 || true
    fi
fi

# Create mDNS aliases in the background
# We publish both port 80 (HTTP) and 443 (HTTPS)
echo "📢 Advertising services via mDNS..."
"$DNS_SD_CMD" -P "Pantalla Narrador HTTP" _http._tcp. . 80 "$FRONTEND_DOMAIN" "$LOCAL_IP" > /dev/null 2>&1 &
DNS_HTTP_PID=$!

"$DNS_SD_CMD" -P "Pantalla Narrador HTTPS" _https._tcp. . 443 "$FRONTEND_DOMAIN" "$LOCAL_IP" > /dev/null 2>&1 &
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

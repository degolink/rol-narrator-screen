#!/bin/bash

# Load environment variables from .env if it exists
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

echo "🚀 Starting D&D 5e API setup..."

# Start only the necessary services
docker compose up -d mongo dnd5e-api

echo "⏳ Waiting for dnd5e-api to be ready..."
# Wait for the service to respond on port 3000
MAX_RETRIES=30
RETRY_COUNT=0
until $(curl -sSf http://localhost:3000/api > /dev/null 2>&1); do
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "❌ Error: dnd5e-api failed to start in time."
        exit 1
    fi
    printf "."
    sleep 2
    ((RETRY_COUNT++))
done

echo -e "\n✅ dnd5e-api is up! The database is pre-seeded with SRD data."

echo "🎉 SRD Integration ready!"
echo "💡 You can now run ./start.sh to start the full project."
echo "🔗 D&D 5e API will be available at: https://${FRONTEND_DOMAIN}/dnd5e-api/api"

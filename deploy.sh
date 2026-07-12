#!/bin/bash
set -e

echo "🚀 Starting HalalChain Deployment..."

# 1. Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ docker-compose is required but not installed. Aborting."; exit 1; }

# 2. Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "⚠️  .env file not found. Using default values (may cause failures)."
fi

# 3. Build and start all services
echo "🔄 Building and starting containers..."
docker-compose up -d --build

# 4. Wait for services to be ready
echo "⏳ Waiting for services (IPFS, PostgreSQL, Kafka) to be healthy..."
sleep 10

# 5. Initialize IPFS (create public gateway config if needed)
curl -X POST "http://localhost:5001/api/v0/config/Addresses/Gateway" \
  -H "Content-Type: application/json" -d '"/ip4/0.0.0.0/tcp/8080"' || true

# 6. Run TanStack Intent install inside the orchestrator container to sync skills
echo "🔧 Installing TanStack Intent skills..."
docker exec halalchain-orchestrator npx @tanstack/intent@latest install --map

# 7. Deploy smart contracts (optional – only if Hardhat is present)
if [ -d "contracts" ] && [ -f "hardhat.config.js" ]; then
  echo "📜 Deploying smart contracts to testnet..."
  docker exec halalchain-orchestrator npx hardhat run scripts/deploy.js --network sepolia || echo "⚠️  Contract deployment skipped (network not configured)."
fi

# 8. Final health check
echo "🏥 Checking orchestrator health..."
curl -f http://localhost:8080/health || echo "⚠️  Health check failed – check logs: docker logs halalchain-orchestrator"

echo ""
echo "✅ HalalChain deployment complete!"
echo "   - Agent API: http://localhost:8080"
echo "   - MCP SSE: http://localhost:8000/sse"
echo "   - IPFS Gateway: http://localhost:8081/ipfs/<cid>"
echo "   - PostgreSQL: localhost:5432"
echo "   - Kafka: localhost:9092"
echo ""
echo "📝 To stop: docker-compose down"
echo "📝 To view logs: docker-compose logs -f"

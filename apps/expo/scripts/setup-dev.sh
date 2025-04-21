#!/bin/bash
set -e

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up development environment for Pincast Expo...${NC}"

# Check for required environment variables
if [ -z "$POSTGRES_URL" ]; then
  echo -e "${RED}Error: POSTGRES_URL environment variable is not set.${NC}"
  echo -e "Please create a .env file with the following variables:"
  echo -e "POSTGRES_URL=postgres://username:password@host:port/database"
  exit 1
fi

# Make sure we're in the right directory
cd "$(dirname "$0")/.."
APP_DIR=$(pwd)

echo -e "${YELLOW}Working directory: ${APP_DIR}${NC}"

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
NODE_OPTIONS="--loader ts-node/esm" npx ts-node scripts/run-migrations.ts

# Start the development server
echo -e "${GREEN}Setup complete! Starting development server...${NC}"
npm run dev
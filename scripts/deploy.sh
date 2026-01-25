#!/usr/bin/env bash

# Solana Auto-Savings Protocol Deployment Script
# This script builds and deploys the program to Solana

set -e

echo "🚀 Starting Solana Auto-Savings Protocol Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo -e "${RED}❌ Solana CLI not found. Please install it first.${NC}"
    echo "Visit: https://docs.solana.com/cli/install-solana-cli-tools"
    exit 1
fi

# Check if Anchor is installed
if ! command -v anchor &> /dev/null; then
    echo -e "${RED}❌ Anchor CLI not found. Please install it first.${NC}"
    echo "Visit: https://www.anchor-lang.com/docs/installation"
    exit 1
fi

# Get cluster from argument or default to devnet
CLUSTER=${1:-devnet}

echo -e "${YELLOW}📡 Target Cluster: $CLUSTER${NC}"

# Set Solana cluster
solana config set --url $CLUSTER

# Check wallet balance
BALANCE=$(solana balance | awk '{print $1}')
echo -e "${YELLOW}💰 Wallet Balance: $BALANCE SOL${NC}"

if (( $(echo "$BALANCE < 2" | bc -l) )); then
    echo -e "${RED}⚠️  Warning: Low balance. You may need more SOL for deployment.${NC}"
    if [ "$CLUSTER" == "devnet" ]; then
        echo -e "${YELLOW}💸 Requesting airdrop...${NC}"
        solana airdrop 2
    fi
fi

# Build the program
echo -e "${GREEN}🔨 Building program...${NC}"
anchor build

# Get program ID
PROGRAM_ID=$(solana address -k target/deploy/auto_savings-keypair.json)
echo -e "${GREEN}📝 Program ID: $PROGRAM_ID${NC}"

# Update Anchor.toml with correct program ID
echo -e "${YELLOW}📝 Updating Anchor.toml...${NC}"
sed -i.bak "s/auto_savings = \".*\"/auto_savings = \"$PROGRAM_ID\"/" Anchor.toml

# Update lib.rs with correct program ID
echo -e "${YELLOW}📝 Updating lib.rs...${NC}"
sed -i.bak "s/declare_id!(\".*\")/declare_id!(\"$PROGRAM_ID\")/" programs/auto-savings/src/lib.rs

# Rebuild with correct program ID
echo -e "${GREEN}🔨 Rebuilding with correct program ID...${NC}"
anchor build

# Deploy the program
echo -e "${GREEN}🚀 Deploying to $CLUSTER...${NC}"
anchor deploy --provider.cluster $CLUSTER

# Verify deployment
echo -e "${GREEN}✅ Verifying deployment...${NC}"
solana program show $PROGRAM_ID

echo ""
echo -e "${GREEN}=================================================="
echo "✅ Deployment Complete!"
echo "=================================================="
echo -e "Program ID: ${YELLOW}$PROGRAM_ID${NC}"
echo -e "Cluster: ${YELLOW}$CLUSTER${NC}"
echo ""
echo "Next steps:"
echo "1. Update your frontend with the new Program ID"
echo "2. Run tests: anchor test"
echo "3. Initialize your user account"
echo -e "==================================================${NC}"

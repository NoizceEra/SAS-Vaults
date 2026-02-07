#!/bin/bash
set -e

echo "Installing Solana CLI v1.18.26..."
sh -c "$(curl -sSfL https://release.solana.com/v1.18.26/install)"
echo "Solana CLI installed successfully"

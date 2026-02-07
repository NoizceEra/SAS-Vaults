#!/bin/bash
set -e

echo "🔧 Installing Solana toolchain manually..."

# Create installation directory
mkdir -p ~/.local/share/solana
cd ~/.local/share/solana

# Download Solana release (using --insecure if needed for WSL SSL issues)
echo "📥 Downloading Solana v1.18.26..."
curl -L --insecure https://github.com/solana-labs/solana/releases/download/v1.18.26/solana-release-x86_64-unknown-linux-gnu.tar.bz2 -o solana-release.tar.bz2

# Extract
echo "📦 Extracting..."
tar jxf solana-release.tar.bz2
mv solana-release active_release

# Add to PATH
echo "✅ Solana installed to ~/.local/share/solana/active_release"
echo ""
echo "Add to your PATH:"
echo 'export PATH="$HOME/.local/share/solana/active_release/bin:$PATH"'

#!/bin/bash
set -e

echo "🚀 Setting up Solana development environment in WSL..."

# Install Rust
echo "📦 Installing Rust..."
if ! command -v rustc &> /dev/null; then
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
    echo "✅ Rust installed"
else
    echo "✅ Rust already installed"
fi

# Install Solana CLI
echo "📦 Installing Solana CLI v1.18.26..."
if ! command -v solana &> /dev/null; then
    sh -c "$(curl -sSfL https://release.solana.com/v1.18.26/install)"
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
    echo "✅ Solana CLI installed"
else
    echo "✅ Solana CLI already installed"
fi

# Install Node.js and Yarn (required for Anchor)
echo "📦 Installing Node.js and Yarn..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    sudo npm install -g yarn
    echo "✅ Node.js and Yarn installed"
else
    echo "✅ Node.js already installed"
fi

# Install Anchor
echo "📦 Installing Anchor v0.32.1..."
if ! command -v anchor &> /dev/null; then
    cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
    avm install 0.32.1
    avm use 0.32.1
    echo "✅ Anchor installed"
else
    echo "✅ Anchor already installed"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run: source ~/.cargo/env"
echo "2. Run: export PATH=\"\$HOME/.local/share/solana/install/active_release/bin:\$PATH\""
echo "3. Run: cd /mnt/c/Users/vclin_jjufoql/Documents/SAS"
echo "4. Run: anchor build"

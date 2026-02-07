#!/bin/bash
export PATH="$HOME/.local/share/solana/active_release/bin:$PATH"
export PATH="$HOME/.cargo/bin:$PATH"

echo "Checking installations..."
echo "Rust: $(rustc --version)"
echo "Cargo: $(cargo --version)"
echo "Solana: $(solana --version)"

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    sudo npm install -g yarn
fi

echo "Node: $(node --version)"
echo "Yarn: $(yarn --version)"

# Install Anchor
echo "Installing Anchor..."
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.32.1
avm use 0.32.1

echo "✅ All tools installed!"

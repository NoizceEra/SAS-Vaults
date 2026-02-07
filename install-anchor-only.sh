#!/bin/bash
export PATH="$HOME/.local/share/solana/active_release/bin:$PATH"
export PATH="$HOME/.cargo/bin:$PATH"

echo "Installing Anchor CLI..."
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked --force

echo "✅ Anchor installed!"
echo "Version: $(anchor --version)"

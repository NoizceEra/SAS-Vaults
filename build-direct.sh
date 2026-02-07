#!/bin/bash
export PATH="$HOME/.local/share/solana/active_release/bin:$PATH"
export PATH="$HOME/.cargo/bin:$PATH"

cd /mnt/c/Users/vclin_jjufoql/Documents/SAS

echo "Building Solana program with cargo-build-sbf..."
cargo build-sbf --manifest-path=programs/auto-savings/Cargo.toml --sbf-out-dir=target/deploy

echo "✅ Build complete!"
ls -lh target/deploy/

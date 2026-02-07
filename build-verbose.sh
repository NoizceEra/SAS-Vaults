#!/bin/bash
export PATH="$HOME/.local/share/solana/active_release/bin:$PATH"
export PATH="$HOME/.cargo/bin:$PATH"

cd /mnt/c/Users/vclin_jjufoql/Documents/SAS

echo "Downgrading toml_edit dependency..."


echo "Building Solana program with verbose output..."
cargo build-sbf --manifest-path=programs/auto-savings/Cargo.toml --sbf-out-dir=target/deploy 2>&1 | tee build.log

echo ""
echo "Build log saved to build.log"
echo "Checking output files..."
find target -name "*.so" -ls

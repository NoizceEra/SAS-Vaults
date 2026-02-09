FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    curl build-essential clang llvm pkg-config libssl-dev cmake git python3 nodejs npm unzip ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install rustup and set up nightly toolchain
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
RUN rustup toolchain install nightly && rustup default nightly

# Install Solana (stable) toolchain
RUN curl -sSfL https://release.solana.com/stable/install | sh
ENV PATH="/root/.local/share/solana/install/active_release/bin:${PATH}"

# Install Anchor CLI (installing a recent stable via cargo)
RUN cargo install --locked --git https://github.com/coral-xyz/anchor --tag v0.32.1 anchor-cli || true

# Workdir and default command: this container expects the workspace mounted at /workspace
WORKDIR /workspace

COPY . /workspace

# Ensure the program crate uses nightly
WORKDIR /workspace/programs/auto-savings
RUN rustup override set nightly || true

# Default: build with anchor forwarding --release to cargo
CMD ["/bin/bash", "-lc", "anchor build -- --release"]

#!/bin/bash

# Quick Sui Deployment Script
# Use this while Sui CLI installs via cargo

echo "=========================================="
echo "QUICK SUI DEPLOYMENT"
echo "=========================================="

# Kill the slow cargo install
pkill -f "cargo install.*sui"

# Use pre-built binary instead
echo "Downloading pre-built Sui CLI..."
wget -q https://github.com/MystenLabs/sui/releases/download/testnet-v1.37.3/sui-testnet-v1.37.3-ubuntu-x86_64.tgz -O /tmp/sui.tgz
tar -xzf /tmp/sui.tgz -C /tmp/
sudo cp /tmp/target/release/sui /usr/local/bin/ 2>/dev/null || cp /tmp/target/release/sui ~/.local/bin/

# Verify
if command -v sui &> /dev/null; then
    echo "✅ Sui CLI installed!"
    sui --version
    
    # Now import wallet from seed
    echo ""
    echo "Importing wallet from seed phrase..."
    echo "pull noodle trim rubber seed walnut know pigeon muffin olympic penalty exchange" | sui keytool import --alias hackathon ed25519
    
    # Get address
    echo ""
    echo "=========================================="
    echo "YOUR SUI WALLET ADDRESS:"
    sui client active-address
    echo "=========================================="
    
else
    echo "❌ Installation failed. Please install manually."
fi

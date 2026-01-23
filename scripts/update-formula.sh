#!/bin/bash

# Homebrew Formula Update Script
# This script helps you update the Formula when releasing a new version

set -e

echo "🍺 Easy Git CLI - Homebrew Formula Updater"
echo "=========================================="
echo ""

# Get package version from package.json
VERSION=$(node -p "require('./package.json').version")
echo "📦 Current version: $VERSION"
echo ""

# Get tarball URL
TARBALL_URL="https://registry.npmjs.org/@wassupsong/easy-git-cli/-/easy-git-cli-${VERSION}.tgz"
echo "🔗 Tarball URL: $TARBALL_URL"
echo ""

# Calculate SHA256
echo "🔐 Calculating SHA256 hash..."
SHA256=$(curl -sL "$TARBALL_URL" | shasum -a 256 | awk '{print $1}')
echo "✅ SHA256: $SHA256"
echo ""

# Update Formula
echo "📝 Updating Formula/easy-git.rb..."
sed -i.bak "s|url \".*\"|url \"$TARBALL_URL\"|g" Formula/easy-git.rb
sed -i.bak "s|sha256 \".*\"|sha256 \"$SHA256\"|g" Formula/easy-git.rb
rm Formula/easy-git.rb.bak

echo "✅ Formula updated successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Test the formula: brew install --build-from-source Formula/easy-git.rb"
echo "  2. Commit changes: git add Formula/easy-git.rb && git commit -m 'chore: update formula to v$VERSION'"
echo "  3. Push to GitHub: git push"
echo ""

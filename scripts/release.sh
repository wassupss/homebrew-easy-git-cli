#!/bin/bash

# Complete Release Script (Local + npm + Homebrew)

set -e

echo "🚀 Easy Git CLI - Complete Release"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Check git status
if [[ -n $(git status -s) ]]; then
  echo -e "${RED}❌ Uncommitted changes found${NC}"
  git status -s
  exit 1
fi

CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${CYAN}📦 Current version: ${CURRENT_VERSION}${NC}"
echo ""

# Select version type
echo "Select version bump:"
echo "  1) patch (bug fixes)"
echo "  2) minor (new features)"
echo "  3) major (breaking changes)"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
  1) VERSION_TYPE="patch" ;;
  2) VERSION_TYPE="minor" ;;
  3) VERSION_TYPE="major" ;;
  *)
    echo -e "${RED}Invalid choice${NC}"
    exit 1
    ;;
esac

echo ""
echo -e "${CYAN}🧪 Running tests...${NC}"
npm test

echo ""
echo -e "${CYAN}🔨 Building...${NC}"
npm run build

echo ""
echo -e "${CYAN}📝 Updating version...${NC}"
npm version "$VERSION_TYPE"
NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}✅ Version: ${CURRENT_VERSION} -> ${NEW_VERSION}${NC}"

echo ""
echo -e "${YELLOW}⚠️  Ready to release v${NEW_VERSION}${NC}"
echo ""
echo "This will:"
echo "  1. Publish to npm (you may need to enter 2FA code)"
echo "  2. Update Homebrew Formula"
echo "  3. Push to GitHub"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled. Rolling back..."
  git tag -d "v${NEW_VERSION}" 2>/dev/null || true
  git reset --hard HEAD~1
  exit 1
fi

echo ""
echo -e "${CYAN}📤 Publishing to npm...${NC}"
npm publish
echo -e "${GREEN}✅ Published to npm!${NC}"

echo ""
echo -e "${CYAN}🍺 Updating Homebrew Formula...${NC}"
bash scripts/update-formula.sh

echo ""
echo -e "${CYAN}📝 Committing Formula changes...${NC}"
git add Formula/easy-git.rb
git commit -m "chore: update Homebrew formula to v${NEW_VERSION}"
echo -e "${GREEN}✅ Formula committed!${NC}"

echo ""
echo -e "${CYAN}🚀 Pushing to GitHub...${NC}"
git push
git push --tags

echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}✅ Release v${NEW_VERSION} Complete!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo "Users can now install/update:"
echo ""
echo -e "${CYAN}  # Via Homebrew${NC}"
echo "  brew upgrade easy-git"
echo ""
echo -e "${CYAN}  # Via npm${NC}"
echo "  npm update -g @wassupsong/easy-git-cli"
echo ""

#!/bin/bash

# Automated Release Script
# This script automates the entire release process

set -e

echo "🚀 Easy Git CLI - Automated Release"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo -e "${RED}❌ Error: Not in a git repository${NC}"
  exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
  echo -e "${RED}❌ Error: You have uncommitted changes${NC}"
  echo "Please commit or stash your changes before releasing."
  git status -s
  exit 1
fi

# Check if we're on main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo -e "${YELLOW}⚠️  Warning: You are on branch '$CURRENT_BRANCH', not 'main'${NC}"
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${CYAN}📦 Current version: ${CURRENT_VERSION}${NC}"
echo ""

# Ask for version bump type
echo "Select version bump type:"
echo "  1) patch (bug fixes)       ${CURRENT_VERSION} -> $(npm version patch --no-git-tag-version && node -p "require('./package.json').version" && git checkout package.json package-lock.json)"
echo "  2) minor (new features)    ${CURRENT_VERSION} -> $(npm version minor --no-git-tag-version && node -p "require('./package.json').version" && git checkout package.json package-lock.json)"
echo "  3) major (breaking changes) ${CURRENT_VERSION} -> $(npm version major --no-git-tag-version && node -p "require('./package.json').version" && git checkout package.json package-lock.json)"
echo "  4) custom version"
echo "  5) cancel"
echo ""

read -p "Enter choice (1-5): " choice

case $choice in
  1)
    VERSION_TYPE="patch"
    ;;
  2)
    VERSION_TYPE="minor"
    ;;
  3)
    VERSION_TYPE="major"
    ;;
  4)
    read -p "Enter version number (e.g., 1.2.3): " CUSTOM_VERSION
    VERSION_TYPE="$CUSTOM_VERSION"
    ;;
  5)
    echo "Cancelled."
    exit 0
    ;;
  *)
    echo -e "${RED}Invalid choice${NC}"
    exit 1
    ;;
esac

echo ""
echo -e "${CYAN}📝 Running tests...${NC}"
npm test

echo ""
echo -e "${CYAN}🔨 Building...${NC}"
npm run build

echo ""
echo -e "${CYAN}📋 Updating version...${NC}"

if [[ $VERSION_TYPE =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  # Custom version
  npm version "$VERSION_TYPE" --no-git-tag-version
  NEW_VERSION="$VERSION_TYPE"
else
  # Bump version (patch, minor, major)
  npm version "$VERSION_TYPE"
  NEW_VERSION=$(node -p "require('./package.json').version")
fi

echo -e "${GREEN}✅ Version updated: ${CURRENT_VERSION} -> ${NEW_VERSION}${NC}"
echo ""

# Confirm before publishing
echo -e "${YELLOW}⚠️  Ready to release v${NEW_VERSION}${NC}"
echo ""
echo "This will:"
echo "  1. Push commits and tags to GitHub"
echo "  2. Publish to npm (requires NPM_TOKEN in GitHub Secrets)"
echo "  3. Create a GitHub Release"
echo "  4. Automatically update Homebrew Formula"
echo ""

read -p "Continue? (y/N) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled. Rolling back version change..."
  git checkout package.json package-lock.json
  exit 1
fi

echo ""
echo -e "${CYAN}🚀 Pushing to GitHub...${NC}"

# Push commits and tags
git push
git push --tags

echo ""
echo -e "${GREEN}✅ Release v${NEW_VERSION} initiated!${NC}"
echo ""
echo "GitHub Actions will now:"
echo "  1. Run tests"
echo "  2. Publish to npm"
echo "  3. Create GitHub Release"
echo "  4. Update Homebrew Formula"
echo ""
echo "Check progress at:"
echo "  https://github.com/wassupss/easy-git-cli/actions"
echo ""
echo -e "${CYAN}🍺 Users can install/update with:${NC}"
echo "  brew upgrade easy-git"
echo "  npm update -g @wassupsong/easy-git-cli"

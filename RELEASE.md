# Release Process

## ⚡ Automated Release (Recommended)

```bash
npm run release
```

This will:

1. ✅ Run tests
2. ✅ Build
3. ✅ Ask for version bump (patch/minor/major)
4. ✅ Update package.json
5. ✅ Create git tag
6. ✅ Push to GitHub

Then GitHub Actions automatically:

- 🤖 Publish to npm
- 🤖 Create GitHub Release
- 🤖 Update Homebrew Formula

---

## 📋 First Time Setup

See [GITHUB_SETUP.md](GITHUB_SETUP.md) for:

- Adding NPM_TOKEN to GitHub Secrets
- Enabling GitHub Actions permissions

**Takes 5 minutes, only needed once!**

---

## 🔄 Manual Release (If Automation Fails)

```bash
# 1. Update version
npm version patch  # or minor, major

# 2. Publish to npm
npm publish

# 3. Update Homebrew Formula
npm run update-formula

# 4. Commit and push
git add Formula/easy-git.rb
git commit -m "chore: update formula to v$(node -p "require('./package.json').version")"
git push
git push --tags
```

---

## 📦 After Release

Users can install/update:

```bash
# Via Homebrew
brew upgrade easy-git

# Via npm
npm update -g @wassupsong/easy-git-cli
```

---

## 📝 Version Strategy

- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (0.X.0): New features (backwards compatible)
- **PATCH** (0.0.X): Bug fixes

---

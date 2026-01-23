# Changelog

## [Unreleased]

### Added
- 🍺 Homebrew distribution support with standard tap naming
- 🛠️ `npm run release` - complete local release automation
- 📚 Simplified documentation

### Changed
- Switched to local-only releases (no GitHub Actions)
- Formula updates automatically during release
- Repository renamed to `homebrew-easy-git-cli` for Homebrew tap compatibility
- Homebrew installation now uses standard tap format: `brew install wassupss/easy-git-cli/easy-git`

---

## [1.1.0] - 2025-01-23

### Added
- Multi-language support (English/Korean)
- Pull Request functionality (GitHub/GitLab/Bitbucket)
- Rebase with conflict resolution
- Commit revert and reset (soft/mixed/hard)
- Branch merge with conflict handling
- Commit graph visualization
- Language settings menu

### Changed
- Renamed "Add" menu to "Staging" with unstage support
- Moved "Log View" into Commit submenu
- Removed "Press Enter to continue" prompts
- All submenus now loop back

---

## [1.0.0] - Initial Release

### Added
- Interactive Git CLI with arrow key navigation
- Status checking with color-coded output
- File staging and commits
- Push/Pull with auto-detected branch
- Branch management
- Commit log viewer
- Stash management
- Remote management
- Custom command system

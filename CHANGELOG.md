# Changelog

## [Unreleased]

### Added

- 🍺 Homebrew distribution support
- 🤖 Automated release pipeline (GitHub Actions)
- 🛠️ `npm run release` - one-command release
- 📚 Comprehensive documentation

### Infrastructure

- GitHub Actions workflows (publish, update-formula, test)
- Homebrew Formula (`Formula/easy-git.rb`)
- Release automation scripts

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

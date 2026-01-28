# Changelog

## [Unreleased]

### Added

- 🍺 Homebrew distribution support with standard tap naming
- 🛠️ `npm run release` - complete local release automation
- 📚 Simplified documentation
- 🔔 Automatic update notification system (checks once per day)
- ✅ Version check command (`eg -v` or `eg --version`)
- 📦 Version caching to avoid excessive API calls
- 📱 Beautiful boxed update notification with version comparison
  - Shows current vs latest version
  - Provides npm and Homebrew update commands
  - Auto-displays on CLI startup when update available
- 📏 Smart terminal size detection for better UI adaptation
  - Dynamic page size adjustment based on terminal height
  - Compact welcome message for small terminals
  - Prevents menu overflow on small screens
- ⚡ Enhanced custom commands with granular action types
  - Separate menu openers vs direct actions (e.g., "커밋 메뉴" vs "커밋 생성")
  - Added stash-list, stash-drop, stash-clear actions
  - Added branch-switch, branch-create, branch-delete actions
  - Added rebase-branch for direct rebase execution
- 🔙 Back button in custom command creation flow
  - Category selection: ← Back or ✅ Done
  - Action selection: ← Back to category
  - Smart parameter input during action setup or runtime
- ⚙️ Settings moved to main menu
  - Separated from custom command menu
  - Easier access to configuration options

### Changed

- Switched to local-only releases (no GitHub Actions)
- Formula updates automatically during release
- Repository renamed to `homebrew-easy-git-cli` for Homebrew tap compatibility
- Homebrew installation now uses standard tap format: `brew install wassupss/easy-git-cli/easy-git`
- Custom commands now distinguish between interactive menus and direct actions
- All inquirer prompts now use dynamic `pageSize` for better terminal compatibility
- Removed unnecessary confirmations in custom command execution flow

### Fixed

- Duplicate custom command names no longer appear in list
- Custom command parameters can be preset or entered at runtime
- Terminal menu overflow on small screens
- Test suite compatibility with current project structure

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

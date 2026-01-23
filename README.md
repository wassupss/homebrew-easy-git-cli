# 🚀 Easy Git

An interactive CLI tool to make Git easier to use in terminal.

## ✨ Key Features

- 🎨 **Interactive Menu**: Intuitive UI with arrow key navigation
- 📊 **Status Check**: View Git status with clear color-coding
- ➕ **Smart File Adding**: Add all files or select specific ones
- 💾 **Easy Commits**: Preview staged files and write commit messages
- ⬆️⬇️ **Push/Pull**: Auto-detect current branch for push/pull
- 🌿 **Branch Management**: Create, switch, and delete branches in one place
- 🔄 **Rebase**: Interactive rebase with conflict resolution support
- ⏪ **Commit Revert/Reset**: Safely revert or reset commits
- 📜 **View Logs**: Display commit history in a readable format
- 📦 **Stash Management**: Temporarily save and restore changes
- 🔀 **Pull Request**: Create PRs and open repository pages (GitHub/GitLab/Bitbucket)
- 🌐 **Multi-language**: Supports English and Korean (한국어)

## 📦 Installation

### Via Homebrew (Recommended for macOS/Linux) 🍺

```bash
brew install wassupss/easy-git-cli/easy-git
```

> **Note**: This requires the repository to be named `homebrew-easy-git-cli` on GitHub.

### Via npm

```bash
npm install -g @wassupsong/easy-git-cli
```

### Via npx (No installation required)

```bash
npx @wassupsong/easy-git-cli
```

For more details, see [HOMEBREW.md](HOMEBREW.md)

## 🎯 Usage

```bash
# Both commands work
easy-git
# or
eg
```

### Check Version

```bash
eg -v
# or
eg --version
```

### Available Commands

```bash
# Interactive mode (default)
eg

# Clone a repository
eg clone

# Custom commands (if configured)
eg <custom-command-name>
```

## 🔔 Update Notification

Easy Git CLI automatically checks for updates once a day and notifies you when a new version is available:

```
┌────────────────────────────────────────────────────────┐
│ 🎉 새로운 버전이 출시되었습니다!                        │
│                                                          │
│ 현재 버전: 1.2.1                                        │
│ 최신 버전: 1.2.2                                        │
│                                                          │
│ 업데이트: npm install -g @wassupsong/easy-git-cli      │
└────────────────────────────────────────────────────────┘
```

## 📖 기능 상세

### 1️⃣ 상태 확인 (Status)

현재 Git 저장소의 상태를 색상으로 구분하여 표시:

- ✅ **초록색**: Staged 파일
- 📝 **노란색**: Modified 파일
- ❓ **빨간색**: Untracked 파일
- 🗑️ **빨간색**: Deleted 파일
- ⚠️ **마젠타**: Conflicted 파일

### 2️⃣ 파일 추가 (Add)

- **모든 파일 추가**: 한 번에 모든 변경사항 추가
- **특정 파일 선택**: 체크박스로 원하는 파일만 선택

### 3️⃣ 커밋 (Commit)

- **💾 새 커밋 생성**: Staged 파일 미리보기 및 커밋 메시지 입력
- **⏪ 커밋 되돌리기 (Revert)**:
  - 최근 커밋 목록에서 선택
  - 선택한 커밋의 변경사항을 되돌리는 새 커밋 생성
  - 히스토리 안전하게 보존 (추천)
- **↩️ 커밋 취소 (Reset)**:
  - **Soft**: 커밋만 취소, 변경사항은 Staged 상태로 유지
  - **Mixed**: 커밋과 Staging 취소, 변경사항은 Working Directory에 유지
  - **Hard**: 커밋과 변경사항 모두 취소 (⚠️ 주의: 되돌릴 수 없음!)
  - 바로 이전 커밋 또는 특정 커밋으로 되돌리기 가능

### 4️⃣ Push/Pull

- 현재 브랜치 자동 감지
- 확인 후 원격 저장소와 동기화

### 5️⃣ 브랜치 관리

- **목록 보기**: 모든 브랜치와 현재 브랜치 표시
- **새 브랜치 생성**: 이름 입력 후 자동 전환
- **브랜치 전환**: 리스트에서 선택
- **브랜치 삭제**: 안전하게 삭제

### 6️⃣ Rebase

- **🔄 브랜치 Rebase**: 현재 브랜치를 다른 브랜치 위로 rebase
  - 브랜치 목록에서 선택
  - 깔끔한 커밋 히스토리 유지
- **▶️ Rebase 계속 진행**: 충돌 해결 후 rebase 계속
- **⏭️ 현재 커밋 건너뛰기**: 문제가 있는 커밋 건너뛰기
- **❌ Rebase 취소**: rebase 작업을 완전히 취소하고 원래 상태로 복구

### 7️⃣ 로그 보기

- 최근 5/10/20/50개 커밋 선택
- 커밋 해시, 메시지, 작성자, 날짜 표시

### 8️⃣ Stash 관리

- **저장**: 변경사항 임시 저장
- **복원**: stash 적용 및 제거
- **목록**: 저장된 stash 보기
- **삭제**: 특정/전체 stash 삭제

### 9️⃣ Pull Request (PR)

- **🆕 새 PR 생성**: 현재 브랜치에서 PR 생성 페이지를 브라우저에서 열기
  - GitHub, GitLab, Bitbucket 자동 감지
  - 대상 브랜치(base branch) 선택
  - PR 제목/내용 작성 페이지로 바로 이동
- **📋 PR 목록 보기**: 저장소의 모든 PR 목록 페이지 열기
- **🏠 PR 홈페이지 열기**: 저장소 메인 페이지를 브라우저에서 열기

**지원 플랫폼:**

- GitHub: `github.com`
- GitLab: `gitlab.com`
- Bitbucket: `bitbucket.org`

## 🛠️ 기술 스택

- **TypeScript**: 타입 안전성
- **simple-git**: Git 명령어 실행
- **inquirer**: 인터랙티브 프롬프트
- **chalk**: 터미널 색상
- **ora**: 로딩 스피너

## 🛠️ 기술 스택

- **TypeScript**: 타입 안전성
- **simple-git**: Git 명령어 실행
- **inquirer**: 인터랙티브 프롬프트
- **chalk**: 터미널 색상
- **ora**: 로딩 스피너
- **boxen**: 박스 UI

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

# Contributing Guide

Thank you for contributing to Easy Git CLI! 🎉

## Development Setup

1. Fork and clone the repository

```bash
git clone https://github.com/your-username/easy-git-cli.git
cd easy-git-cli
```

2. Install dependencies

```bash
npm install
```

3. Run in development mode

```bash
npm run dev
```

## 개발 워크플로우

## Development Workflow

### 1. Create a branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Write code

- Write in TypeScript
- Follow existing code style
- Use localeService for all user-facing messages
- Support both English and Korean

### 3. Test

```bash
# Build test
npm run build

# Run tests
npm test

# Run in development
npm run dev
```

### 4. Commit

Write meaningful commit messages:

```
feat: add new feature
fix: fix bug
docs: update documentation
refactor: refactor code
style: code formatting
chore: update dependencies
```

### 5. Pull Request

- Clear PR title and description
- Detailed explanation of changes
- Screenshots (for UI changes)

## Code Structure

```
src/
├── index.ts              # Main entry point, menu logic
├── services/
│   ├── git-service.ts    # Git command wrapper
│   ├── locale-service.ts # Multi-language support
│   └── config-service.ts # Custom command management
├── utils/
│   └── git-executor.ts   # Low-level git operations
└── commands/
    ├── add.ts            # git add (staging)
    ├── commit.ts         # git commit, log, graph
    ├── push.ts           # git push
    ├── pull.ts           # git pull
    ├── branch.ts         # branch management, merge
    ├── rebase.ts         # git rebase
    ├── stash.ts          # git stash
    ├── remote.ts         # remote management
    ├── pr.ts             # pull request creation
    ├── custom.ts         # custom commands
    ├── log.ts            # commit history
    └── status.ts         # git status
```

    ├── stash.ts          # stash 관리
    └── status.ts         # git status 관련

````

## 새로운 명령어 추가하기

1. `src/commands/` 디렉토리에 새 파일 생성
2. `GitService.ts`에 필요한 메서드 추가
3. `index.ts`의 메뉴에 새 옵션 추가
4. 에러 처리 및 사용자 피드백 구현

### 예시: 새 명령어 추가

```typescript
// src/commands/example.ts
import inquirer from "inquirer";
import chalk from "chalk";
import { GitService } from "../services/GitService";

export async function handleExample(gitService: GitService): Promise<void> {
  // 구현...
}
````

```typescript
// src/services/GitService.ts
async exampleMethod(): Promise<void> {
  const spinner = ora('작업 중...').start();
  try {
    // Git 명령어 실행
    spinner.succeed('완료');
  } catch (error: any) {
    spinner.fail('실패');
    throw error;
  }
}
```

```typescript
// src/index.ts - 메뉴에 추가
choices: [
  // ...existing choices...
  { name: '🆕 예시 기능', value: 'example' },
]

// switch 문에 케이스 추가
case 'example':
  await handleExample(gitService);
  break;
```

## 스타일 가이드

### TypeScript

- `async/await` 사용
- 명시적 타입 지정
- 에러 처리 필수

### UI/UX

- 이모지 아이콘 사용
- 한글 메시지
- 색상 일관성 유지:
  - 성공: `chalk.green`
  - 경고: `chalk.yellow`
  - 에러: `chalk.red`
  - 정보: `chalk.cyan`
  - 강조: `chalk.bold`

### 메시지

- 명확하고 친절한 메시지
- 사용자 행동 유도
- 에러 발생시 해결 방법 제시

## 버그 리포트

버그를 발견하셨나요? Issue를 열어주세요:

1. 명확한 제목
2. 재현 단계
3. 예상 동작 vs 실제 동작
4. 환경 정보 (OS, Node 버전 등)

## 기능 제안

새로운 기능 아이디어가 있으신가요?

1. Issue에서 먼저 논의
2. 커뮤니티 피드백 수렴
3. 승인 후 개발 시작

## 질문?

궁금한 점이 있다면 Issue를 열어주세요!

---

다시 한번 기여해주셔서 감사합니다! ❤️

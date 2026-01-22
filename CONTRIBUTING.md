# 기여 가이드

Easy Git에 기여해주셔서 감사합니다! 🎉

## 개발 환경 설정

1. 저장소 포크 및 클론

```bash
git clone https://github.com/your-username/easy-git.git
cd easy-git
```

2. 의존성 설치

```bash
npm install
```

3. 개발 모드 실행

```bash
npm run dev
```

## 개발 워크플로우

### 1. 브랜치 생성

```bash
git checkout -b feature/your-feature-name
```

### 2. 코드 작성

- TypeScript로 작성
- 기존 코드 스타일 준수
- 한글 메시지 사용

### 3. 테스트

```bash
# 빌드 테스트
npm run build

# 실행 테스트
npm run dev
```

### 4. 커밋

의미있는 커밋 메시지 작성:

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 업데이트
refactor: 코드 리팩토링
style: 코드 포맷팅
```

### 5. Pull Request

- 명확한 PR 제목과 설명
- 변경 사항 상세 설명
- 스크린샷 첨부 (UI 변경시)

## 코드 구조

```
src/
├── index.ts              # 메인 진입점, 메뉴 로직
├── services/
│   └── GitService.ts     # Git 명령어 래퍼, simple-git 사용
└── commands/
    ├── add.ts            # git add 관련
    ├── commit.ts         # git commit 관련
    ├── push.ts           # git push 관련
    ├── pull.ts           # git pull 관련
    ├── branch.ts         # 브랜치 관리
    ├── log.ts            # 로그 보기
    ├── stash.ts          # stash 관리
    └── status.ts         # git status 관련
```

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
```

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

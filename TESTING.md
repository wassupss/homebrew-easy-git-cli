# 테스트 가이드

## 테스트 실행

### 모든 테스트 실행

```bash
npm test
```

### Watch 모드로 테스트 실행 (파일 변경 시 자동 재실행)

```bash
npm run test:watch
```

### 커버리지 리포트와 함께 테스트 실행

```bash
npm run test:coverage
```

## 테스트 구조

```
tests/
├── unit/                          # 유닛 테스트
│   ├── utils/
│   │   └── gitExecutor.test.ts   # Git 명령어 실행 및 파싱 테스트
│   └── services/
│       └── GitService.test.ts     # GitService 로직 테스트
└── integration/                   # 통합 테스트
    └── GitService.integration.test.ts  # 실제 Git 저장소 테스트
```

## 테스트 종류

### 1. 유닛 테스트 (Unit Tests)

각 함수와 메서드가 독립적으로 올바르게 동작하는지 검증합니다.

**gitExecutor.test.ts**

- Git 명령어 출력 파싱
- 에러 처리
- 다양한 Git 상태 처리

**GitService.test.ts**

- GitService 메서드 호출
- GitExecutor와의 상호작용
- 스피너 동작

### 2. 통합 테스트 (Integration Tests)

실제 Git 저장소를 생성하여 전체 플로우를 테스트합니다.

**GitService.integration.test.ts**

- 실제 Git 저장소 초기화
- 파일 추가, 커밋, 브랜치 생성 등
- Remote 추가/제거
- Stash 작업

## 테스트 작성 예시

### 유닛 테스트 예시

```typescript
describe("GitExecutor", () => {
  it("Git status를 올바르게 파싱해야 함", async () => {
    const mockStatusOutput = `## main...origin/main
M  src/test.ts`;

    // Mock 설정
    mockExec.mockResolvedValue({ stdout: mockStatusOutput });

    const status = await gitExecutor.status();

    expect(status.current).toBe("main");
    expect(status.modified).toContain("src/test.ts");
  });
});
```

### 통합 테스트 예시

```typescript
describe("GitService Integration", () => {
  it("파일을 커밋할 수 있어야 함", async () => {
    // 실제 파일 생성
    fs.writeFileSync("test.txt", "content");

    // Git 작업 수행
    await gitService.add(["test.txt"]);
    await gitService.commit("Test commit");

    // 결과 검증
    const log = await gitService.getLog(1);
    expect(log.latest?.message).toBe("Test commit");
  });
});
```

## 모의 객체 (Mocking)

유닛 테스트에서는 `child_process` 모듈을 모킹하여 실제 Git 명령어를 실행하지 않고 테스트합니다:

```typescript
jest.mock("child_process");

const mockExec = require("child_process").exec as jest.Mock;
mockExec.mockImplementation((cmd, options, callback) => {
  callback(null, { stdout: "mock output", stderr: "" });
});
```

## 커버리지

테스트 커버리지는 다음을 확인합니다:

- **Statements**: 각 코드 라인이 실행되었는지
- **Branches**: if/else 등 모든 분기가 테스트되었는지
- **Functions**: 모든 함수가 호출되었는지
- **Lines**: 각 라인이 테스트되었는지

커버리지 리포트는 `coverage/` 디렉토리에 생성됩니다:

- `coverage/lcov-report/index.html` - 브라우저에서 볼 수 있는 리포트

## CI/CD 통합

GitHub Actions나 다른 CI 도구에서 테스트를 실행할 수 있습니다:

```yaml
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage
```

## 주의사항

1. **통합 테스트는 느릴 수 있습니다** - 실제 Git 저장소를 생성하고 명령어를 실행하기 때문
2. **Mock 데이터는 실제 Git 출력과 일치해야 합니다** - Git 버전에 따라 출력 형식이 다를 수 있음
3. **임시 파일 정리** - 통합 테스트 후 생성된 임시 디렉토리는 자동으로 삭제됨

## 테스트 추가하기

새로운 기능을 추가할 때는 반드시 테스트를 함께 작성해주세요:

1. `tests/unit/`에 유닛 테스트 추가
2. 필요시 `tests/integration/`에 통합 테스트 추가
3. `npm test`로 모든 테스트가 통과하는지 확인

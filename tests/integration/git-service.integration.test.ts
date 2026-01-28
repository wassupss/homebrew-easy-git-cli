import { GitService } from "../../src/services/git-service";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("GitService Integration Tests", () => {
  let testDir: string;
  let gitService: GitService;
  let originalDir: string;

  beforeAll(() => {
    // 현재 디렉토리 저장
    originalDir = process.cwd();

    // 임시 디렉토리 생성
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), "git-test-"));
    process.chdir(testDir);

    // Git 저장소 초기화
    execSync("git init", { cwd: testDir });
    execSync('git config user.email "test@example.com"', { cwd: testDir });
    execSync('git config user.name "Test User"', { cwd: testDir });

    // 초기 커밋 생성 (브랜치가 제대로 생성되도록)
    fs.writeFileSync(path.join(testDir, "README.md"), "# Test Repository");
    execSync("git add README.md", { cwd: testDir });
    execSync('git commit -m "Initial commit"', { cwd: testDir });

    gitService = new GitService(testDir);
  });

  afterAll(() => {
    // 원래 디렉토리로 복귀
    process.chdir(originalDir);

    // 테스트 디렉토리 정리
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Git 저장소 확인", () => {
    it("Git 저장소로 인식되어야 함", async () => {
      const isRepo = await gitService.isGitRepository();
      expect(isRepo).toBe(true);
    });
  });

  describe("브랜치 작업", () => {
    it("현재 브랜치를 가져올 수 있어야 함", async () => {
      const branch = await gitService.getCurrentBranch();
      expect(["main", "master"]).toContain(branch);
    });

    it("브랜치를 생성하고 전환할 수 있어야 함", async () => {
      await gitService.createBranch("test-branch");
      const currentBranch = await gitService.getCurrentBranch();
      expect(currentBranch).toBe("test-branch");
    });

    it("브랜치 목록을 가져올 수 있어야 함", async () => {
      const branches = await gitService.getBranches();
      expect(branches.all.length).toBeGreaterThan(0);
      expect(["test-branch", "main", "master"]).toContain(branches.current);
    });

    it("브랜치를 전환할 수 있어야 함", async () => {
      // 먼저 사용 가능한 브랜치 목록 가져오기
      const allBranches = await gitService.getBranches();
      const mainBranch = allBranches.all.find((b) =>
        ["main", "master"].includes(b)
      );

      if (mainBranch) {
        await gitService.switchBranch(mainBranch);
        const currentBranch = await gitService.getCurrentBranch();
        expect(currentBranch).toBe(mainBranch);
      }
    });
  });

  describe("파일 추가 및 커밋", () => {
    let testFile: string;

    beforeEach(() => {
      testFile = path.join(testDir, `test-${Date.now()}.txt`);
      fs.writeFileSync(testFile, "test content");
    });

    it("파일을 스테이징할 수 있어야 함", async () => {
      const fileName = path.basename(testFile);
      await gitService.add([fileName]);

      const status = await gitService.getStatus();
      expect(status.staged).toContain(fileName);
    });

    it("모든 파일을 스테이징할 수 있어야 함", async () => {
      const file1 = path.join(testDir, "file1.txt");
      const file2 = path.join(testDir, "file2.txt");
      fs.writeFileSync(file1, "content 1");
      fs.writeFileSync(file2, "content 2");

      await gitService.addAll();

      const status = await gitService.getStatus();
      expect(status.staged.length).toBeGreaterThan(0);
    });

    it("커밋을 생성할 수 있어야 함", async () => {
      const fileName = path.basename(testFile);
      await gitService.add([fileName]);
      await gitService.commit("Test commit message");

      const log = await gitService.getLog(1);
      expect(log.latest?.message).toBe("Test commit message");
    });
  });

  describe("상태 확인", () => {
    it("Git 상태를 가져올 수 있어야 함", async () => {
      const status = await gitService.getStatus();

      expect(status).toHaveProperty("current");
      expect(status).toHaveProperty("staged");
      expect(status).toHaveProperty("modified");
      expect(status).toHaveProperty("not_added");
    });

    it("새 파일이 untracked로 표시되어야 함", async () => {
      const newFile = path.join(testDir, `new-${Date.now()}.txt`);
      fs.writeFileSync(newFile, "new content");

      const status = await gitService.getStatus();
      const fileName = path.basename(newFile);

      expect(status.not_added).toContain(fileName);
    });
  });

  describe("로그 조회", () => {
    it("커밋 로그를 가져올 수 있어야 함", async () => {
      // 테스트 커밋 생성
      const testFile = path.join(testDir, `log-test-${Date.now()}.txt`);
      fs.writeFileSync(testFile, "log test content");
      await gitService.add([path.basename(testFile)]);
      await gitService.commit("Log test commit");

      const log = await gitService.getLog(5);

      expect(log.total).toBeGreaterThan(0);
      expect(log.all.length).toBeGreaterThan(0);
      expect(log.latest).not.toBeNull();
      expect(log.latest?.message).toBe("Log test commit");
    });

    it("지정된 개수만큼 로그를 가져와야 함", async () => {
      const log = await gitService.getLog(2);
      expect(log.all.length).toBeLessThanOrEqual(2);
    });
  });

  describe("Stash 작업", () => {
    beforeEach(() => {
      // Stash 테스트를 위한 변경사항 생성
      const testFile = path.join(testDir, `stash-test-${Date.now()}.txt`);
      fs.writeFileSync(testFile, "stash test content");
      execSync(`git add .`, { cwd: testDir });
    });

    it("변경사항을 stash할 수 있어야 함", async () => {
      await gitService.stashSave("Test stash");

      const stashList = await gitService.stashList();
      expect(stashList.length).toBeGreaterThan(0);
    });

    it("stash 목록을 가져올 수 있어야 함", async () => {
      const stashList = await gitService.stashList();
      expect(Array.isArray(stashList)).toBe(true);
    });

    afterEach(() => {
      // Stash 정리
      try {
        execSync("git stash clear", { cwd: testDir });
      } catch (e) {
        // Stash가 없을 수 있음
      }
    });
  });
});

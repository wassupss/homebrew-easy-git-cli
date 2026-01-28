import { GitService } from "../../src/services/git-service";
import { ConfigService } from "../../src/services/config-service";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("Easy Git CLI Integration Tests", () => {
  let testDir: string;
  let gitService: GitService;
  let configService: ConfigService;
  let originalDir: string;

  beforeAll(() => {
    // 현재 디렉토리 저장
    originalDir = process.cwd();

    // 임시 디렉토리 생성
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), "easygit-test-"));
    process.chdir(testDir);

    // Git 저장소 초기화
    execSync("git init", { cwd: testDir });
    execSync('git config user.email "test@example.com"', { cwd: testDir });
    execSync('git config user.name "Test User"', { cwd: testDir });

    // 초기 커밋 생성
    fs.writeFileSync(path.join(testDir, "README.md"), "# Test Repository");
    execSync("git add README.md", { cwd: testDir });
    execSync('git commit -m "Initial commit"', { cwd: testDir });

    gitService = new GitService(testDir);
    configService = new ConfigService();
  });

  afterAll(() => {
    // 원래 디렉토리로 복귀
    process.chdir(originalDir);

    // 테스트 디렉토리 정리
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Git 저장소 기본 기능", () => {
    it("Git 저장소로 인식되어야 함", async () => {
      const isRepo = await gitService.isGitRepository();
      expect(isRepo).toBe(true);
    });

    it("현재 브랜치를 가져올 수 있어야 함", async () => {
      const branch = await gitService.getCurrentBranch();
      expect(["main", "master"]).toContain(branch);
    });

    it("Git 상태를 조회할 수 있어야 함", async () => {
      const status = await gitService.getStatus();
      expect(status).toBeDefined();
      expect(status.current).toBeDefined();
    });
  });

  describe("브랜치 관리", () => {
    it("새 브랜치를 생성할 수 있어야 함", async () => {
      await gitService.createBranch("feature-test");
      const currentBranch = await gitService.getCurrentBranch();
      expect(currentBranch).toBe("feature-test");
    });

    it("브랜치 목록을 가져올 수 있어야 함", async () => {
      const branches = await gitService.getBranches();
      expect(branches.all.length).toBeGreaterThan(0);
      expect(branches.current).toBe("feature-test");
    });

    it("브랜치를 전환할 수 있어야 함", async () => {
      const branches = await gitService.getBranches();
      const mainBranch = branches.all.find((b) =>
        ["main", "master"].includes(b)
      );

      if (mainBranch) {
        await gitService.switchBranch(mainBranch);
        const currentBranch = await gitService.getCurrentBranch();
        expect(currentBranch).toBe(mainBranch);
      }
    });

    it("브랜치를 삭제할 수 있어야 함", async () => {
      await gitService.deleteBranch("feature-test");
      const branches = await gitService.getBranches();
      expect(branches.all).not.toContain("feature-test");
    });
  });

  describe("파일 스테이징 및 커밋", () => {
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
      fs.writeFileSync(path.join(testDir, "file1.txt"), "content1");
      fs.writeFileSync(path.join(testDir, "file2.txt"), "content2");

      await gitService.addAll();

      const status = await gitService.getStatus();
      expect(status.staged.length).toBeGreaterThan(0);
    });

    it("커밋을 생성할 수 있어야 함", async () => {
      const fileName = path.basename(testFile);
      await gitService.add([fileName]);
      await gitService.commit("Test commit");

      const log = await gitService.getLog(1);
      expect(log.latest?.message).toBe("Test commit");
    });

    afterEach(() => {
      // 변경사항 정리
      try {
        execSync("git reset --hard HEAD", { cwd: testDir });
        execSync("git clean -fd", { cwd: testDir });
      } catch (e) {
        // 에러 무시
      }
    });
  });

  describe("커밋 로그", () => {
    it("커밋 로그를 조회할 수 있어야 함", async () => {
      const log = await gitService.getLog();

      expect(log.total).toBeGreaterThan(0);
      expect(log.all.length).toBeGreaterThan(0);
      expect(log.latest).not.toBeNull();
    });

    it("지정된 개수만큼 로그를 가져와야 함", async () => {
      const log = await gitService.getLog(1);
      expect(log.all.length).toBeLessThanOrEqual(1);
    });
  });

  describe("설정 관리", () => {
    it("기본 설정을 가져올 수 있어야 함", () => {
      const config = configService.getConfig();

      expect(config.defaultBranch).toBeDefined();
      expect(config.autoStash).toBeDefined();
      expect(config.customCommands).toBeDefined();
    });

    it("설정을 업데이트할 수 있어야 함", () => {
      configService.updateConfig({ autoStash: true });
      const config = configService.getConfig();

      expect(config.autoStash).toBe(true);
    });

    it("커스텀 커맨드를 추가할 수 있어야 함", () => {
      const customCommand = {
        name: "test-workflow",
        description: "Test workflow",
        actions: [{ type: "pull" as const }, { type: "push" as const }],
      };

      configService.addCustomCommand(customCommand);
      const config = configService.getConfig();

      expect(config.customCommands.length).toBeGreaterThan(0);
      const addedCommand = config.customCommands.find(
        (cmd) => cmd.name === "test-workflow"
      );
      expect(addedCommand).toBeDefined();
      expect(addedCommand?.name).toBe("test-workflow");
    });

    it("커스텀 커맨드를 삭제할 수 있어야 함", () => {
      const beforeCount = configService.getConfig().customCommands.length;
      configService.removeCustomCommand("test-workflow");
      const config = configService.getConfig();

      const deletedCommand = config.customCommands.find(
        (cmd) => cmd.name === "test-workflow"
      );
      expect(deletedCommand).toBeUndefined();
    });
  });

  describe("Stash 기능", () => {
    beforeEach(() => {
      // 변경사항 생성
      const testFile = path.join(testDir, `stash-test-${Date.now()}.txt`);
      fs.writeFileSync(testFile, "stash test content");
      execSync(`git add .`, { cwd: testDir });
    });

    it("변경사항을 stash할 수 있어야 함", async () => {
      await gitService.stashSave("Test stash");
      const stashList = await gitService.stashList();

      expect(stashList.length).toBeGreaterThan(0);
    });

    it("stash 목록을 조회할 수 있어야 함", async () => {
      const stashList = await gitService.stashList();
      expect(Array.isArray(stashList)).toBe(true);
    });

    afterEach(() => {
      // Stash 정리
      try {
        execSync("git stash clear", { cwd: testDir, stdio: "ignore" });
        execSync("git reset --hard HEAD", { cwd: testDir, stdio: "ignore" });
        execSync("git clean -fd", { cwd: testDir, stdio: "ignore" });
      } catch (e) {
        // 에러 무시
      }
    });
  });

  describe("전체 워크플로우", () => {
    it("일반적인 Git 워크플로우를 수행할 수 있어야 함", async () => {
      // 1. 새 브랜치 생성
      await gitService.createBranch("workflow-test");

      // 2. 파일 생성 및 스테이징
      const testFile = path.join(testDir, "workflow-test.txt");
      fs.writeFileSync(testFile, "workflow test");
      await gitService.add(["workflow-test.txt"]);

      // 3. 커밋
      await gitService.commit("Workflow test commit");

      // 4. 로그 확인
      const log = await gitService.getLog(1);
      expect(log.latest?.message).toBe("Workflow test commit");

      // 5. 브랜치 전환
      const branches = await gitService.getBranches();
      const mainBranch = branches.all.find((b) =>
        ["main", "master"].includes(b)
      );
      if (mainBranch) {
        await gitService.switchBranch(mainBranch);
      }

      // 6. 브랜치 삭제
      await gitService.deleteBranch("workflow-test", true);

      const finalBranches = await gitService.getBranches();
      expect(finalBranches.all).not.toContain("workflow-test");
    });
  });
});

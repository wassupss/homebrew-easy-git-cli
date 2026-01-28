import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

describe("Git Executor Module", () => {
  describe("기본 명령어 실행", () => {
    it("git 버전을 확인할 수 있어야 함", async () => {
      const { stdout } = await execAsync("git --version");

      expect(stdout).toContain("git version");
    });

    it("echo 명령어가 작동해야 함", async () => {
      const { stdout } = await execAsync("echo test");

      expect(stdout.trim()).toBe("test");
    });
  });

  describe("Git 명령어", () => {
    it("git help를 실행할 수 있어야 함", async () => {
      try {
        const { stdout } = await execAsync("git --help");
        expect(stdout).toContain("git");
      } catch (error: any) {
        // help는 stderr로 출력할 수도 있음
        expect(error.stderr || error.stdout).toContain("git");
      }
    });

    it("잘못된 git 명령어는 에러를 발생시켜야 함", async () => {
      await expect(execAsync("git invalid-command-xyz-123")).rejects.toThrow();
    });
  });

  describe("명령어 실행 옵션", () => {
    it("작업 디렉토리를 지정할 수 있어야 함", async () => {
      const { stdout } = await execAsync("pwd", { cwd: "/tmp" });

      expect(stdout).toContain("tmp");
    });

    it("환경 변수를 설정할 수 있어야 함", async () => {
      const { stdout } = await execAsync("echo $TEST_VAR", {
        env: { ...process.env, TEST_VAR: "test-value" },
      });

      expect(stdout.trim()).toBe("test-value");
    });
  });

  describe("에러 처리", () => {
    it("존재하지 않는 명령어는 에러를 발생시켜야 함", async () => {
      await expect(
        execAsync("command-that-absolutely-does-not-exist-xyz-123")
      ).rejects.toThrow();
    });

    it("exit code가 0이 아니면 에러를 throw해야 함", async () => {
      await expect(execAsync("exit 1")).rejects.toThrow();
    });
  });
});

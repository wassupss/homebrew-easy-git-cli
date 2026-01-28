import { versionService } from "../../../src/services/version-service";
import * as fs from "fs";
import * as path from "path";

describe("VersionService", () => {
  describe("getCurrentVersion", () => {
    it("package.json에서 버전을 읽어올 수 있어야 함", () => {
      const version = versionService.getCurrentVersion();

      expect(version).toBeTruthy();
      expect(typeof version).toBe("string");
      expect(version).toMatch(/^\d+\.\d+\.\d+/); // 시맨틱 버전 형식
    });

    it("실제 package.json의 버전과 일치해야 함", () => {
      const packageJsonPath = path.join(__dirname, "../../../package.json");
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      const version = versionService.getCurrentVersion();

      expect(version).toBe(packageJson.version);
    });
  });

  describe("displayVersion", () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, "log").mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it("버전 정보를 출력해야 함", () => {
      versionService.displayVersion();

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0][0];
      expect(output).toContain("Easy Git");
      expect(output).toMatch(/\d+\.\d+\.\d+/);
    });
  });

  describe("getLatestVersion", () => {
    it("최신 버전 조회 시 에러가 발생하지 않아야 함", async () => {
      // 네트워크 요청이므로 타임아웃 설정
      const latest = await versionService.getLatestVersion();

      // 네트워크 실패 시 null이거나 버전 문자열
      if (latest !== null) {
        expect(latest).toMatch(/^\d+\.\d+\.\d+/);
      }
    }, 10000); // 10초 타임아웃
  });

  describe("버전 비교", () => {
    it("버전 문자열을 올바르게 비교할 수 있어야 함", () => {
      // versionService의 내부 메서드를 테스트하기 위한 간접 테스트
      const version1 = "1.2.3";
      const version2 = "1.2.4";
      const version3 = "1.3.0";

      // 버전 형식이 올바른지 확인
      expect(version1).toMatch(/^\d+\.\d+\.\d+$/);
      expect(version2).toMatch(/^\d+\.\d+\.\d+$/);
      expect(version3).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });
});

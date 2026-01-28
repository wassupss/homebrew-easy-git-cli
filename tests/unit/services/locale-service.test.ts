import { localeService } from "../../../src/services/locale-service";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("LocaleService", () => {
  let testConfigPath: string;

  beforeEach(() => {
    testConfigPath = path.join(os.tmpdir(), ".easygit-test-locale.json");
    // 기존 설정 파일 삭제
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
  });

  afterEach(() => {
    // 테스트 후 정리
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
    // 기본 언어로 리셋
    localeService.setLanguage("ko");
  });

  describe("언어 설정", () => {
    it("기본 언어는 한국어여야 함", () => {
      const lang = localeService.getLanguage();
      expect(lang).toBe("ko");
    });

    it("언어를 영어로 변경할 수 있어야 함", () => {
      localeService.setLanguage("en");
      const lang = localeService.getLanguage();
      expect(lang).toBe("en");
    });

    it("언어를 한국어로 변경할 수 있어야 함", () => {
      localeService.setLanguage("en");
      localeService.setLanguage("ko");
      const lang = localeService.getLanguage();
      expect(lang).toBe("ko");
    });
  });

  describe("번역 키 조회", () => {
    it("한국어 번역 키를 조회할 수 있어야 함", () => {
      localeService.setLanguage("ko");
      const text = localeService.t("menu.welcome");
      expect(text).toBeTruthy();
      expect(typeof text).toBe("string");
    });

    it("영어 번역 키를 조회할 수 있어야 함", () => {
      localeService.setLanguage("en");
      const text = localeService.t("menu.welcome");
      expect(text).toBeTruthy();
      expect(typeof text).toBe("string");
    });

    it("중첩된 키를 조회할 수 있어야 함", () => {
      const text = localeService.t("menu.status");
      expect(text).toBeTruthy();
    });

    it("존재하지 않는 키는 키 자체를 반환해야 함", () => {
      const text = localeService.t("nonexistent.key");
      expect(text).toBe("nonexistent.key");
    });
  });

  describe("언어별 번역", () => {
    it("한국어와 영어 번역이 달라야 함", () => {
      localeService.setLanguage("ko");
      const koText = localeService.t("menu.exit");

      localeService.setLanguage("en");
      const enText = localeService.t("menu.exit");

      expect(koText).not.toBe(enText);
    });

    it("주요 메뉴 항목들이 번역되어야 함", () => {
      const keys = [
        "menu.status",
        "menu.staging",
        "menu.commit",
        "menu.push",
        "menu.pull",
        "menu.branch",
        "menu.exit",
      ];

      keys.forEach((key) => {
        const text = localeService.t(key);
        expect(text).toBeTruthy();
        expect(text).not.toBe(key);
      });
    });
  });

  describe("커스텀 커맨드 관련 번역", () => {
    it("커스텀 커맨드 관련 키들이 존재해야 함", () => {
      const keys = [
        "custom.selectAction",
        "custom.execute",
        "custom.list",
        "custom.add",
        "custom.remove",
        "custom.commandAdded",
        "custom.commandNotFound",
      ];

      keys.forEach((key) => {
        const text = localeService.t(key);
        expect(text).toBeTruthy();
        expect(text).not.toBe(key);
      });
    });
  });

  describe("에러 메시지 번역", () => {
    it("에러 관련 키들이 존재해야 함", () => {
      const keys = ["error.notGitRepo", "error.generic"];

      keys.forEach((key) => {
        const text = localeService.t(key);
        expect(text).toBeTruthy();
        expect(text).not.toBe(key);
      });
    });
  });
});

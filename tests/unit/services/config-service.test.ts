import {
  ConfigService,
  CustomCommand,
} from "../../../src/services/config-service";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("ConfigService", () => {
  let configService: ConfigService;
  const configPath = path.join(os.homedir(), ".easygit-config.json");
  let backupConfig: string | null = null;

  beforeEach(() => {
    // 기존 설정 파일 백업
    if (fs.existsSync(configPath)) {
      backupConfig = fs.readFileSync(configPath, "utf-8");
    }

    // 새로운 ConfigService 인스턴스 생성
    configService = new ConfigService();
    // 테스트를 위해 설정 초기화
    configService.resetToDefault();
  });

  afterEach(() => {
    // 백업된 설정 복원
    if (backupConfig) {
      fs.writeFileSync(configPath, backupConfig);
    } else if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
  });

  describe("기본 설정", () => {
    it("기본 설정이 올바르게 로드되어야 함", () => {
      const config = configService.getConfig();

      expect(config.defaultBranch).toBe("main");
      expect(config.autoStash).toBe(false);
      expect(config.autoPullOnBranchSwitch).toBe(true); // 기본값이 true
      expect(Array.isArray(config.customCommands)).toBe(true);
    });

    it("설정을 업데이트할 수 있어야 함", () => {
      configService.updateConfig({ defaultBranch: "develop" });
      const config = configService.getConfig();

      expect(config.defaultBranch).toBe("develop");
    });

    it("설정을 초기화할 수 있어야 함", () => {
      configService.updateConfig({ defaultBranch: "develop", autoStash: true });
      configService.resetToDefault();
      const config = configService.getConfig();

      expect(config.defaultBranch).toBe("main");
      expect(config.autoStash).toBe(false);
    });
  });

  describe("커스텀 커맨드", () => {
    const testCommand: CustomCommand = {
      name: "test-command",
      description: "Test command",
      actions: [{ type: "add", params: { all: true } }, { type: "commit" }],
    };

    it("커스텀 커맨드를 추가할 수 있어야 함", () => {
      // 먼저 초기화하여 기본 커맨드 제거
      configService.resetToDefault();
      configService.updateConfig({ customCommands: [] });

      configService.addCustomCommand(testCommand);
      const config = configService.getConfig();

      expect(config.customCommands).toHaveLength(1);
      expect(config.customCommands[0].name).toBe("test-command");
    });

    it("중복된 이름의 커맨드를 추가하면 기존 것이 제거되어야 함", () => {
      configService.updateConfig({ customCommands: [] });

      configService.addCustomCommand(testCommand);
      configService.addCustomCommand({
        ...testCommand,
        description: "Updated description",
      });

      const config = configService.getConfig();
      expect(config.customCommands).toHaveLength(1);
      expect(config.customCommands[0].description).toBe("Updated description");
    });

    it("커스텀 커맨드를 이름으로 가져올 수 있어야 함", () => {
      configService.updateConfig({ customCommands: [] });
      configService.addCustomCommand(testCommand);
      const command = configService.getCustomCommand("test-command");

      expect(command).toBeDefined();
      expect(command?.name).toBe("test-command");
    });

    it("존재하지 않는 커맨드는 undefined를 반환해야 함", () => {
      const command = configService.getCustomCommand("non-existent");
      expect(command).toBeUndefined();
    });

    it("커스텀 커맨드를 삭제할 수 있어야 함", () => {
      configService.updateConfig({ customCommands: [] });
      configService.addCustomCommand(testCommand);
      configService.removeCustomCommand("test-command");

      const config = configService.getConfig();
      expect(config.customCommands).toHaveLength(0);
    });

    it("여러 커스텀 커맨드를 관리할 수 있어야 함", () => {
      configService.updateConfig({ customCommands: [] });

      const command1 = { ...testCommand, name: "command1" };
      const command2 = { ...testCommand, name: "command2" };

      configService.addCustomCommand(command1);
      configService.addCustomCommand(command2);

      const config = configService.getConfig();
      expect(config.customCommands).toHaveLength(2);
    });
  });

  describe("설정 파일 영속성", () => {
    it("설정이 파일에 저장되어야 함", () => {
      configService.updateConfig({ defaultBranch: "develop" });

      // 새로운 인스턴스에서 동일한 설정을 로드
      const newConfigService = new ConfigService();
      const config = newConfigService.getConfig();

      expect(config.defaultBranch).toBe("develop");
    });

    it("잘못된 JSON 파일은 기본 설정으로 대체되어야 함", () => {
      // 잘못된 JSON 작성
      fs.writeFileSync(configPath, "invalid json");

      const newConfigService = new ConfigService();
      const config = newConfigService.getConfig();

      expect(config.defaultBranch).toBe("main");
    });
  });
});

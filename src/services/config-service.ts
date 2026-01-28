import fs from "fs";
import path from "path";
import os from "os";
import chalk from "chalk";

export interface CustomCommand {
  name: string;
  description: string;
  actions: CommandAction[];
}

export interface CommandAction {
  type: "add" | "commit" | "push" | "pull" | "branch" | "stash" | "custom";
  params?: any;
}

export interface EasyGitConfig {
  customCommands: CustomCommand[];
  defaultBranch: string;
  autoStash: boolean;
  autoPullOnBranchSwitch: boolean;
}

const DEFAULT_CONFIG: EasyGitConfig = {
  customCommands: [
    {
      name: "move",
      description: "브랜치 전환 후 자동으로 pull",
      actions: [
        { type: "branch", params: { action: "switch" } },
        { type: "pull" },
      ],
    },
    {
      name: "save",
      description: "add와 commit을 한번에",
      actions: [{ type: "add", params: { all: true } }, { type: "commit" }],
    },
    {
      name: "sync",
      description: "add, commit, push를 한번에",
      actions: [
        { type: "add", params: { all: true } },
        { type: "commit" },
        { type: "push" },
      ],
    },
    {
      name: "update",
      description: "stash → pull → stash pop",
      actions: [
        { type: "stash", params: { action: "save" } },
        { type: "pull" },
        { type: "stash", params: { action: "pop" } },
      ],
    },
  ],
  defaultBranch: "main",
  autoStash: false,
  autoPullOnBranchSwitch: true,
};

export class ConfigService {
  private configPath: string;
  private config: EasyGitConfig;

  constructor() {
    this.configPath = path.join(os.homedir(), ".easy-git-config.json");
    this.config = this.loadConfig();
  }

  private loadConfig(): EasyGitConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, "utf-8");
        const userConfig = JSON.parse(data);
        return { ...DEFAULT_CONFIG, ...userConfig };
      }
    } catch (error) {
      console.log(
        chalk.yellow(
          "⚠️  설정 파일을 읽는데 실패했습니다. 기본 설정을 사용합니다."
        )
      );
    }
    return DEFAULT_CONFIG;
  }

  public saveConfig(): void {
    try {
      fs.writeFileSync(
        this.configPath,
        JSON.stringify(this.config, null, 2),
        "utf-8"
      );
      console.log(chalk.green(`✅ 설정이 저장되었습니다: ${this.configPath}`));
    } catch (error: any) {
      console.error(chalk.red(`❌ 설정 저장 실패: ${error.message}`));
    }
  }

  public getConfig(): EasyGitConfig {
    return this.config;
  }

  public updateConfig(updates: Partial<EasyGitConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  public addCustomCommand(command: CustomCommand): void {
    // 중복 제거: 같은 이름의 커맨드가 있으면 모두 제거
    this.config.customCommands = this.config.customCommands.filter(
      (cmd) => cmd.name !== command.name
    );

    // 새 커맨드 추가
    this.config.customCommands.push(command);
    console.log(
      chalk.green(`✅ 커스텀 커맨드 '${command.name}'이 추가되었습니다.`)
    );

    this.saveConfig();
  }

  public removeCustomCommand(name: string): void {
    const initialLength = this.config.customCommands.length;
    this.config.customCommands = this.config.customCommands.filter(
      (cmd) => cmd.name !== name
    );

    if (this.config.customCommands.length < initialLength) {
      console.log(chalk.green(`✅ 커스텀 커맨드 '${name}'이 삭제되었습니다.`));
      this.saveConfig();
    } else {
      console.log(
        chalk.yellow(`⚠️  커스텀 커맨드 '${name}'을 찾을 수 없습니다.`)
      );
    }
  }

  public getCustomCommand(name: string): CustomCommand | undefined {
    return this.config.customCommands.find((cmd) => cmd.name === name);
  }

  public resetToDefault(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.saveConfig();
    console.log(chalk.green("✅ 설정이 기본값으로 초기화되었습니다."));
  }
}

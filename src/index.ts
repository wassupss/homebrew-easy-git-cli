#!/usr/bin/env node

import inquirer from "inquirer";
import chalk from "chalk";
import boxen from "boxen";
import { GitService } from "./services/git-service";
import { ConfigService } from "./services/config-service";
import { displayStatus } from "./commands/status";
import { handleAdd } from "./commands/add";
import { handleCommit } from "./commands/commit";
import { handlePush } from "./commands/push";
import { handlePull } from "./commands/pull";
import { handleBranch } from "./commands/branch";
import { handleLog } from "./commands/log";
import { handleStash } from "./commands/stash";
import { handleRemote } from "./commands/remote";
import { handleClone } from "./commands/clone";
import { handleCustomCommands, executeCustomCommand } from "./commands/custom";
import { handlePR } from "./commands/pr";
import { handleRebase } from "./commands/rebase";

const gitService = new GitService();
const configService = new ConfigService();

async function displayWelcome() {
  const welcome = boxen(
    chalk.bold.cyan("Easy Git") +
      "\n\n" +
      chalk.gray("Git을 더 쉽게 사용하세요!"),
    {
      padding: 1,
      margin: 1,
      borderStyle: "round",
      borderColor: "cyan",
    }
  );
  console.log(welcome);
}

async function showMainMenu(): Promise<void> {
  try {
    // Git 저장소 확인
    const isRepo = await gitService.isGitRepository();

    if (!isRepo) {
      console.log(chalk.red("❌ Git 저장소가 아닙니다."));
      const { action } = await inquirer.prompt([
        {
          type: "list",
          name: "action",
          message: "어떻게 하시겠습니까?",
          choices: [
            { name: "새 Git 저장소 초기화", value: "init" },
            { name: "종료", value: "exit" },
          ],
        },
      ]);

      if (action === "init") {
        await gitService.init();
        console.log(chalk.green("✅ Git 저장소가 초기화되었습니다."));
        return showMainMenu();
      } else {
        return;
      }
    }

    // 현재 브랜치 정보 표시
    const currentBranch = await gitService.getCurrentBranch();
    console.log(chalk.blue(`\n📍 현재 브랜치: ${chalk.bold(currentBranch)}\n`));

    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "무엇을 하시겠습니까?",
        choices: [
          { name: "📊 상태 확인 (Status)", value: "status" },
          { name: "➕ 파일 추가 (Add)", value: "add" },
          { name: "💾 커밋 (Commit)", value: "commit" },
          { name: "⬆️  푸시 (Push)", value: "push" },
          { name: "⬇️  풀 (Pull)", value: "pull" },
          { name: "🌿 브랜치 관리", value: "branch" },
          { name: "🔄 Rebase", value: "rebase" },
          { name: "📜 로그 보기", value: "log" },
          { name: "📦 Stash 관리", value: "stash" },
          { name: "🌐 Remote 관리", value: "remote" },
          { name: "🔀 Pull Request 생성", value: "pr" },
          new inquirer.Separator(),
          { name: "⚡ 커스텀 커맨드", value: "custom" },
          new inquirer.Separator(),
          { name: "🚪 종료", value: "exit" },
        ],
        pageSize: 15,
      },
    ]);

    switch (action) {
      case "status":
        await displayStatus(gitService);
        break;
      case "add":
        await handleAdd(gitService);
        break;
      case "commit":
        await handleCommit(gitService);
        break;
      case "push":
        await handlePush(gitService);
        break;
      case "pull":
        await handlePull(gitService);
        break;
      case "branch":
        await handleBranch(gitService);
        break;
      case "rebase":
        await handleRebase(gitService);
        break;
      case "log":
        await handleLog(gitService);
        break;
      case "stash":
        await handleStash(gitService);
        break;
      case "remote":
        await handleRemote(gitService);
        break;
      case "pr":
        await handlePR(gitService);
        break;
      case "custom":
        await handleCustomCommands(gitService, configService);
        break;
      case "exit":
        console.log(chalk.cyan("\n👋 안녕히 가세요!\n"));
        return;
    }

    // 메뉴로 돌아가기
    const { continueAction } = await inquirer.prompt([
      {
        type: "confirm",
        name: "continueAction",
        message: "메인 메뉴로 돌아가시겠습니까?",
        default: true,
      },
    ]);

    if (continueAction) {
      return showMainMenu();
    }
  } catch (error: any) {
    console.error(chalk.red(`\n❌ 오류: ${error.message}\n`));
    const { retry } = await inquirer.prompt([
      {
        type: "confirm",
        name: "retry",
        message: "다시 시도하시겠습니까?",
        default: true,
      },
    ]);
    if (retry) {
      return showMainMenu();
    }
  }
}

async function main() {
  const args = process.argv.slice(2);

  // eg clone 처리
  if (args[0] === "clone") {
    await handleClone();
    return;
  }

  // eg <custom-command> 처리
  if (args.length > 0) {
    const commandName = args[0];
    const customCommand = configService.getCustomCommand(commandName);

    if (customCommand) {
      const isRepo = await gitService.isGitRepository();
      if (!isRepo) {
        console.log(chalk.red("❌ Git 저장소가 아닙니다."));
        console.log(chalk.yellow("Git 저장소 디렉토리에서 실행해주세요."));
        return;
      }

      await executeCustomCommand(commandName, gitService, configService);
      return;
    } else {
      console.log(chalk.red(`❌ 알 수 없는 명령어: ${commandName}`));
      console.log(chalk.gray("사용 가능한 명령어:"));
      console.log(chalk.white("  eg              - 인터랙티브 메뉴"));
      console.log(chalk.white("  eg clone        - 저장소 클론"));

      const config = configService.getConfig();
      if (config.customCommands.length > 0) {
        console.log(chalk.white("\n커스텀 명령어:"));
        config.customCommands.forEach((cmd) => {
          console.log(
            chalk.cyan(`  eg ${cmd.name.padEnd(12)} - ${cmd.description}`)
          );
        });
      }
      return;
    }
  }

  // 기본 인터랙티브 모드
  await displayWelcome();
  await showMainMenu();
}

main();

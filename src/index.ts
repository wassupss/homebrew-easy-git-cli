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
import { handleRollback } from "./commands/rollback";
import { localeService } from "./services/locale-service";

const gitService = new GitService();
const configService = new ConfigService();

async function displayWelcome() {
  const welcome = boxen(
    chalk.bold.cyan("Easy Git") +
      "\n\n" +
      chalk.gray(localeService.t("menu.welcome")),
    {
      padding: 1,
      margin: 1,
      borderStyle: "round",
      borderColor: "cyan",
    }
  );
  console.log(welcome);
}

async function handleLanguageSettings(): Promise<void> {
  const currentLang = localeService.getLanguage();

  const { language } = await inquirer.prompt([
    {
      type: "list",
      name: "language",
      message: localeService.t("language.select"),
      choices: [
        {
          name: `${localeService.t("language.korean")} ${
            currentLang === "ko" ? "✓" : ""
          }`,
          value: "ko",
        },
        {
          name: `${localeService.t("language.english")} ${
            currentLang === "en" ? "✓" : ""
          }`,
          value: "en",
        },
      ],
    },
  ]);

  if (language !== currentLang) {
    localeService.setLanguage(language);
    console.log(chalk.green(`\n✅ ${localeService.t("language.changed")}\n`));
  }
}

async function showMainMenu(): Promise<void> {
  try {
    // Git 저장소 확인
    const isRepo = await gitService.isGitRepository();

    if (!isRepo) {
      console.log(chalk.red(`❌ ${localeService.t("error.notGitRepo")}`));
      const { action } = await inquirer.prompt([
        {
          type: "list",
          name: "action",
          message: localeService.t("menu.whatToDo"),
          choices: [
            { name: localeService.t("menu.initRepo"), value: "init" },
            { name: localeService.t("menu.exit"), value: "exit" },
          ],
        },
      ]);

      if (action === "init") {
        await gitService.init();
        console.log(chalk.green(`✅ ${localeService.t("init.success")}`));
        return showMainMenu();
      } else {
        return;
      }
    }

    // 현재 브랜치 정보 표시
    const currentBranch = await gitService.getCurrentBranch();
    console.log(
      chalk.blue(
        `\n📍 ${localeService.t("menu.currentBranch")}: ${chalk.bold(
          currentBranch
        )}\n`
      )
    );

    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: localeService.t("menu.whatToDo"),
        loop: false,
        choices: [
          { name: localeService.t("menu.status"), value: "status" },
          { name: localeService.t("menu.staging"), value: "staging" },
          { name: localeService.t("menu.commit"), value: "commit" },
          { name: localeService.t("menu.push"), value: "push" },
          { name: localeService.t("menu.pull"), value: "pull" },
          { name: localeService.t("menu.branch"), value: "branch" },
          { name: localeService.t("menu.rebase"), value: "rebase" },
          { name: localeService.t("menu.rollback"), value: "rollback" },
          { name: localeService.t("menu.stash"), value: "stash" },
          { name: localeService.t("menu.remote"), value: "remote" },
          { name: localeService.t("menu.pr"), value: "pr" },
          new inquirer.Separator(),
          { name: localeService.t("menu.custom"), value: "custom" },
          { name: localeService.t("menu.language"), value: "language" },
          new inquirer.Separator(),
          { name: localeService.t("menu.exit"), value: "exit" },
        ],
        pageSize: 15,
      },
    ]);

    switch (action) {
      case "status":
        await displayStatus(gitService);
        break;
      case "staging":
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
      case "rollback":
        await handleRollback(gitService);
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
      case "language":
        await handleLanguageSettings();
        break;
      case "exit":
        console.log(chalk.cyan(`\n👋 ${localeService.t("menu.goodbye")}\n`));
        return;
    }

    // 자동으로 메인 메뉴로 돌아가기 (확인 프롬프트 제거)
    return showMainMenu();
  } catch (error: any) {
    console.error(
      chalk.red(`\n❌ ${localeService.t("error.generic")}: ${error.message}\n`)
    );
    const { retry } = await inquirer.prompt([
      {
        type: "confirm",
        name: "retry",
        message: localeService.t("error.retry"),
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
        console.log(chalk.red(`❌ ${localeService.t("error.notGitRepo")}`));
        console.log(chalk.yellow(localeService.t("error.runInGitRepo")));
        return;
      }

      await executeCustomCommand(commandName, gitService, configService);
      return;
    } else {
      console.log(
        chalk.red(
          `❌ ${localeService.t("error.unknownCommand")}: ${commandName}`
        )
      );
      console.log(chalk.gray(localeService.t("cli.availableCommands")));
      console.log(
        chalk.white(
          `  eg              - ${localeService.t("cli.interactiveMode")}`
        )
      );
      console.log(
        chalk.white(`  eg clone        - ${localeService.t("cli.cloneRepo")}`)
      );

      const config = configService.getConfig();
      if (config.customCommands.length > 0) {
        console.log(chalk.white(`\n${localeService.t("cli.customCommands")}:`));
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

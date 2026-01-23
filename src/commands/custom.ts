import inquirer from "inquirer";
import chalk from "chalk";
import { GitService } from "../services/git-service";
import { ConfigService, CustomCommand } from "../services/config-service";
import { displayStatus } from "./status";
import { handleAdd } from "./add";
import { handleCommit } from "./commit";
import { handlePush } from "./push";
import { handlePull } from "./pull";
import { handleStash } from "./stash";
import { handleRebase } from "./rebase";
import { handleRollback } from "./rollback";
import { handleBranch } from "./branch";
import { handlePR } from "./pr";
import { localeService } from "../services/locale-service";

export async function executeCustomCommand(
  commandName: string,
  gitService: GitService,
  configService: ConfigService
): Promise<void> {
  const command = configService.getCustomCommand(commandName);

  if (!command) {
    console.log(
      chalk.red(
        `❌ ${localeService.t("custom.commandNotFound")} '${commandName}'`
      )
    );
    return;
  }

  console.log(
    chalk.cyan(`\n🚀 ${localeService.t("custom.executing")} ${command.name}`)
  );
  console.log(chalk.gray(`   ${command.description}\n`));

  try {
    for (const action of command.actions) {
      await executeAction(action, gitService, configService);
    }
    console.log(
      chalk.green(
        `\n✅ '${command.name}'${localeService.t("custom.completed")}`
      )
    );
  } catch (error: any) {
    console.error(
      chalk.red(
        `\n❌ ${localeService.t("custom.executionError")} ${error.message}`
      )
    );
  }
}

async function executeAction(
  action: any,
  gitService: GitService,
  configService: ConfigService
): Promise<void> {
  switch (action.type) {
    case "status":
      await displayStatus(gitService);
      break;

    case "add":
      if (action.params?.all) {
        await gitService.addAll();
        console.log(
          chalk.green(`✅ ${localeService.t("custom.allFilesAdded")}`)
        );
      } else {
        await handleAdd(gitService);
      }
      break;

    case "commit":
      await handleCommit(gitService);
      break;

    case "create-commit":
      if (action.params?.message) {
        await gitService.commit(action.params.message);
        console.log(
          chalk.green(`✅ ${localeService.t("custom.commitCreated")}`)
        );
      } else {
        const { message } = await inquirer.prompt([
          {
            type: "input",
            name: "message",
            message: localeService.t("commit.enterMessage"),
            validate: (input) =>
              input.trim() ? true : localeService.t("commit.messageRequired"),
          },
        ]);
        await gitService.commit(message);
        console.log(
          chalk.green(`✅ ${localeService.t("custom.commitCreated")}`)
        );
      }
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

    case "branch-switch":
      if (action.params?.name) {
        await gitService.switchBranch(action.params.name);
      } else {
        await promptAndSwitchBranch(gitService);
      }
      break;

    case "branch-create":
      if (action.params?.name) {
        await gitService.createBranch(action.params.name);
        console.log(
          chalk.green(
            `✅ ${localeService.t("custom.branchCreated")}: ${
              action.params.name
            }`
          )
        );
      }
      break;

    case "branch-delete":
      if (action.params?.name) {
        await gitService.deleteBranch(
          action.params.name,
          action.params?.force || false
        );
        console.log(
          chalk.green(
            `✅ ${localeService.t("custom.branchDeleted")}: ${
              action.params.name
            }`
          )
        );
      }
      break;

    case "stash":
      await handleStash(gitService);
      break;

    case "stash-save":
      if (action.params?.message) {
        await gitService.stashSave(action.params.message);
      } else {
        await gitService.stashSave();
      }
      console.log(chalk.green(`✅ ${localeService.t("custom.stashSaved")}`));
      break;

    case "stash-pop":
      await gitService.stashPop();
      console.log(chalk.green(`✅ ${localeService.t("custom.stashPopped")}`));
      break;

    case "stash-list":
      const stashList = await gitService.stashList();
      if (stashList.length === 0) {
        console.log(chalk.yellow(localeService.t("stash.empty")));
      } else {
        console.log(chalk.cyan.bold(`\n${localeService.t("stash.list")}\n`));
        stashList.forEach((stash: any) => {
          console.log(chalk.white(`${stash.index}: ${stash.message}`));
        });
      }
      break;

    case "stash-drop":
      if (action.params?.index !== undefined) {
        await gitService.stashDrop(action.params.index);
        console.log(
          chalk.green(`✅ ${localeService.t("custom.stashDropped")}`)
        );
      }
      break;

    case "stash-clear":
      await gitService.stashClear();
      console.log(chalk.green(`✅ ${localeService.t("custom.stashCleared")}`));
      break;

    case "rebase":
      await handleRebase(gitService);
      break;

    case "rebase-branch":
      if (action.params?.branch) {
        await gitService.rebase(action.params.branch);
        console.log(
          chalk.green(`✅ ${localeService.t("custom.rebaseComplete")}`)
        );
      }
      break;

    case "revert":
      if (action.params?.commitHash) {
        await gitService.revert(action.params.commitHash);
        console.log(
          chalk.green(`✅ ${localeService.t("custom.revertComplete")}`)
        );
      }
      break;

    case "reset":
      if (action.params?.type === "soft") {
        await gitService.resetSoft(action.params?.commitHash);
      } else if (action.params?.type === "mixed") {
        await gitService.resetMixed(action.params?.commitHash);
      } else if (action.params?.type === "hard") {
        await gitService.resetHard(action.params?.commitHash);
      }
      console.log(chalk.green(`✅ ${localeService.t("custom.resetComplete")}`));
      break;

    case "discard":
      if (action.params?.files && action.params.files.length > 0) {
        await gitService.discardChanges(action.params.files);
        console.log(
          chalk.green(`✅ ${localeService.t("custom.discardComplete")}`)
        );
      }
      break;

    case "rollback":
      await handleRollback(gitService);
      break;

    case "branch-management":
      await handleBranch(gitService);
      break;

    case "pr":
      await handlePR(gitService);
      break;

    case "merge":
      if (action.params?.branch) {
        await gitService.merge(
          action.params.branch,
          action.params?.noFf || false
        );
        console.log(
          chalk.green(`✅ ${localeService.t("custom.mergeComplete")}`)
        );
      }
      break;

    case "fetch":
      await gitService.fetchAll();
      console.log(chalk.green(`✅ ${localeService.t("custom.fetchComplete")}`));
      break;

    case "create-branch":
      if (action.params?.name) {
        await gitService.createBranch(action.params.name);
        console.log(
          chalk.green(
            `✅ ${localeService.t("custom.branchCreated")}: ${
              action.params.name
            }`
          )
        );
      }
      break;

    case "delete-branch":
      if (action.params?.name) {
        await gitService.deleteBranch(
          action.params.name,
          action.params?.force || false
        );
        console.log(
          chalk.green(
            `✅ ${localeService.t("custom.branchDeleted")}: ${
              action.params.name
            }`
          )
        );
      }
      break;

    case "tag":
      if (action.params?.name) {
        await gitService.createTag(action.params.name, action.params?.message);
        console.log(
          chalk.green(
            `✅ ${localeService.t("custom.tagCreated")}: ${action.params.name}`
          )
        );
      }
      break;

    default:
      console.log(
        chalk.yellow(
          `⚠️  ${localeService.t("custom.unknownAction")} ${action.type}`
        )
      );
  }
}

async function promptAndSwitchBranch(gitService: GitService): Promise<void> {
  const branches = await gitService.getBranches();
  const branchList = Object.keys(branches.branches).filter(
    (name) => !branches.branches[name].current
  );

  if (branchList.length === 0) {
    console.log(chalk.yellow(localeService.t("custom.noOtherBranches")));
    return;
  }

  const { selectedBranch } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedBranch",
      message: localeService.t("custom.selectBranch"),
      choices: branchList,
    },
  ]);

  const config = new ConfigService().getConfig();

  if (config.autoPullOnBranchSwitch) {
    await gitService.switchBranchWithPull(selectedBranch);
  } else {
    await gitService.switchBranch(selectedBranch);
  }
}

export async function handleCustomCommands(
  gitService: GitService,
  configService: ConfigService
): Promise<void> {
  while (true) {
    const config = configService.getConfig();

    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: localeService.t("custom.selectAction"),
        choices: [
          { name: localeService.t("custom.execute"), value: "execute" },
          { name: localeService.t("custom.list"), value: "list" },
          { name: localeService.t("custom.add"), value: "add" },
          { name: localeService.t("custom.remove"), value: "remove" },
          { name: localeService.t("custom.settings"), value: "settings" },
          { name: localeService.t("custom.reset"), value: "reset" },
          { name: localeService.t("common.back"), value: "back" },
        ],
      },
    ]);

    if (action === "back") {
      return;
    }

    switch (action) {
      case "execute":
        await executeCustomCommandInteractive(gitService, configService);
        break;
      case "list":
        showCustomCommandsList(configService);
        break;
      case "add":
        await addCustomCommand(configService);
        break;
      case "remove":
        await removeCustomCommand(configService);
        break;
      case "settings":
        showSettings(configService);
        break;
      case "reset":
        await resetSettings(configService);
        break;
    }
  }
}

async function executeCustomCommandInteractive(
  gitService: GitService,
  configService: ConfigService
): Promise<void> {
  const config = configService.getConfig();

  if (config.customCommands.length === 0) {
    console.log(chalk.yellow(localeService.t("custom.noCommands")));
    return;
  }

  const { selectedCommand } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedCommand",
      message: localeService.t("custom.selectToExecute"),
      choices: config.customCommands.map((cmd) => ({
        name: `${cmd.name} - ${cmd.description}`,
        value: cmd.name,
      })),
    },
  ]);

  await executeCustomCommand(selectedCommand, gitService, configService);
}

function showCustomCommandsList(configService: ConfigService): void {
  const config = configService.getConfig();

  console.log(chalk.cyan.bold(`\n${localeService.t("custom.listTitle")}\n`));

  if (config.customCommands.length === 0) {
    console.log(chalk.yellow(localeService.t("custom.noCommands")));
    return;
  }

  config.customCommands.forEach((cmd, index) => {
    console.log(chalk.green(`${index + 1}. ${cmd.name}`));
    console.log(
      chalk.gray(
        `   ${localeService.t("custom.description")} ${cmd.description}`
      )
    );
    console.log(
      chalk.gray(
        `   ${localeService.t("custom.actions")} ${cmd.actions
          .map((a) => a.type)
          .join(" → ")}`
      )
    );
    console.log();
  });
}

async function addCustomCommand(configService: ConfigService): Promise<void> {
  console.log(chalk.cyan(`\n${localeService.t("custom.addTitle")}\n`));
  console.log(chalk.gray(`${localeService.t("custom.addUsage")}\n`));

  const { name, description } = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: localeService.t("custom.enterName"),
      validate: (input) => {
        if (!input.trim()) return localeService.t("custom.nameRequired");
        if (!/^[a-z0-9-]+$/.test(input))
          return localeService.t("custom.nameInvalid");
        return true;
      },
    },
    {
      type: "input",
      name: "description",
      message: localeService.t("custom.enterDescription"),
      validate: (input) =>
        input.trim() ? true : localeService.t("custom.descriptionRequired"),
    },
  ]);

  const actions: any[] = [];
  let addMore = true;

  while (addMore) {
    const { actionType } = await inquirer.prompt([
      {
        type: "list",
        name: "actionType",
        message: `${localeService.t("custom.selectActionType")} ${
          actions.length + 1
        }`,
        choices: [
          { name: "📊 상태 보기", value: "status" },
          { name: "➕ 파일 추가", value: "add" },
          { name: "📝 커밋 메뉴", value: "commit" },
          { name: "💾 커밋 생성", value: "create-commit" },
          { name: "⬆️  푸시", value: "push" },
          { name: "⬇️  풀", value: "pull" },
          { name: "🌿 브랜치 메뉴", value: "branch" },
          { name: "🔀 브랜치 전환", value: "branch-switch" },
          { name: "➕ 브랜치 생성", value: "branch-create" },
          { name: "🗑️  브랜치 삭제", value: "branch-delete" },
          { name: "📦 스태시 메뉴", value: "stash" },
          { name: "💾 스태시 저장", value: "stash-save" },
          { name: "📤 스태시 복원", value: "stash-pop" },
          { name: "📋 스태시 목록", value: "stash-list" },
          { name: "🗑️  스태시 삭제", value: "stash-drop" },
          { name: "🧹 스태시 전체삭제", value: "stash-clear" },
          { name: "🔄 리베이스 메뉴", value: "rebase" },
          { name: "🔄 리베이스 실행", value: "rebase-branch" },
          { name: "↩️  커밋 되돌리기", value: "revert" },
          { name: "🔙 리셋", value: "reset" },
          { name: "🗑️  변경사항 버리기", value: "discard" },
          { name: "🔀 병합", value: "merge" },
          { name: "📥 페치", value: "fetch" },
          { name: "🏷️  태그 생성", value: "tag" },
          { name: "🔧 PR 메뉴", value: "pr" },
          { name: "⏮️  롤백 메뉴", value: "rollback" },
          { name: "🌳 브랜치 관리 메뉴", value: "branch-management" },
        ],
      },
    ]);

    if (actionType === "add") {
      const { addAll } = await inquirer.prompt([
        {
          type: "confirm",
          name: "addAll",
          message: localeService.t("custom.addAllFiles"),
          default: true,
        },
      ]);
      actions.push({ type: "add", params: { all: addAll } });
    } else if (actionType === "create-commit") {
      const { commitMessage } = await inquirer.prompt([
        {
          type: "input",
          name: "commitMessage",
          message: "커밋 메시지를 입력하세요:",
          validate: (input) =>
            input.trim() ? true : "커밋 메시지는 필수입니다",
        },
      ]);
      actions.push({
        type: "create-commit",
        params: { message: commitMessage },
      });
    } else if (actionType === "commit") {
      actions.push({ type: "commit" });
    } else if (actionType === "stash-save") {
      const { stashMessage } = await inquirer.prompt([
        {
          type: "input",
          name: "stashMessage",
          message: "스태시 메시지 (선택사항):",
        },
      ]);
      actions.push({
        type: "stash-save",
        params: stashMessage ? { message: stashMessage } : {},
      });
    } else if (actionType === "stash-pop") {
      actions.push({ type: "stash-pop" });
    } else if (actionType === "stash-list") {
      actions.push({ type: "stash-list" });
    } else if (actionType === "stash-drop") {
      const { stashIndex } = await inquirer.prompt([
        {
          type: "input",
          name: "stashIndex",
          message: "삭제할 스태시 인덱스:",
          validate: (input) => {
            const num = parseInt(input);
            return !isNaN(num) && num >= 0
              ? true
              : "유효한 인덱스를 입력하세요";
          },
        },
      ]);
      actions.push({
        type: "stash-drop",
        params: { index: parseInt(stashIndex) },
      });
    } else if (actionType === "stash-clear") {
      actions.push({ type: "stash-clear" });
    } else if (actionType === "stash") {
      actions.push({ type: "stash" });
    } else if (actionType === "branch-switch") {
      const { branchName } = await inquirer.prompt([
        {
          type: "input",
          name: "branchName",
          message: "전환할 브랜치 이름 (비워두면 선택 메뉴):",
        },
      ]);
      actions.push({
        type: "branch-switch",
        params: branchName ? { name: branchName } : {},
      });
    } else if (actionType === "branch-create") {
      const { branchName } = await inquirer.prompt([
        {
          type: "input",
          name: "branchName",
          message: "생성할 브랜치 이름:",
          validate: (input) =>
            input.trim() ? true : "브랜치 이름은 필수입니다",
        },
      ]);
      actions.push({ type: "branch-create", params: { name: branchName } });
    } else if (actionType === "branch-delete") {
      const { branchName } = await inquirer.prompt([
        {
          type: "input",
          name: "branchName",
          message: "삭제할 브랜치 이름:",
          validate: (input) =>
            input.trim() ? true : "브랜치 이름은 필수입니다",
        },
      ]);
      const { force } = await inquirer.prompt([
        {
          type: "confirm",
          name: "force",
          message: "강제 삭제하시겠습니까?",
          default: false,
        },
      ]);
      actions.push({
        type: "branch-delete",
        params: { name: branchName, force },
      });
    } else if (actionType === "branch") {
      actions.push({ type: "branch" });
    } else if (actionType === "rebase-branch") {
      const { targetBranch } = await inquirer.prompt([
        {
          type: "input",
          name: "targetBranch",
          message: localeService.t("custom.enterTargetBranch"),
          default: "main",
        },
      ]);
      actions.push({ type: "rebase-branch", params: { branch: targetBranch } });
    } else if (actionType === "rebase") {
      actions.push({ type: "rebase" });
    } else if (actionType === "revert") {
      const { commitHash } = await inquirer.prompt([
        {
          type: "input",
          name: "commitHash",
          message: localeService.t("custom.enterCommitHash"),
          validate: (input) =>
            input.trim() ? true : localeService.t("custom.commitHashRequired"),
        },
      ]);
      actions.push({ type: "revert", params: { commitHash } });
    } else if (actionType === "reset") {
      const { resetType } = await inquirer.prompt([
        {
          type: "list",
          name: "resetType",
          message: localeService.t("custom.selectResetType"),
          choices: [
            { name: localeService.t("custom.resetSoft"), value: "soft" },
            { name: localeService.t("custom.resetMixed"), value: "mixed" },
            { name: localeService.t("custom.resetHard"), value: "hard" },
          ],
        },
      ]);
      actions.push({ type: "reset", params: { type: resetType } });
    } else if (actionType === "discard") {
      const { discardType } = await inquirer.prompt([
        {
          type: "list",
          name: "discardType",
          message: localeService.t("custom.selectDiscardType"),
          choices: [
            { name: localeService.t("custom.discardAll"), value: "all" },
            {
              name: localeService.t("custom.discardTracked"),
              value: "tracked",
            },
          ],
        },
      ]);
      actions.push({
        type: "discard",
        params: { type: discardType, files: [] },
      });
    } else if (actionType === "merge") {
      const { branchName } = await inquirer.prompt([
        {
          type: "input",
          name: "branchName",
          message: localeService.t("custom.enterMergeBranch"),
          validate: (input) =>
            input.trim() ? true : localeService.t("custom.branchRequired"),
        },
      ]);
      const { noFf } = await inquirer.prompt([
        {
          type: "confirm",
          name: "noFf",
          message: localeService.t("custom.useNoFf"),
          default: false,
        },
      ]);
      actions.push({ type: "merge", params: { branch: branchName, noFf } });
    } else if (actionType === "fetch") {
      actions.push({ type: "fetch" });
    } else if (actionType === "tag") {
      const { tagName, tagMessage } = await inquirer.prompt([
        {
          type: "input",
          name: "tagName",
          message: localeService.t("custom.enterTagName"),
          validate: (input) =>
            input.trim() ? true : localeService.t("custom.tagRequired"),
        },
        {
          type: "input",
          name: "tagMessage",
          message: localeService.t("custom.enterTagMessage"),
        },
      ]);
      actions.push({
        type: "tag",
        params: { name: tagName, message: tagMessage || undefined },
      });
    } else if (actionType === "pr") {
      actions.push({ type: "pr" });
    } else if (actionType === "rollback") {
      actions.push({ type: "rollback" });
    } else if (actionType === "branch-management") {
      actions.push({ type: "branch-management" });
    } else {
      actions.push({ type: actionType });
    }

    const { continue: continueAdding } = await inquirer.prompt([
      {
        type: "confirm",
        name: "continue",
        message: localeService.t("custom.addMoreActions"),
        default: false,
      },
    ]);

    addMore = continueAdding;
  }

  const newCommand: CustomCommand = { name, description, actions };
  configService.addCustomCommand(newCommand);

  console.log(
    chalk.green(`\n✅ '${name}'${localeService.t("custom.commandAdded")}`)
  );
  console.log(chalk.cyan(`${localeService.t("custom.commandUsage")} ${name}`));
}

async function removeCustomCommand(
  configService: ConfigService
): Promise<void> {
  const config = configService.getConfig();

  if (config.customCommands.length === 0) {
    console.log(chalk.yellow(localeService.t("custom.noCommandsToDelete")));
    return;
  }

  const { selectedCommand } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedCommand",
      message: localeService.t("custom.selectToDelete"),
      choices: config.customCommands.map((cmd) => ({
        name: `${cmd.name} - ${cmd.description}`,
        value: cmd.name,
      })),
    },
  ]);

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `'${selectedCommand}' ${localeService.t(
        "custom.confirmDelete"
      )}`,
      default: false,
    },
  ]);

  if (confirm) {
    configService.removeCustomCommand(selectedCommand);
  } else {
    console.log(chalk.yellow(localeService.t("common.cancelled")));
  }
}

function showSettings(configService: ConfigService): void {
  const config = configService.getConfig();

  console.log(
    chalk.cyan.bold(`\n${localeService.t("custom.settingsTitle")}\n`)
  );
  console.log(
    chalk.white(
      `${localeService.t("custom.defaultBranch")} ${chalk.bold(
        config.defaultBranch
      )}`
    )
  );
  console.log(
    chalk.white(
      `${localeService.t("custom.autoStash")} ${
        config.autoStash ? chalk.green("ON") : chalk.gray("OFF")
      }`
    )
  );
  console.log(
    chalk.white(
      `${localeService.t("custom.autoPull")} ${
        config.autoPullOnBranchSwitch ? chalk.green("ON") : chalk.gray("OFF")
      }`
    )
  );
  console.log(
    chalk.white(
      `${localeService.t("custom.commandCount")} ${chalk.bold(
        config.customCommands.length
      )}`
    )
  );
  console.log();
}

async function resetSettings(configService: ConfigService): Promise<void> {
  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: localeService.t("custom.confirmReset"),
      default: false,
    },
  ]);

  if (confirm) {
    configService.resetToDefault();
  } else {
    console.log(chalk.yellow(localeService.t("common.cancelled")));
  }
}

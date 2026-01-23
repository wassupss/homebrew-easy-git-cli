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
      if (action.params?.message) {
        await gitService.commit(action.params.message);
      } else {
        await handleCommit(gitService);
      }
      break;

    case "push":
      await handlePush(gitService);
      break;

    case "pull":
      await handlePull(gitService);
      break;

    case "branch":
      if (action.params?.action === "switch" && action.params?.name) {
        await gitService.switchBranch(action.params.name);
      } else if (action.params?.action === "switch") {
        await promptAndSwitchBranch(gitService);
      }
      break;

    case "stash":
      if (action.params?.action === "save") {
        await gitService.stashSave(action.params?.message);
        console.log(chalk.green(`✅ ${localeService.t("custom.stashSaved")}`));
      } else if (action.params?.action === "pop") {
        await gitService.stashPop();
        console.log(chalk.green(`✅ ${localeService.t("custom.stashPopped")}`));
      } else {
        await handleStash(gitService);
      }
      break;

    case "rebase":
      if (action.params?.branch) {
        await gitService.rebase(action.params.branch);
        console.log(
          chalk.green(`✅ ${localeService.t("custom.rebaseComplete")}`)
        );
      } else {
        await handleRebase(gitService);
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
          { name: localeService.t("custom.actionStatus"), value: "status" },
          { name: localeService.t("custom.actionAdd"), value: "add" },
          { name: localeService.t("custom.actionCommit"), value: "commit" },
          { name: localeService.t("custom.actionPush"), value: "push" },
          { name: localeService.t("custom.actionPull"), value: "pull" },
          { name: localeService.t("custom.actionBranch"), value: "branch" },
          { name: localeService.t("custom.actionRebase"), value: "rebase" },
          { name: localeService.t("custom.actionRevert"), value: "revert" },
          { name: localeService.t("custom.actionReset"), value: "reset" },
          {
            name: localeService.t("custom.actionStashSave"),
            value: "stash-save",
          },
          {
            name: localeService.t("custom.actionStashPop"),
            value: "stash-pop",
          },
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
    } else if (actionType === "stash-save") {
      actions.push({ type: "stash", params: { action: "save" } });
    } else if (actionType === "stash-pop") {
      actions.push({ type: "stash", params: { action: "pop" } });
    } else if (actionType === "branch") {
      actions.push({ type: "branch", params: { action: "switch" } });
    } else if (actionType === "rebase") {
      const { targetBranch } = await inquirer.prompt([
        {
          type: "input",
          name: "targetBranch",
          message: localeService.t("custom.enterTargetBranch"),
          default: "main",
        },
      ]);
      actions.push({ type: "rebase", params: { branch: targetBranch } });
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

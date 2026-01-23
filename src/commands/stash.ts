import inquirer from "inquirer";
import chalk from "chalk";
import { GitService } from "../services/git-service";
import { localeService } from "../services/locale-service";

export async function handleStash(gitService: GitService): Promise<void> {
  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: localeService.t("stash.selectAction"),
        choices: [
          { name: localeService.t("stash.save"), value: "save" },
          { name: localeService.t("stash.list"), value: "list" },
          { name: localeService.t("stash.pop"), value: "pop" },
          { name: localeService.t("stash.drop"), value: "drop" },
          { name: localeService.t("stash.clear"), value: "clear" },
          { name: localeService.t("common.back"), value: "back" },
        ],
      },
    ]);

    if (action === "back") {
      return;
    }

    switch (action) {
      case "save":
        await stashSave(gitService);
        break;
      case "list":
        await stashList(gitService);
        break;
      case "pop":
        await stashPop(gitService);
        break;
      case "drop":
        await stashDrop(gitService);
        break;
      case "clear":
        await stashClear(gitService);
        break;
    }
  }
}

async function stashSave(gitService: GitService): Promise<void> {
  const { addMessage } = await inquirer.prompt([
    {
      type: "confirm",
      name: "addMessage",
      message: localeService.t("stash.addMessagePrompt"),
      default: false,
    },
  ]);

  let message: string | undefined;
  if (addMessage) {
    const { stashMessage } = await inquirer.prompt([
      {
        type: "input",
        name: "stashMessage",
        message: localeService.t("stash.messagePrompt"),
        validate: (input) => {
          if (!input.trim()) {
            return localeService.t("stash.messageRequired");
          }
          return true;
        },
      },
    ]);
    message = stashMessage;
  }

  await gitService.stashSave(message);
  console.log(chalk.green(`✅ ${localeService.t("stash.saved")}`));
}

async function stashList(gitService: GitService): Promise<void> {
  const stashList = await gitService.stashList();

  console.log(chalk.cyan.bold(`\n${localeService.t("stash.listTitle")}\n`));

  if (stashList.length === 0) {
    console.log(chalk.yellow(localeService.t("stash.listEmpty")));
    return;
  }

  stashList.forEach((stash, index: number) => {
    console.log(chalk.yellow(`${index}. stash@{${index}}`));
    console.log(chalk.white(`   ${stash.message}`));
    console.log();
  });
}

async function stashPop(gitService: GitService): Promise<void> {
  const stashList = await gitService.stashList();

  if (stashList.length === 0) {
    console.log(chalk.yellow(localeService.t("stash.popNone")));
    return;
  }

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: localeService.t("stash.confirmPop"),
      default: true,
    },
  ]);

  if (!confirm) {
    return;
  }

  await gitService.stashPop();
  console.log(chalk.green(`✅ ${localeService.t("stash.popped")}`));
}

async function stashDrop(gitService: GitService): Promise<void> {
  const stashList = await gitService.stashList();

  if (stashList.length === 0) {
    console.log(chalk.yellow(localeService.t("stash.dropNone")));
    return;
  }

  console.log(chalk.cyan.bold(`\n${localeService.t("stash.listTitle")}\n`));
  stashList.forEach((stash, index: number) => {
    console.log(chalk.yellow(`${index}. stash@{${index}} - ${stash.message}`));
  });
  console.log();

  const { index } = await inquirer.prompt([
    {
      type: "number",
      name: "index",
      message: localeService.t("stash.enterIndex"),
      default: 0,
      validate: (input) => {
        if (input < 0 || input >= stashList.length) {
          return `0${localeService.t("stash.indexInvalid")} ${
            stashList.length - 1
          }`;
        }
        return true;
      },
    },
  ]);

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: chalk.red(
        `${localeService.t("stash.confirmDrop")} stash@{${index}}?`
      ),
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow(localeService.t("stash.dropCancelled")));
    return;
  }

  await gitService.stashDrop(index);
  console.log(
    chalk.green(`✅ stash@{${index}}${localeService.t("stash.dropped")}`)
  );
}

async function stashClear(gitService: GitService): Promise<void> {
  const stashList = await gitService.stashList();

  if (stashList.length === 0) {
    console.log(chalk.yellow(localeService.t("stash.clearNone")));
    return;
  }

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: chalk.red(
        `${localeService.t("stash.confirmClearAll")} (${stashList.length})?`
      ),
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow(localeService.t("stash.dropCancelled")));
    return;
  }

  await gitService.stashClear();
  console.log(chalk.green(`✅ ${localeService.t("stash.cleared")}`));
}

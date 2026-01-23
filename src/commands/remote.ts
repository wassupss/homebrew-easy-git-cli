import inquirer from "inquirer";
import chalk from "chalk";
import { GitService } from "../services/git-service";
import { localeService } from "../services/locale-service";

export async function handleRemote(gitService: GitService): Promise<void> {
  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: localeService.t("remote.selectAction"),
        choices: [
          { name: localeService.t("remote.list"), value: "list" },
          { name: localeService.t("remote.add"), value: "add" },
          { name: localeService.t("remote.remove"), value: "remove" },
          { name: localeService.t("remote.fetchAction"), value: "fetch" },
          { name: localeService.t("common.back"), value: "back" },
        ],
      },
    ]);

    if (action === "back") {
      return;
    }

    switch (action) {
      case "list":
        await showRemoteList(gitService);
        break;
      case "add":
        await addRemote(gitService);
        break;
      case "remove":
        await removeRemote(gitService);
        break;
      case "fetch":
        await fetchRemote(gitService);
        break;
    }
  }
}

async function showRemoteList(gitService: GitService): Promise<void> {
  const remotes = await gitService.getRemotes();

  console.log(chalk.cyan.bold(`\n${localeService.t("remote.listTitle")}\n`));

  if (remotes.length === 0) {
    console.log(chalk.yellow(localeService.t("remote.listEmpty")));
    return;
  }

  remotes.forEach((remote) => {
    console.log(chalk.green(`   ${remote.name}`));
    console.log(
      chalk.gray(`   ${localeService.t("remote.fetch")} ${remote.refs.fetch}`)
    );
    console.log(
      chalk.gray(`   ${localeService.t("remote.push")} ${remote.refs.push}`)
    );
    console.log();
  });
}

async function addRemote(gitService: GitService): Promise<void> {
  const { remoteName, remoteUrl } = await inquirer.prompt([
    {
      type: "input",
      name: "remoteName",
      message: localeService.t("remote.enterNamePrompt"),
      default: "origin",
      validate: (input) => {
        if (!input.trim()) {
          return localeService.t("remote.nameRequired");
        }
        return true;
      },
    },
    {
      type: "input",
      name: "remoteUrl",
      message: localeService.t("remote.enterUrlPrompt"),
      validate: (input) => {
        if (!input.trim()) {
          return localeService.t("remote.urlRequired");
        }
        if (
          !input.includes("github.com") &&
          !input.includes("gitlab.com") &&
          !input.includes("bitbucket.org") &&
          !input.includes(".git")
        ) {
          console.log(
            chalk.yellow(`\n⚠️  ${localeService.t("remote.urlWarning")}`)
          );
        }
        return true;
      },
    },
  ]);

  try {
    await gitService.addRemote(remoteName, remoteUrl);
    console.log(
      chalk.green(`✅ '${remoteName}'${localeService.t("remote.added")}`)
    );
  } catch (error: any) {
    console.error(
      chalk.red(`❌ ${localeService.t("remote.addFailed")} ${error.message}`)
    );
  }
}

async function removeRemote(gitService: GitService): Promise<void> {
  const remotes = await gitService.getRemotes();

  if (remotes.length === 0) {
    console.log(chalk.yellow(localeService.t("remote.removeNone")));
    return;
  }

  const { selectedRemote } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedRemote",
      message: localeService.t("remote.selectToRemove"),
      choices: remotes.map((remote) => ({
        name: `${remote.name} (${remote.refs.fetch})`,
        value: remote.name,
      })),
    },
  ]);

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `'${selectedRemote}'${localeService.t(
        "remote.confirmRemovePrompt"
      )}`,
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow(localeService.t("common.cancelled")));
    return;
  }

  try {
    await gitService.removeRemote(selectedRemote);
    console.log(
      chalk.green(`✅ '${selectedRemote}'${localeService.t("remote.removed")}`)
    );
  } catch (error: any) {
    console.error(
      chalk.red(`❌ ${localeService.t("remote.removeFailed")} ${error.message}`)
    );
  }
}

async function fetchRemote(gitService: GitService): Promise<void> {
  try {
    await gitService.fetchAll();
    console.log(chalk.green(`✅ ${localeService.t("remote.fetchSuccess")}`));
  } catch (error: any) {
    console.error(
      chalk.red(`❌ ${localeService.t("remote.fetchFailed")} ${error.message}`)
    );
  }
}

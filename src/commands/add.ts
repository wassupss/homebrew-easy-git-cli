import inquirer from "inquirer";
import chalk from "chalk";
import { GitService } from "../services/git-service";
import { localeService } from "../services/locale-service";

export async function handleAdd(gitService: GitService): Promise<void> {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: localeService.t("staging.selectAction"),
      choices: [
        { name: localeService.t("staging.stage"), value: "stage" },
        { name: localeService.t("staging.unstage"), value: "unstage" },
        { name: localeService.t("common.back"), value: "back" },
      ],
    },
  ]);

  if (action === "back") {
    return;
  }

  if (action === "stage") {
    await handleStage(gitService);
  } else if (action === "unstage") {
    await handleUnstage(gitService);
  }
}

async function handleStage(gitService: GitService): Promise<void> {
  const status = await gitService.getStatus();

  const allFiles = [...status.not_added, ...status.modified, ...status.deleted];

  if (allFiles.length === 0) {
    console.log(chalk.yellow(localeService.t("staging.noFiles")));
    return;
  }

  const { addChoice } = await inquirer.prompt([
    {
      type: "list",
      name: "addChoice",
      message: localeService.t("staging.howToStage"),
      choices: [
        { name: localeService.t("staging.allFiles"), value: "all" },
        { name: localeService.t("staging.selectFiles"), value: "select" },
        { name: localeService.t("common.cancel"), value: "cancel" },
      ],
    },
  ]);

  if (addChoice === "cancel") {
    return;
  }

  if (addChoice === "all") {
    await gitService.addAll();
    console.log(chalk.green(`✅ ${localeService.t("staging.allStaged")}`));
    return;
  }

  if (addChoice === "select") {
    const { selectedFiles } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "selectedFiles",
        message: localeService.t("staging.selectFilesPrompt"),
        choices: allFiles.map((file) => ({
          name: file,
          value: file,
        })),
        validate: (answer) => {
          if (answer.length === 0) {
            return localeService.t("staging.minOneFile");
          }
          return true;
        },
      },
    ]);

    await gitService.add(selectedFiles);
    console.log(
      chalk.green(
        `✅ ${selectedFiles.length}${localeService.t("staging.filesStaged")}`
      )
    );
  }
}

async function handleUnstage(gitService: GitService): Promise<void> {
  const status = await gitService.getStatus();

  if (status.staged.length === 0) {
    console.log(chalk.yellow(localeService.t("staging.noStagedFiles")));
    return;
  }

  const { unstageChoice } = await inquirer.prompt([
    {
      type: "list",
      name: "unstageChoice",
      message: localeService.t("staging.howToStage"),
      choices: [
        { name: localeService.t("staging.unstageAll"), value: "all" },
        { name: localeService.t("staging.selectFiles"), value: "select" },
        { name: localeService.t("common.cancel"), value: "cancel" },
      ],
    },
  ]);

  if (unstageChoice === "cancel") {
    return;
  }

  if (unstageChoice === "all") {
    await gitService.reset();
    console.log(chalk.green(`✅ ${localeService.t("staging.allUnstaged")}`));
    return;
  }

  if (unstageChoice === "select") {
    const { selectedFiles } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "selectedFiles",
        message: localeService.t("staging.selectToUnstage"),
        choices: status.staged.map((file) => ({
          name: file,
          value: file,
        })),
        validate: (answer) => {
          if (answer.length === 0) {
            return localeService.t("staging.minOneFile");
          }
          return true;
        },
      },
    ]);

    // 개별 파일 언스테이징
    for (const file of selectedFiles) {
      await gitService.unstageFile(file);
    }
    console.log(
      chalk.green(
        `✅ ${selectedFiles.length}${localeService.t("staging.filesUnstaged")}`
      )
    );
  }
}

import inquirer from "inquirer";
import chalk from "chalk";
import { GitService } from "../services/git-service";
import { localeService } from "../services/locale-service";

export async function handleAdd(gitService: GitService): Promise<void> {
  const status = await gitService.getStatus();

  const allFiles = [...status.not_added, ...status.modified, ...status.deleted];

  if (allFiles.length === 0) {
    console.log(chalk.yellow(localeService.t("add.noFiles")));
    return;
  }

  const { addChoice } = await inquirer.prompt([
    {
      type: "list",
      name: "addChoice",
      message: localeService.t("add.howToAdd"),
      choices: [
        { name: localeService.t("add.allFiles"), value: "all" },
        { name: localeService.t("add.selectFiles"), value: "select" },
        { name: localeService.t("common.cancel"), value: "cancel" },
      ],
    },
  ]);

  if (addChoice === "cancel") {
    return;
  }

  if (addChoice === "all") {
    await gitService.addAll();
    console.log(chalk.green(`✅ ${localeService.t("add.allAdded")}`));
    return;
  }

  if (addChoice === "select") {
    const { selectedFiles } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "selectedFiles",
        message: localeService.t("add.selectFilesPrompt"),
        choices: allFiles.map((file) => ({
          name: file,
          value: file,
        })),
        validate: (answer) => {
          if (answer.length === 0) {
            return localeService.t("add.minOneFile");
          }
          return true;
        },
      },
    ]);

    await gitService.add(selectedFiles);
    console.log(
      chalk.green(
        `✅ ${selectedFiles.length}${localeService.t("add.filesAdded")}`
      )
    );
  }
}

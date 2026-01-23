import inquirer from "inquirer";
import chalk from "chalk";
import { GitService } from "../services/git-service";
import { localeService } from "../services/locale-service";

export async function handlePull(gitService: GitService): Promise<void> {
  const status = await gitService.getStatus();
  const currentBranch = status.current || "main";

  console.log(
    chalk.cyan(
      `\n${localeService.t("status.currentBranch")} ${chalk.bold(
        currentBranch
      )}`
    )
  );

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `${currentBranch}${localeService.t("pull.confirm")}`,
      default: true,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow(localeService.t("pull.cancelled")));
    return;
  }

  await gitService.pull("origin", currentBranch);
  console.log(chalk.green("✅ Pull completed!"));
}

import inquirer from "inquirer";
import chalk from "chalk";
import { GitService } from "../services/git-service";
import { localeService } from "../services/locale-service";

export async function handlePush(gitService: GitService): Promise<void> {
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
      message: `${currentBranch}${localeService.t("push.confirm")}`,
      default: true,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow(localeService.t("push.cancelled")));
    return;
  }

  try {
    await gitService.push("origin", currentBranch);
    console.log(chalk.green("✅ Push completed!"));
  } catch (error: any) {
    console.error(chalk.red("❌ Push failed:", error.message));

    if (error.message.includes("upstream")) {
      const { setUpstream } = await inquirer.prompt([
        {
          type: "confirm",
          name: "setUpstream",
          message: "Set upstream and push?",
          default: true,
        },
      ]);

      if (setUpstream) {
        // Set upstream and push
        await gitService.push("origin", `${currentBranch}`);
      }
    }
  }
}

import chalk from "chalk";
import inquirer from "inquirer";
import { GitService } from "../services/git-service";
import { localeService } from "../services/locale-service";

export async function displayStatus(gitService: GitService): Promise<void> {
  const status = await gitService.getStatus();

  console.log(chalk.bold.cyan(`\n${localeService.t("status.title")}\n`));

  // Staged files
  if (status.staged.length > 0) {
    console.log(chalk.green.bold(localeService.t("status.staged")));
    status.staged.forEach((file: string) =>
      console.log(chalk.green(`   + ${file}`))
    );
    console.log();
  }

  // Modified files
  if (status.modified.length > 0) {
    console.log(chalk.yellow.bold(localeService.t("status.modified")));
    status.modified.forEach((file: string) =>
      console.log(chalk.yellow(`   M ${file}`))
    );
    console.log();
  }

  // New files
  if (status.not_added.length > 0) {
    console.log(chalk.red.bold(localeService.t("status.untracked")));
    status.not_added.forEach((file: string) =>
      console.log(chalk.red(`   ? ${file}`))
    );
    console.log();
  }

  // Deleted files
  if (status.deleted.length > 0) {
    console.log(chalk.red.bold(localeService.t("status.deleted")));
    status.deleted.forEach((file: string) =>
      console.log(chalk.red(`   D ${file}`))
    );
    console.log();
  }

  // Conflicted files
  if (status.conflicted.length > 0) {
    console.log(chalk.magenta.bold(localeService.t("status.conflicted")));
    status.conflicted.forEach((file: string) =>
      console.log(chalk.magenta(`   ! ${file}`))
    );
    console.log();
  }

  if (
    status.staged.length === 0 &&
    status.modified.length === 0 &&
    status.not_added.length === 0 &&
    status.deleted.length === 0 &&
    status.conflicted.length === 0
  ) {
    console.log(chalk.green(`${localeService.t("status.clean")}\n`));
  }

  // Branch info
  console.log(
    chalk.blue(
      `${localeService.t("status.currentBranch")} ${chalk.bold(status.current)}`
    )
  );
  if (status.ahead > 0) {
    console.log(chalk.cyan(`   ⬆️  ${status.ahead} commits ahead of remote`));
  }
  if (status.behind > 0) {
    console.log(chalk.cyan(`   ⬇️  ${status.behind} commits behind remote`));
  }
  console.log();

  // 돌아가기 프롬프트
  await inquirer.prompt([
    {
      type: "input",
      name: "continue",
      message: localeService.t("status.pressEnter"),
    },
  ]);
}

import chalk from "chalk";
import inquirer from "inquirer";
import { GitService } from "../services/git-service";
import { localeService } from "../services/locale-service";

export async function handleRollback(gitService: GitService): Promise<void> {
  while (true) {
    try {
      const { action } = await inquirer.prompt([
        {
          type: "list",
          name: "action",
          message: localeService.t("rollback.selectAction"),
          choices: [
            {
              name: localeService.t("rollback.revert"),
              value: "revert",
            },
            {
              name: localeService.t("rollback.resetSoft"),
              value: "reset-soft",
            },
            {
              name: localeService.t("rollback.resetMixed"),
              value: "reset-mixed",
            },
            {
              name: localeService.t("rollback.resetHard"),
              value: "reset-hard",
            },
            {
              name: localeService.t("rollback.undoLastCommit"),
              value: "undo-last",
            },
            { name: localeService.t("common.back"), value: "back" },
          ],
        },
      ]);

      if (action === "back") {
        return;
      }

      switch (action) {
        case "revert":
          await performRevert(gitService);
          break;
        case "reset-soft":
          await performReset(gitService, "soft");
          break;
        case "reset-mixed":
          await performReset(gitService, "mixed");
          break;
        case "reset-hard":
          await performReset(gitService, "hard");
          break;
        case "undo-last":
          await undoLastCommit(gitService);
          break;
      }
    } catch (error: any) {
      console.error(
        chalk.red(`❌ ${localeService.t("rollback.error")}: ${error.message}`)
      );
    }
  }
}

async function performRevert(gitService: GitService): Promise<void> {
  console.log(chalk.cyan("\n📋 " + localeService.t("rollback.recentCommits")));

  const log = await gitService.getLog(20);

  if (log.all.length === 0) {
    console.log(chalk.yellow("⚠️  " + localeService.t("rollback.noCommits")));
    return;
  }

  const commitChoices = log.all.map((commit) => ({
    name: `${chalk.yellow(commit.hash.substring(0, 7))} - ${chalk.white(
      commit.message
    )} ${chalk.gray(`(${commit.author_name}, ${commit.date})`)}`,
    value: commit.hash,
  }));

  const { commitHash } = await inquirer.prompt([
    {
      type: "list",
      name: "commitHash",
      message: localeService.t("rollback.selectCommitToRevert"),
      choices: [
        ...commitChoices,
        { name: localeService.t("common.cancel"), value: "cancel" },
      ],
      pageSize: 15,
    },
  ]);

  if (commitHash === "cancel") {
    return;
  }

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: localeService.t("rollback.confirmRevert"),
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow("⚠️  " + localeService.t("common.cancelled")));
    return;
  }

  await gitService.revertCommit(commitHash);
  console.log(
    chalk.green(
      `✅ ${localeService.t("rollback.revertSuccess")} (${commitHash.substring(
        0,
        7
      )})`
    )
  );
}

async function performReset(
  gitService: GitService,
  mode: "soft" | "mixed" | "hard"
): Promise<void> {
  console.log(chalk.cyan("\n📋 " + localeService.t("rollback.recentCommits")));

  const log = await gitService.getLog(20);

  if (log.all.length === 0) {
    console.log(chalk.yellow("⚠️  " + localeService.t("rollback.noCommits")));
    return;
  }

  const commitChoices = log.all.map((commit) => ({
    name: `${chalk.yellow(commit.hash.substring(0, 7))} - ${chalk.white(
      commit.message
    )} ${chalk.gray(`(${commit.author_name}, ${commit.date})`)}`,
    value: commit.hash,
  }));

  const { commitHash } = await inquirer.prompt([
    {
      type: "list",
      name: "commitHash",
      message: localeService.t("rollback.selectCommitToReset"),
      choices: [
        ...commitChoices,
        { name: localeService.t("common.cancel"), value: "cancel" },
      ],
      pageSize: 15,
    },
  ]);

  if (commitHash === "cancel") {
    return;
  }

  // Warning for reset
  console.log(
    chalk.yellow(`\n⚠️  ${localeService.t("rollback.resetWarning." + mode)}`)
  );

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: localeService.t("rollback.confirmReset"),
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow("⚠️  " + localeService.t("common.cancelled")));
    return;
  }

  await gitService.resetToCommit(commitHash, mode);
  console.log(
    chalk.green(
      `✅ ${localeService.t("rollback.resetSuccess")} (${commitHash.substring(
        0,
        7
      )})`
    )
  );
}

async function undoLastCommit(gitService: GitService): Promise<void> {
  const log = await gitService.getLog(1);

  if (log.all.length === 0) {
    console.log(chalk.yellow("⚠️  " + localeService.t("rollback.noCommits")));
    return;
  }

  const lastCommit = log.latest;
  if (!lastCommit) {
    console.log(chalk.yellow("⚠️  " + localeService.t("rollback.noCommits")));
    return;
  }

  console.log(
    chalk.cyan(
      `\n📝 ${localeService.t("rollback.lastCommit")}: ${chalk.yellow(
        lastCommit.hash.substring(0, 7)
      )} - ${lastCommit.message}`
    )
  );

  const { mode } = await inquirer.prompt([
    {
      type: "list",
      name: "mode",
      message: localeService.t("rollback.selectUndoMode"),
      choices: [
        {
          name: localeService.t("rollback.undoMode.soft"),
          value: "soft",
        },
        {
          name: localeService.t("rollback.undoMode.mixed"),
          value: "mixed",
        },
        {
          name: localeService.t("rollback.undoMode.hard"),
          value: "hard",
        },
        { name: localeService.t("common.cancel"), value: "cancel" },
      ],
    },
  ]);

  if (mode === "cancel") {
    return;
  }

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: localeService.t("rollback.confirmUndo"),
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow("⚠️  " + localeService.t("common.cancelled")));
    return;
  }

  await gitService.undoLastCommit(mode);
  console.log(chalk.green(`✅ ${localeService.t("rollback.undoSuccess")}`));
}

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
              name: localeService.t("rollback.discardChanges"),
              value: "discard-changes",
            },
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
        case "discard-changes":
          await discardChanges(gitService);
          break;
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

async function discardChanges(gitService: GitService): Promise<void> {
  const status = await gitService.getStatus();

  // 변경된 파일들 찾기 (modified + deleted + untracked)
  const modifiedFiles = status.modified;
  const deletedFiles = status.deleted;
  const untrackedFiles = status.not_added;
  const stagedFiles = status.staged;

  const allChangedFiles = [
    ...modifiedFiles,
    ...deletedFiles,
    ...untrackedFiles,
    ...stagedFiles,
  ];

  if (allChangedFiles.length === 0) {
    console.log(
      chalk.yellow("⚠️  " + localeService.t("rollback.noChangesToDiscard"))
    );
    return;
  }

  console.log(chalk.cyan("\n📋 " + localeService.t("rollback.changedFiles")));

  if (modifiedFiles.length > 0) {
    console.log(chalk.yellow(`\n📝 Modified (${modifiedFiles.length}):`));
    modifiedFiles.forEach((file) => console.log(`  - ${file}`));
  }

  if (deletedFiles.length > 0) {
    console.log(chalk.red(`\n🗑️  Deleted (${deletedFiles.length}):`));
    deletedFiles.forEach((file) => console.log(`  - ${file}`));
  }

  if (stagedFiles.length > 0) {
    console.log(chalk.green(`\n✅ Staged (${stagedFiles.length}):`));
    stagedFiles.forEach((file) => console.log(`  - ${file}`));
  }

  if (untrackedFiles.length > 0) {
    console.log(chalk.gray(`\n❓ Untracked (${untrackedFiles.length}):`));
    untrackedFiles.forEach((file) => console.log(`  - ${file}`));
  }

  const { discardOption } = await inquirer.prompt([
    {
      type: "list",
      name: "discardOption",
      message: localeService.t("rollback.selectDiscardOption"),
      choices: [
        {
          name: localeService.t("rollback.discardAll"),
          value: "all",
        },
        {
          name: localeService.t("rollback.discardTracked"),
          value: "tracked",
        },
        {
          name: localeService.t("rollback.discardSpecific"),
          value: "specific",
        },
        { name: localeService.t("common.cancel"), value: "cancel" },
      ],
    },
  ]);

  if (discardOption === "cancel") {
    return;
  }

  let filesToDiscard: string[] = [];

  if (discardOption === "all") {
    filesToDiscard = allChangedFiles;
  } else if (discardOption === "tracked") {
    filesToDiscard = [...modifiedFiles, ...deletedFiles, ...stagedFiles];
  } else if (discardOption === "specific") {
    const { selectedFiles } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "selectedFiles",
        message: localeService.t("rollback.selectFilesToDiscard"),
        choices: allChangedFiles.map((file) => ({
          name: file,
          value: file,
        })),
      },
    ]);

    if (selectedFiles.length === 0) {
      console.log(
        chalk.yellow("⚠️  " + localeService.t("rollback.noFilesSelected"))
      );
      return;
    }

    filesToDiscard = selectedFiles;
  }

  // 경고 메시지 표시
  console.log(chalk.red(`\n⚠️  ${localeService.t("rollback.discardWarning")}`));
  console.log(
    chalk.gray(
      `   ${localeService.t("rollback.filesCount")}: ${filesToDiscard.length}`
    )
  );

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: localeService.t("rollback.confirmDiscard"),
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow("⚠️  " + localeService.t("common.cancelled")));
    return;
  }

  await gitService.discardChanges(filesToDiscard);
  console.log(
    chalk.green(
      `✅ ${localeService.t("rollback.discardSuccess")} (${
        filesToDiscard.length
      } ${localeService.t("rollback.files")})`
    )
  );
}

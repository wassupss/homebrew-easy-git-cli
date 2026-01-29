import inquirer from "inquirer";
import chalk from "chalk";
import { GitService } from "../services/git-service";
import { localeService } from "../services/locale-service";

export async function handleBranch(gitService: GitService): Promise<void> {
  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: localeService.t("branch.selectAction"),
        choices: [
          { name: localeService.t("branch.list"), value: "list" },
          { name: localeService.t("branch.create"), value: "create" },
          { name: localeService.t("branch.switch"), value: "switch" },
          { name: localeService.t("branch.merge"), value: "merge" },
          { name: localeService.t("branch.delete"), value: "delete" },
          { name: localeService.t("common.back"), value: "back" },
        ],
      },
    ]);

    if (action === "back") {
      return;
    }

    switch (action) {
      case "list":
        await showBranchList(gitService);
        break;
      case "create":
        await createNewBranch(gitService);
        break;
      case "switch":
        await switchBranch(gitService);
        break;
      case "merge":
        await mergeBranch(gitService);
        break;
      case "delete":
        await deleteBranch(gitService);
        break;
    }
  }
}

async function showBranchList(gitService: GitService): Promise<void> {
  const branches = await gitService.getBranches();

  console.log(chalk.cyan.bold(`\n${localeService.t("branch.listTitle")}\n`));

  Object.keys(branches.branches).forEach((branchName) => {
    const branch = branches.branches[branchName];
    if (branch.current) {
      console.log(
        chalk.green(`   * ${branchName} ${localeService.t("branch.current")}`)
      );
    } else {
      console.log(chalk.white(`     ${branchName}`));
    }
  });
  console.log();
}

async function createNewBranch(gitService: GitService): Promise<void> {
  const { branchName } = await inquirer.prompt([
    {
      type: "input",
      name: "branchName",
      message: localeService.t("branch.enterName"),
      validate: (input) => {
        if (!input.trim()) {
          return localeService.t("branch.nameRequired");
        }
        // Allow alphanumeric, underscore, hyphen, and forward slash for folder structure
        if (!/^[a-zA-Z0-9_/-]+$/.test(input)) {
          return localeService.t("branch.nameInvalid");
        }
        // Prevent starting or ending with slash, or consecutive slashes
        if (
          input.startsWith("/") ||
          input.endsWith("/") ||
          input.includes("//")
        ) {
          return localeService.t("branch.nameInvalid");
        }
        return true;
      },
    },
  ]);

  await gitService.createBranch(branchName);
  console.log(
    chalk.green(`✅ ${branchName}${localeService.t("branch.created")}`)
  );
}

async function switchBranch(gitService: GitService): Promise<void> {
  const branches = await gitService.getBranches();
  const branchList = Object.keys(branches.branches).filter(
    (name) => !branches.branches[name].current
  );

  if (branchList.length === 0) {
    console.log(chalk.yellow(localeService.t("branch.noOtherBranches")));
    return;
  }

  const { selectedBranch } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedBranch",
      message: localeService.t("branch.selectToSwitch"),
      choices: branchList,
    },
  ]);

  await gitService.switchBranch(selectedBranch);
  console.log(
    chalk.green(`✅ ${selectedBranch}${localeService.t("branch.switched")}`)
  );
}

async function deleteBranch(gitService: GitService): Promise<void> {
  const branches = await gitService.getBranches();
  const branchList = Object.keys(branches.branches).filter(
    (name) => !branches.branches[name].current
  );

  if (branchList.length === 0) {
    console.log(chalk.yellow(localeService.t("branch.noDeleteable")));
    return;
  }

  const { selectedBranch } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedBranch",
      message: localeService.t("branch.selectToDelete"),
      choices: branchList,
    },
  ]);

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: chalk.red(
        `${selectedBranch}${localeService.t("branch.confirmDelete")}`
      ),
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow(localeService.t("common.cancelled")));
    return;
  }

  const { force } = await inquirer.prompt([
    {
      type: "confirm",
      name: "force",
      message: localeService.t("branch.deleteForce"),
      default: false,
    },
  ]);

  await gitService.deleteBranch(selectedBranch, force);
  console.log(
    chalk.green(`✅ ${selectedBranch}${localeService.t("branch.deleted")}`)
  );
}

async function mergeBranch(gitService: GitService): Promise<void> {
  const branches = await gitService.getBranches();
  const currentBranch = branches.current;

  // 현재 브랜치를 제외한 다른 브랜치들
  const otherBranches = branches.all.filter((b) => b !== currentBranch);

  if (otherBranches.length === 0) {
    console.log(chalk.yellow(localeService.t("branch.noOtherBranches")));
    return;
  }

  console.log(
    chalk.cyan(
      `\n${localeService.t("branch.currentBranch")}: ${chalk.bold(
        currentBranch
      )}\n`
    )
  );

  const { selectedBranch } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedBranch",
      message: localeService.t("branch.selectToMerge"),
      choices: otherBranches,
    },
  ]);

  console.log(
    chalk.yellow(
      `\n${localeService
        .t("branch.mergeInfo")
        .replace("{source}", selectedBranch)
        .replace("{target}", currentBranch)}\n`
    )
  );

  const { mergeStrategy } = await inquirer.prompt([
    {
      type: "list",
      name: "mergeStrategy",
      message: localeService.t("branch.selectMergeStrategy"),
      choices: [
        {
          name: localeService.t("branch.fastForward"),
          value: "ff",
        },
        {
          name: localeService.t("branch.noFastForward"),
          value: "no-ff",
        },
        { name: localeService.t("common.cancel"), value: "cancel" },
      ],
    },
  ]);

  if (mergeStrategy === "cancel") {
    return;
  }

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: localeService.t("branch.confirmMerge"),
      default: true,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow(localeService.t("common.cancelled")));
    return;
  }

  try {
    await gitService.merge(selectedBranch, mergeStrategy === "no-ff");
    console.log(
      chalk.green(
        `\n✅ ${localeService
          .t("branch.mergeSuccess")
          .replace("{branch}", selectedBranch)
          .replace("{current}", currentBranch)}\n`
      )
    );
  } catch (error: any) {
    console.error(chalk.red(`\n❌ ${localeService.t("branch.mergeFailed")}`));

    if (error.message.includes("CONFLICT")) {
      console.log(
        chalk.yellow(`\n⚠️  ${localeService.t("branch.mergeConflict")}`)
      );
      console.log(chalk.gray(localeService.t("branch.conflictHelp")));

      const { abortMerge } = await inquirer.prompt([
        {
          type: "confirm",
          name: "abortMerge",
          message: localeService.t("branch.abortMerge"),
          default: false,
        },
      ]);

      if (abortMerge) {
        await gitService.mergeAbort();
        console.log(
          chalk.green(`\n✅ ${localeService.t("branch.mergeAborted")}`)
        );
      }
    }
  }
}

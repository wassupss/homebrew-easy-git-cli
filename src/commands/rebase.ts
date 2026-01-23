import chalk from "chalk";
import inquirer from "inquirer";
import { GitService } from "../services/git-service";
import { localeService } from "../services/locale-service";

export async function handleRebase(gitService: GitService): Promise<void> {
  try {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: localeService.t("rebase.selectAction"),
        choices: [
          { name: localeService.t("rebase.branch"), value: "rebase" },
          { name: localeService.t("rebase.continue"), value: "continue" },
          { name: localeService.t("rebase.skip"), value: "skip" },
          { name: localeService.t("rebase.abort"), value: "abort" },
          { name: localeService.t("common.back"), value: "back" },
        ],
      },
    ]);

    if (action === "back") {
      return;
    }

    switch (action) {
      case "rebase":
        await performRebase(gitService);
        break;
      case "continue":
        await continueRebase(gitService);
        break;
      case "skip":
        await skipRebase(gitService);
        break;
      case "abort":
        await abortRebase(gitService);
        break;
    }
  } catch (error: any) {
    console.error(chalk.red(`❌ Rebase 작업 실패: ${error.message}`));
  }
}

async function performRebase(gitService: GitService): Promise<void> {
  const branches = await gitService.getBranches();
  const currentBranch = branches.current;

  console.log(chalk.cyan(`\n📍 현재 브랜치: ${chalk.bold(currentBranch)}\n`));

  const branchList = Object.keys(branches.branches).filter(
    (name) => name !== currentBranch
  );

  if (branchList.length === 0) {
    console.log(chalk.yellow("⚠️  Rebase할 다른 브랜치가 없습니다."));
    return;
  }

  const { targetBranch } = await inquirer.prompt([
    {
      type: "list",
      name: "targetBranch",
      message: "어떤 브랜치로 rebase 하시겠습니까?",
      choices: branchList,
    },
  ]);

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `'${targetBranch}' 브랜치로 rebase 하시겠습니까?`,
      default: true,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow("취소되었습니다."));
    return;
  }

  console.log(
    chalk.cyan(
      `\n🔄 '${currentBranch}' 브랜치를 '${targetBranch}' 위로 rebase 중...\n`
    )
  );

  try {
    await gitService.rebase(targetBranch);
    console.log(chalk.green("✅ Rebase 완료!"));
  } catch (error: any) {
    console.log(chalk.red("\n❌ Rebase 중 충돌이 발생했습니다!"));
    console.log(chalk.yellow("\n다음 작업을 수행하세요:"));
    console.log(chalk.white("  1. 충돌 파일을 해결하세요"));
    console.log(chalk.white("  2. git add <파일>로 해결된 파일을 추가하세요"));
    console.log(chalk.white("  3. 메뉴에서 'Rebase 계속 진행'을 선택하세요"));
    console.log(
      chalk.gray("\n또는 'Rebase 취소'를 선택하여 취소할 수 있습니다.\n")
    );
  }
}

async function continueRebase(gitService: GitService): Promise<void> {
  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "충돌을 해결하고 파일을 추가했습니까?",
      default: true,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow("취소되었습니다."));
    return;
  }

  try {
    await gitService.rebaseContinue();
    console.log(chalk.green("✅ Rebase 계속 진행 완료!"));
  } catch (error: any) {
    console.error(chalk.red(`❌ Rebase 계속 진행 실패: ${error.message}`));
  }
}

async function skipRebase(gitService: GitService): Promise<void> {
  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "현재 커밋을 건너뛰고 계속하시겠습니까?",
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow("취소되었습니다."));
    return;
  }

  try {
    await gitService.rebaseSkip();
    console.log(chalk.green("✅ 커밋 건너뛰기 완료!"));
  } catch (error: any) {
    console.error(chalk.red(`❌ 건너뛰기 실패: ${error.message}`));
  }
}

async function abortRebase(gitService: GitService): Promise<void> {
  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "정말로 rebase를 취소하시겠습니까?",
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow("취소되었습니다."));
    return;
  }

  try {
    await gitService.rebaseAbort();
    console.log(chalk.green("✅ Rebase 취소됨!"));
  } catch (error: any) {
    console.error(chalk.red(`❌ Rebase 취소 실패: ${error.message}`));
  }
}

import inquirer from "inquirer";
import chalk from "chalk";
import { GitService } from "../services/git-service";

export async function handleBranch(gitService: GitService): Promise<void> {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "브랜치 작업을 선택하세요:",
      choices: [
        { name: "📋 브랜치 목록 보기", value: "list" },
        { name: "➕ 새 브랜치 생성", value: "create" },
        { name: "🔀 브랜치 전환", value: "switch" },
        { name: "🗑️  브랜치 삭제", value: "delete" },
        { name: "← 돌아가기", value: "back" },
      ],
    },
  ]);

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
    case "delete":
      await deleteBranch(gitService);
      break;
    case "back":
      return;
  }
}

async function showBranchList(gitService: GitService): Promise<void> {
  const branches = await gitService.getBranches();

  console.log(chalk.cyan.bold("\n📋 브랜치 목록:\n"));

  Object.keys(branches.branches).forEach((branchName) => {
    const branch = branches.branches[branchName];
    if (branch.current) {
      console.log(chalk.green(`   * ${branchName} (현재 브랜치)`));
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
      message: "새 브랜치 이름을 입력하세요:",
      validate: (input) => {
        if (!input.trim()) {
          return "브랜치 이름은 비워둘 수 없습니다.";
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(input)) {
          return "브랜치 이름은 영문, 숫자, -, _만 사용할 수 있습니다.";
        }
        return true;
      },
    },
  ]);

  await gitService.createBranch(branchName);
  console.log(
    chalk.green(`✅ 브랜치 '${branchName}'가 생성되고 전환되었습니다!`)
  );
}

async function switchBranch(gitService: GitService): Promise<void> {
  const branches = await gitService.getBranches();
  const branchList = Object.keys(branches.branches).filter(
    (name) => !branches.branches[name].current
  );

  if (branchList.length === 0) {
    console.log(chalk.yellow("전환할 수 있는 다른 브랜치가 없습니다."));
    return;
  }

  const { selectedBranch } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedBranch",
      message: "전환할 브랜치를 선택하세요:",
      choices: branchList,
    },
  ]);

  await gitService.switchBranch(selectedBranch);
  console.log(chalk.green(`✅ 브랜치 '${selectedBranch}'로 전환되었습니다!`));
}

async function deleteBranch(gitService: GitService): Promise<void> {
  const branches = await gitService.getBranches();
  const branchList = Object.keys(branches.branches).filter(
    (name) => !branches.branches[name].current
  );

  if (branchList.length === 0) {
    console.log(
      chalk.yellow(
        "삭제할 수 있는 브랜치가 없습니다. (현재 브랜치는 삭제할 수 없습니다)"
      )
    );
    return;
  }

  const { selectedBranch } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedBranch",
      message: "삭제할 브랜치를 선택하세요:",
      choices: branchList,
    },
  ]);

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: chalk.red(
        `정말로 브랜치 '${selectedBranch}'를 삭제하시겠습니까?`
      ),
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow("삭제가 취소되었습니다."));
    return;
  }

  const { force } = await inquirer.prompt([
    {
      type: "confirm",
      name: "force",
      message: "강제 삭제하시겠습니까? (병합되지 않은 변경사항 포함)",
      default: false,
    },
  ]);

  await gitService.deleteBranch(selectedBranch, force);
  console.log(chalk.green(`✅ 브랜치 '${selectedBranch}'가 삭제되었습니다!`));
}

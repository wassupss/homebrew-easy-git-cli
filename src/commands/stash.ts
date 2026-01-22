import inquirer from "inquirer";
import chalk from "chalk";
import { GitService } from "../services/git-service";

export async function handleStash(gitService: GitService): Promise<void> {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "Stash 작업을 선택하세요:",
      choices: [
        { name: "💾 현재 변경사항 저장 (Stash Save)", value: "save" },
        { name: "📋 Stash 목록 보기", value: "list" },
        { name: "♻️  최근 Stash 복원 (Pop)", value: "pop" },
        { name: "🗑️  Stash 삭제", value: "drop" },
        { name: "🧹 모든 Stash 삭제", value: "clear" },
        { name: "← 돌아가기", value: "back" },
      ],
    },
  ]);

  switch (action) {
    case "save":
      await stashSave(gitService);
      break;
    case "list":
      await stashList(gitService);
      break;
    case "pop":
      await stashPop(gitService);
      break;
    case "drop":
      await stashDrop(gitService);
      break;
    case "clear":
      await stashClear(gitService);
      break;
    case "back":
      return;
  }
}

async function stashSave(gitService: GitService): Promise<void> {
  const { addMessage } = await inquirer.prompt([
    {
      type: "confirm",
      name: "addMessage",
      message: "Stash에 메시지를 추가하시겠습니까?",
      default: false,
    },
  ]);

  let message: string | undefined;
  if (addMessage) {
    const { stashMessage } = await inquirer.prompt([
      {
        type: "input",
        name: "stashMessage",
        message: "Stash 메시지를 입력하세요:",
        validate: (input) => {
          if (!input.trim()) {
            return "메시지는 비워둘 수 없습니다.";
          }
          return true;
        },
      },
    ]);
    message = stashMessage;
  }

  await gitService.stashSave(message);
  console.log(chalk.green("✅ 변경사항이 Stash에 저장되었습니다!"));
}

async function stashList(gitService: GitService): Promise<void> {
  const stashList = await gitService.stashList();

  console.log(chalk.cyan.bold("\n📋 Stash 목록:\n"));

  if (stashList.length === 0) {
    console.log(chalk.yellow("저장된 Stash가 없습니다."));
    return;
  }

  stashList.forEach((stash, index: number) => {
    console.log(chalk.yellow(`${index}. stash@{${index}}`));
    console.log(chalk.white(`   ${stash.message}`));
    console.log();
  });
}

async function stashPop(gitService: GitService): Promise<void> {
  const stashList = await gitService.stashList();

  if (stashList.length === 0) {
    console.log(chalk.yellow("복원할 Stash가 없습니다."));
    return;
  }

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "최근 Stash를 복원하시겠습니까?",
      default: true,
    },
  ]);

  if (!confirm) {
    return;
  }

  await gitService.stashPop();
  console.log(chalk.green("✅ Stash가 복원되었습니다!"));
}

async function stashDrop(gitService: GitService): Promise<void> {
  const stashList = await gitService.stashList();

  if (stashList.length === 0) {
    console.log(chalk.yellow("삭제할 Stash가 없습니다."));
    return;
  }

  console.log(chalk.cyan.bold("\n📋 Stash 목록:\n"));
  stashList.forEach((stash, index: number) => {
    console.log(chalk.yellow(`${index}. stash@{${index}} - ${stash.message}`));
  });
  console.log();

  const { index } = await inquirer.prompt([
    {
      type: "number",
      name: "index",
      message: "삭제할 Stash의 번호를 입력하세요:",
      default: 0,
      validate: (input) => {
        if (input < 0 || input >= stashList.length) {
          return `0부터 ${stashList.length - 1} 사이의 숫자를 입력하세요.`;
        }
        return true;
      },
    },
  ]);

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: chalk.red(`정말로 stash@{${index}}를 삭제하시겠습니까?`),
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow("삭제가 취소되었습니다."));
    return;
  }

  await gitService.stashDrop(index);
  console.log(chalk.green(`✅ stash@{${index}}가 삭제되었습니다!`));
}

async function stashClear(gitService: GitService): Promise<void> {
  const stashList = await gitService.stashList();

  if (stashList.length === 0) {
    console.log(chalk.yellow("삭제할 Stash가 없습니다."));
    return;
  }

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: chalk.red(
        `정말로 모든 Stash(${stashList.length}개)를 삭제하시겠습니까?`
      ),
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow("삭제가 취소되었습니다."));
    return;
  }

  await gitService.stashClear();
  console.log(chalk.green("✅ 모든 Stash가 삭제되었습니다!"));
}

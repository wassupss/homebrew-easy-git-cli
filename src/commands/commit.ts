import inquirer from "inquirer";
import chalk from "chalk";
import { GitService } from "../services/git-service";
import { localeService } from "../services/locale-service";

export async function handleCommit(gitService: GitService): Promise<void> {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: localeService.t("commit.selectAction"),
      choices: [
        { name: localeService.t("commit.createNew"), value: "commit" },
        { name: localeService.t("commit.revert"), value: "revert" },
        { name: localeService.t("commit.reset"), value: "reset" },
        { name: localeService.t("common.back"), value: "back" },
      ],
    },
  ]);

  if (action === "back") {
    return;
  }

  switch (action) {
    case "commit":
      await createCommit(gitService);
      break;
    case "revert":
      await revertCommit(gitService);
      break;
    case "reset":
      await resetCommit(gitService);
      break;
  }
}

async function createCommit(gitService: GitService): Promise<void> {
  const status = await gitService.getStatus();

  if (status.staged.length === 0) {
    console.log(
      chalk.yellow("⚠️  Staged 파일이 없습니다. 먼저 파일을 추가해주세요.")
    );
    return;
  }

  console.log(chalk.cyan("\n커밋할 파일:"));
  status.staged.forEach((file: string) =>
    console.log(chalk.green(`   + ${file}`))
  );
  console.log();

  const { commitMessage } = await inquirer.prompt([
    {
      type: "input",
      name: "commitMessage",
      message: "커밋 메시지를 입력하세요:",
      validate: (input) => {
        if (!input.trim()) {
          return "커밋 메시지는 비워둘 수 없습니다.";
        }
        return true;
      },
    },
  ]);

  await gitService.commit(commitMessage);
  console.log(chalk.green("✅ 커밋이 완료되었습니다!"));
}

async function revertCommit(gitService: GitService): Promise<void> {
  try {
    console.log(chalk.cyan("\n📜 최근 커밋 목록:\n"));

    const log = await gitService.getLog(10);

    if (log.all.length === 0) {
      console.log(chalk.yellow("⚠️  커밋 기록이 없습니다."));
      return;
    }

    log.all.forEach((commit, index) => {
      console.log(
        chalk.white(
          `${index + 1}. ${chalk.bold(commit.hash.substring(0, 7))} - ${
            commit.message
          }`
        )
      );
      console.log(chalk.gray(`   ${commit.author_name} | ${commit.date}\n`));
    });

    const { selectedCommit } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedCommit",
        message: "되돌릴 커밋을 선택하세요:",
        choices: log.all.map((commit, index) => ({
          name: `${commit.hash.substring(0, 7)} - ${commit.message}`,
          value: commit.hash,
        })),
      },
    ]);

    console.log(
      chalk.yellow(
        "\n💡 Revert는 선택한 커밋의 변경사항을 되돌리는 새로운 커밋을 생성합니다."
      )
    );
    console.log(
      chalk.gray(
        "   (원본 커밋은 그대로 유지되며, 히스토리가 안전하게 보존됩니다)\n"
      )
    );

    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `커밋 ${selectedCommit.substring(0, 7)}을 되돌리시겠습니까?`,
        default: true,
      },
    ]);

    if (!confirm) {
      console.log(chalk.yellow("취소되었습니다."));
      return;
    }

    await gitService.revert(selectedCommit);
    console.log(chalk.green("\n✅ 커밋이 성공적으로 되돌려졌습니다!"));
  } catch (error: any) {
    console.error(chalk.red(`\n❌ 커밋 되돌리기 실패: ${error.message}`));
  }
}

async function resetCommit(gitService: GitService): Promise<void> {
  try {
    console.log(chalk.cyan("\n📜 최근 커밋 목록:\n"));

    const log = await gitService.getLog(10);

    if (log.all.length === 0) {
      console.log(chalk.yellow("⚠️  커밋 기록이 없습니다."));
      return;
    }

    log.all.forEach((commit, index) => {
      console.log(
        chalk.white(
          `${index + 1}. ${chalk.bold(commit.hash.substring(0, 7))} - ${
            commit.message
          }`
        )
      );
      console.log(chalk.gray(`   ${commit.author_name} | ${commit.date}\n`));
    });

    const { resetType } = await inquirer.prompt([
      {
        type: "list",
        name: "resetType",
        message: "Reset 타입을 선택하세요:",
        choices: [
          {
            name: "↩️  Soft - 커밋만 취소 (변경사항은 Staged 상태로 유지)",
            value: "soft",
          },
          {
            name: "🔄 Mixed - 커밋과 Staging 취소 (변경사항은 Working Directory에 유지)",
            value: "mixed",
          },
          {
            name: "⚠️  Hard - 커밋과 변경사항 모두 취소 (되돌릴 수 없음!)",
            value: "hard",
          },
          { name: "🔙 돌아가기", value: "back" },
        ],
      },
    ]);

    if (resetType === "back") {
      return;
    }

    const { target } = await inquirer.prompt([
      {
        type: "list",
        name: "target",
        message: "어떻게 되돌리시겠습니까?",
        choices: [
          { name: "바로 이전 커밋으로 (HEAD~1)", value: "previous" },
          { name: "특정 커밋으로", value: "specific" },
        ],
      },
    ]);

    let commitHash: string | undefined;

    if (target === "specific") {
      const { selectedCommit } = await inquirer.prompt([
        {
          type: "list",
          name: "selectedCommit",
          message: "되돌릴 커밋을 선택하세요:",
          choices: log.all.map((commit, index) => ({
            name: `${commit.hash.substring(0, 7)} - ${commit.message}`,
            value: commit.hash,
          })),
        },
      ]);
      commitHash = selectedCommit;
    }

    console.log(
      chalk.red(
        "\n⚠️  경고: Reset은 커밋 히스토리를 변경합니다. 특히 Hard Reset은 되돌릴 수 없습니다!"
      )
    );

    if (resetType === "hard") {
      console.log(
        chalk.red("⚠️  Hard Reset은 모든 변경사항을 영구적으로 삭제합니다!\n")
      );
    }

    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `정말로 ${resetType.toUpperCase()} reset을 실행하시겠습니까?`,
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(chalk.yellow("취소되었습니다."));
      return;
    }

    switch (resetType) {
      case "soft":
        await gitService.resetSoft(commitHash);
        break;
      case "mixed":
        await gitService.resetMixed(commitHash);
        break;
      case "hard":
        await gitService.resetHard(commitHash);
        break;
    }

    console.log(chalk.green("\n✅ 커밋이 성공적으로 취소되었습니다!"));
  } catch (error: any) {
    console.error(chalk.red(`\n❌ 커밋 취소 실패: ${error.message}`));
  }
}

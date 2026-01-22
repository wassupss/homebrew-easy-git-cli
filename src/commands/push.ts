import inquirer from "inquirer";
import chalk from "chalk";
import { GitService } from "../services/git-service";

export async function handlePush(gitService: GitService): Promise<void> {
  const status = await gitService.getStatus();
  const currentBranch = status.current || "main";

  console.log(chalk.cyan(`\n현재 브랜치: ${chalk.bold(currentBranch)}`));

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `'${currentBranch}' 브랜치를 원격 저장소에 푸시하시겠습니까?`,
      default: true,
    },
  ]);

  if (!confirm) {
    return;
  }

  try {
    await gitService.push("origin", currentBranch);
    console.log(chalk.green("✅ 푸시가 완료되었습니다!"));
  } catch (error: any) {
    console.error(chalk.red("❌ 푸시 실패:", error.message));

    if (error.message.includes("upstream")) {
      const { setUpstream } = await inquirer.prompt([
        {
          type: "confirm",
          name: "setUpstream",
          message: "원격 브랜치를 설정하고 푸시하시겠습니까?",
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

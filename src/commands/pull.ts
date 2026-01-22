import inquirer from "inquirer";
import chalk from "chalk";
import { GitService } from "../services/git-service";

export async function handlePull(gitService: GitService): Promise<void> {
  const status = await gitService.getStatus();
  const currentBranch = status.current || "main";

  console.log(chalk.cyan(`\n현재 브랜치: ${chalk.bold(currentBranch)}`));

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `'${currentBranch}' 브랜치를 원격 저장소에서 풀하시겠습니까?`,
      default: true,
    },
  ]);

  if (!confirm) {
    return;
  }

  await gitService.pull("origin", currentBranch);
  console.log(chalk.green("✅ 풀이 완료되었습니다!"));
}

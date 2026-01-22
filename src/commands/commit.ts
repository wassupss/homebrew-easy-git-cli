import inquirer from "inquirer";
import chalk from "chalk";
import { GitService } from "../services/git-service";

export async function handleCommit(gitService: GitService): Promise<void> {
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

import inquirer from "inquirer";
import chalk from "chalk";
import { GitService } from "../services/git-service";

export async function handleLog(gitService: GitService): Promise<void> {
  const { count } = await inquirer.prompt([
    {
      type: "list",
      name: "count",
      message: "몇 개의 커밋을 보시겠습니까?",
      choices: [
        { name: "최근 5개", value: 5 },
        { name: "최근 10개", value: 10 },
        { name: "최근 20개", value: 20 },
        { name: "최근 50개", value: 50 },
      ],
      default: 10,
    },
  ]);

  const log = await gitService.getLog(count);

  console.log(chalk.cyan.bold(`\n📜 최근 ${count}개 커밋:\n`));

  if (log.all.length === 0) {
    console.log(chalk.yellow("커밋 기록이 없습니다."));
    return;
  }

  log.all.forEach(
    (
      commit: {
        hash: string;
        date: string;
        message: string;
        author_name: string;
        author_email: string;
      },
      index: number
    ) => {
      const date = new Date(commit.date);
      const formattedDate = date.toLocaleString("ko-KR");

      console.log(chalk.yellow(`${index + 1}. ${commit.hash.substring(0, 7)}`));
      console.log(chalk.white(`   ${commit.message}`));
      console.log(
        chalk.gray(`   작성자: ${commit.author_name} <${commit.author_email}>`)
      );
      console.log(chalk.gray(`   날짜: ${formattedDate}`));
      console.log();
    }
  );
}

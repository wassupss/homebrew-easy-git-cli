import inquirer from "inquirer";
import chalk from "chalk";
import { GitService } from "../services/git-service";
import { localeService } from "../services/locale-service";

export async function handleLog(gitService: GitService): Promise<void> {
  const { count } = await inquirer.prompt([
    {
      type: "list",
      name: "count",
      message: localeService.t("log.selectCount"),
      choices: [
        {
          name: `${localeService.t("log.latest")} 5${localeService.t(
            "log.commits"
          )}`,
          value: 5,
        },
        {
          name: `${localeService.t("log.latest")} 10${localeService.t(
            "log.commits"
          )}`,
          value: 10,
        },
        {
          name: `${localeService.t("log.latest")} 20${localeService.t(
            "log.commits"
          )}`,
          value: 20,
        },
        {
          name: `${localeService.t("log.latest")} 50${localeService.t(
            "log.commits"
          )}`,
          value: 50,
        },
      ],
      default: 10,
    },
  ]);

  const log = await gitService.getLog(count);

  console.log(chalk.cyan.bold(`\n${localeService.t("log.title")}\n`));

  if (log.all.length === 0) {
    console.log(chalk.yellow("No commits found."));
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
      const formattedDate = date.toLocaleString();

      console.log(chalk.yellow(`${index + 1}. ${commit.hash.substring(0, 7)}`));
      console.log(chalk.white(`   ${commit.message}`));
      console.log(
        chalk.gray(
          `   ${localeService.t("log.author")} ${commit.author_name} <${
            commit.author_email
          }>`
        )
      );
      console.log(
        chalk.gray(`   ${localeService.t("log.date")} ${formattedDate}`)
      );
      console.log();
    }
  );

  // 돌아가기 프롬프트
  await inquirer.prompt([
    {
      type: "input",
      name: "continue",
      message: localeService.t("log.pressEnter"),
    },
  ]);
}

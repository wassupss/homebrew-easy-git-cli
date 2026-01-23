import inquirer from "inquirer";
import chalk from "chalk";
import path from "path";
import { GitService } from "../services/git-service";
import { localeService } from "../services/locale-service";

export async function handleClone(): Promise<void> {
  console.log(chalk.cyan.bold(`\n📦 ${localeService.t("clone.title")}\n`));

  const { repoUrl } = await inquirer.prompt([
    {
      type: "input",
      name: "repoUrl",
      message: localeService.t("clone.enterUrl"),
      validate: (input) => {
        if (!input.trim()) {
          return localeService.t("clone.urlRequired");
        }
        return true;
      },
    },
  ]);

  const defaultDirName = getRepoNameFromUrl(repoUrl);

  const { useDefaultPath } = await inquirer.prompt([
    {
      type: "confirm",
      name: "useDefaultPath",
      message: `'${defaultDirName}' ${localeService.t("clone.useDefaultPath")}`,
      default: true,
    },
  ]);

  let localPath: string | undefined;

  if (!useDefaultPath) {
    const { customPath } = await inquirer.prompt([
      {
        type: "input",
        name: "customPath",
        message: localeService.t("clone.enterPath"),
        default: defaultDirName,
        validate: (input) => {
          if (!input.trim()) {
            return localeService.t("clone.pathRequired");
          }
          return true;
        },
      },
    ]);
    localPath = customPath;
  } else {
    localPath = defaultDirName;
  }

  try {
    const gitService = new GitService();
    await gitService.clone(repoUrl, localPath);

    console.log(chalk.green(`\n✅ ${localeService.t("clone.success")}`));
    console.log(
      chalk.cyan(
        `📁 ${localeService.t("clone.location")} ${path.resolve(
          localPath || defaultDirName
        )}`
      )
    );
    console.log(chalk.gray(`\n${localeService.t("clone.moveCommand")}`));
    console.log(chalk.white(`   cd ${localPath || defaultDirName}`));
  } catch (error: any) {
    console.error(
      chalk.red(`\n❌ ${localeService.t("clone.failed")} ${error.message}`)
    );

    if (error.message.includes("already exists")) {
      console.log(
        chalk.yellow(`⚠️  ${localeService.t("clone.alreadyExists")}`)
      );
    }
  }
}

function getRepoNameFromUrl(url: string): string {
  // https://github.com/user/repo.git -> repo
  // git@github.com:user/repo.git -> repo
  const match = url.match(/\/([^\/]+?)(\.git)?$/);
  if (match && match[1]) {
    return match[1];
  }
  return "cloned-repo";
}

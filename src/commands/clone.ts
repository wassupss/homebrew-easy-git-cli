import inquirer from "inquirer";
import chalk from "chalk";
import path from "path";
import { GitService } from "../services/git-service";

export async function handleClone(): Promise<void> {
  console.log(chalk.cyan.bold("\n📦 Git 저장소 클론\n"));

  const { repoUrl } = await inquirer.prompt([
    {
      type: "input",
      name: "repoUrl",
      message: "클론할 저장소 URL을 입력하세요:",
      validate: (input) => {
        if (!input.trim()) {
          return "URL은 비워둘 수 없습니다.";
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
      message: `현재 디렉토리에 '${defaultDirName}' 폴더로 클론하시겠습니까?`,
      default: true,
    },
  ]);

  let localPath: string | undefined;

  if (!useDefaultPath) {
    const { customPath } = await inquirer.prompt([
      {
        type: "input",
        name: "customPath",
        message: "클론할 경로를 입력하세요 (폴더명 또는 전체 경로):",
        default: defaultDirName,
        validate: (input) => {
          if (!input.trim()) {
            return "경로는 비워둘 수 없습니다.";
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

    console.log(chalk.green(`\n✅ 저장소가 성공적으로 클론되었습니다!`));
    console.log(
      chalk.cyan(`📁 위치: ${path.resolve(localPath || defaultDirName)}`)
    );
    console.log(chalk.gray(`\n다음 명령어로 이동하세요:`));
    console.log(chalk.white(`   cd ${localPath || defaultDirName}`));
  } catch (error: any) {
    console.error(chalk.red(`\n❌ 클론 실패: ${error.message}`));

    if (error.message.includes("already exists")) {
      console.log(
        chalk.yellow(
          "⚠️  해당 폴더가 이미 존재합니다. 다른 이름을 사용해주세요."
        )
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

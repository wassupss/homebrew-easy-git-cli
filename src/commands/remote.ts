import inquirer from "inquirer";
import chalk from "chalk";
import { GitService } from "../services/git-service";

export async function handleRemote(gitService: GitService): Promise<void> {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "원격 저장소 작업을 선택하세요:",
      choices: [
        { name: "📋 원격 저장소 목록 보기", value: "list" },
        { name: "➕ 원격 저장소 추가", value: "add" },
        { name: "🗑️  원격 저장소 제거", value: "remove" },
        { name: "🔄 Fetch (원격 정보 가져오기)", value: "fetch" },
        { name: "← 돌아가기", value: "back" },
      ],
    },
  ]);

  switch (action) {
    case "list":
      await showRemoteList(gitService);
      break;
    case "add":
      await addRemote(gitService);
      break;
    case "remove":
      await removeRemote(gitService);
      break;
    case "fetch":
      await fetchRemote(gitService);
      break;
    case "back":
      return;
  }
}

async function showRemoteList(gitService: GitService): Promise<void> {
  const remotes = await gitService.getRemotes();

  console.log(chalk.cyan.bold("\n📋 원격 저장소 목록:\n"));

  if (remotes.length === 0) {
    console.log(chalk.yellow("원격 저장소가 없습니다."));
    return;
  }

  remotes.forEach((remote) => {
    console.log(chalk.green(`   ${remote.name}`));
    console.log(chalk.gray(`   Fetch: ${remote.refs.fetch}`));
    console.log(chalk.gray(`   Push:  ${remote.refs.push}`));
    console.log();
  });
}

async function addRemote(gitService: GitService): Promise<void> {
  const { remoteName, remoteUrl } = await inquirer.prompt([
    {
      type: "input",
      name: "remoteName",
      message: "원격 저장소 이름을 입력하세요:",
      default: "origin",
      validate: (input) => {
        if (!input.trim()) {
          return "이름은 비워둘 수 없습니다.";
        }
        return true;
      },
    },
    {
      type: "input",
      name: "remoteUrl",
      message: "원격 저장소 URL을 입력하세요:",
      validate: (input) => {
        if (!input.trim()) {
          return "URL은 비워둘 수 없습니다.";
        }
        if (
          !input.includes("github.com") &&
          !input.includes("gitlab.com") &&
          !input.includes("bitbucket.org") &&
          !input.includes(".git")
        ) {
          console.log(
            chalk.yellow(
              "\n⚠️  일반적인 Git URL 형식이 아닙니다. 계속 진행합니다."
            )
          );
        }
        return true;
      },
    },
  ]);

  try {
    await gitService.addRemote(remoteName, remoteUrl);
    console.log(
      chalk.green(`✅ 원격 저장소 '${remoteName}'이 추가되었습니다!`)
    );
  } catch (error: any) {
    console.error(chalk.red(`❌ 추가 실패: ${error.message}`));
  }
}

async function removeRemote(gitService: GitService): Promise<void> {
  const remotes = await gitService.getRemotes();

  if (remotes.length === 0) {
    console.log(chalk.yellow("제거할 원격 저장소가 없습니다."));
    return;
  }

  const { selectedRemote } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedRemote",
      message: "제거할 원격 저장소를 선택하세요:",
      choices: remotes.map((remote) => ({
        name: `${remote.name} (${remote.refs.fetch})`,
        value: remote.name,
      })),
    },
  ]);

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `정말로 '${selectedRemote}'을 제거하시겠습니까?`,
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow("취소되었습니다."));
    return;
  }

  try {
    await gitService.removeRemote(selectedRemote);
    console.log(
      chalk.green(`✅ 원격 저장소 '${selectedRemote}'이 제거되었습니다!`)
    );
  } catch (error: any) {
    console.error(chalk.red(`❌ 제거 실패: ${error.message}`));
  }
}

async function fetchRemote(gitService: GitService): Promise<void> {
  try {
    await gitService.fetchAll();
    console.log(chalk.green("✅ 원격 브랜치 정보를 가져왔습니다!"));
  } catch (error: any) {
    console.error(chalk.red(`❌ Fetch 실패: ${error.message}`));
  }
}

import inquirer from "inquirer";
import chalk from "chalk";
import { GitService } from "../services/git-service";

export async function handleAdd(gitService: GitService): Promise<void> {
  const status = await gitService.getStatus();

  const allFiles = [...status.not_added, ...status.modified, ...status.deleted];

  if (allFiles.length === 0) {
    console.log(chalk.yellow("추가할 파일이 없습니다."));
    return;
  }

  const { addChoice } = await inquirer.prompt([
    {
      type: "list",
      name: "addChoice",
      message: "어떻게 추가하시겠습니까?",
      choices: [
        { name: "모든 파일 추가", value: "all" },
        { name: "특정 파일 선택", value: "select" },
        { name: "취소", value: "cancel" },
      ],
    },
  ]);

  if (addChoice === "cancel") {
    return;
  }

  if (addChoice === "all") {
    await gitService.addAll();
    console.log(chalk.green("✅ 모든 파일이 추가되었습니다."));
    return;
  }

  if (addChoice === "select") {
    const { selectedFiles } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "selectedFiles",
        message: "추가할 파일을 선택하세요 (스페이스바로 선택):",
        choices: allFiles.map((file) => ({
          name: file,
          value: file,
        })),
        validate: (answer) => {
          if (answer.length === 0) {
            return "최소 1개 이상의 파일을 선택해야 합니다.";
          }
          return true;
        },
      },
    ]);

    await gitService.add(selectedFiles);
    console.log(
      chalk.green(`✅ ${selectedFiles.length}개 파일이 추가되었습니다.`)
    );
  }
}

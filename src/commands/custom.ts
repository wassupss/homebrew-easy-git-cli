import inquirer from "inquirer";
import chalk from "chalk";
import { GitService } from "../services/git-service";
import { ConfigService, CustomCommand } from "../services/config-service";
import { displayStatus } from "./status";
import { handleAdd } from "./add";
import { handleCommit } from "./commit";
import { handlePush } from "./push";
import { handlePull } from "./pull";
import { handleStash } from "./stash";

export async function executeCustomCommand(
  commandName: string,
  gitService: GitService,
  configService: ConfigService
): Promise<void> {
  const command = configService.getCustomCommand(commandName);

  if (!command) {
    console.log(
      chalk.red(`❌ 커스텀 커맨드 '${commandName}'을 찾을 수 없습니다.`)
    );
    return;
  }

  console.log(chalk.cyan(`\n🚀 커스텀 커맨드 실행: ${command.name}`));
  console.log(chalk.gray(`   ${command.description}\n`));

  try {
    for (const action of command.actions) {
      await executeAction(action, gitService, configService);
    }
    console.log(chalk.green(`\n✅ '${command.name}' 커맨드 완료!`));
  } catch (error: any) {
    console.error(chalk.red(`\n❌ 커맨드 실행 중 오류: ${error.message}`));
  }
}

async function executeAction(
  action: any,
  gitService: GitService,
  configService: ConfigService
): Promise<void> {
  switch (action.type) {
    case "status":
      await displayStatus(gitService);
      break;

    case "add":
      if (action.params?.all) {
        await gitService.addAll();
        console.log(chalk.green("✅ 모든 파일이 추가되었습니다."));
      } else {
        await handleAdd(gitService);
      }
      break;

    case "commit":
      if (action.params?.message) {
        await gitService.commit(action.params.message);
      } else {
        await handleCommit(gitService);
      }
      break;

    case "push":
      await handlePush(gitService);
      break;

    case "pull":
      await handlePull(gitService);
      break;

    case "branch":
      if (action.params?.action === "switch" && action.params?.name) {
        await gitService.switchBranch(action.params.name);
      } else if (action.params?.action === "switch") {
        await promptAndSwitchBranch(gitService);
      }
      break;

    case "stash":
      if (action.params?.action === "save") {
        await gitService.stashSave(action.params?.message);
        console.log(chalk.green("✅ Stash 저장됨"));
      } else if (action.params?.action === "pop") {
        await gitService.stashPop();
        console.log(chalk.green("✅ Stash 복원됨"));
      } else {
        await handleStash(gitService);
      }
      break;

    default:
      console.log(chalk.yellow(`⚠️  알 수 없는 액션: ${action.type}`));
  }
}

async function promptAndSwitchBranch(gitService: GitService): Promise<void> {
  const branches = await gitService.getBranches();
  const branchList = Object.keys(branches.branches).filter(
    (name) => !branches.branches[name].current
  );

  if (branchList.length === 0) {
    console.log(chalk.yellow("전환할 수 있는 다른 브랜치가 없습니다."));
    return;
  }

  const { selectedBranch } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedBranch",
      message: "전환할 브랜치를 선택하세요:",
      choices: branchList,
    },
  ]);

  const config = new ConfigService().getConfig();

  if (config.autoPullOnBranchSwitch) {
    await gitService.switchBranchWithPull(selectedBranch);
  } else {
    await gitService.switchBranch(selectedBranch);
  }
}

export async function handleCustomCommands(
  gitService: GitService,
  configService: ConfigService
): Promise<void> {
  const config = configService.getConfig();

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "커스텀 커맨드 관리:",
      choices: [
        { name: "▶️  커스텀 커맨드 실행", value: "execute" },
        { name: "📋 커스텀 커맨드 목록", value: "list" },
        { name: "➕ 새 커맨드 추가", value: "add" },
        { name: "🗑️  커맨드 삭제", value: "remove" },
        { name: "⚙️  설정 보기", value: "settings" },
        { name: "🔄 기본값으로 초기화", value: "reset" },
        { name: "← 돌아가기", value: "back" },
      ],
    },
  ]);

  switch (action) {
    case "execute":
      await executeCustomCommandInteractive(gitService, configService);
      break;
    case "list":
      showCustomCommandsList(configService);
      break;
    case "add":
      await addCustomCommand(configService);
      break;
    case "remove":
      await removeCustomCommand(configService);
      break;
    case "settings":
      showSettings(configService);
      break;
    case "reset":
      await resetSettings(configService);
      break;
    case "back":
      return;
  }
}

async function executeCustomCommandInteractive(
  gitService: GitService,
  configService: ConfigService
): Promise<void> {
  const config = configService.getConfig();

  if (config.customCommands.length === 0) {
    console.log(chalk.yellow("등록된 커스텀 커맨드가 없습니다."));
    return;
  }

  const { selectedCommand } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedCommand",
      message: "실행할 커맨드를 선택하세요:",
      choices: config.customCommands.map((cmd) => ({
        name: `${cmd.name} - ${cmd.description}`,
        value: cmd.name,
      })),
    },
  ]);

  await executeCustomCommand(selectedCommand, gitService, configService);
}

function showCustomCommandsList(configService: ConfigService): void {
  const config = configService.getConfig();

  console.log(chalk.cyan.bold("\n📋 등록된 커스텀 커맨드:\n"));

  if (config.customCommands.length === 0) {
    console.log(chalk.yellow("등록된 커스텀 커맨드가 없습니다."));
    return;
  }

  config.customCommands.forEach((cmd, index) => {
    console.log(chalk.green(`${index + 1}. ${cmd.name}`));
    console.log(chalk.gray(`   설명: ${cmd.description}`));
    console.log(
      chalk.gray(`   액션: ${cmd.actions.map((a) => a.type).join(" → ")}`)
    );
    console.log();
  });
}

async function addCustomCommand(configService: ConfigService): Promise<void> {
  console.log(chalk.cyan("\n➕ 새 커스텀 커맨드 추가\n"));
  console.log(chalk.gray('예: "eg <커맨드이름>" 형태로 사용됩니다.\n'));

  const { name, description } = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "커맨드 이름:",
      validate: (input) => {
        if (!input.trim()) return "이름은 비워둘 수 없습니다.";
        if (!/^[a-z0-9-]+$/.test(input))
          return "소문자, 숫자, - 만 사용 가능합니다.";
        return true;
      },
    },
    {
      type: "input",
      name: "description",
      message: "설명:",
      validate: (input) => (input.trim() ? true : "설명은 비워둘 수 없습니다."),
    },
  ]);

  const actions: any[] = [];
  let addMore = true;

  while (addMore) {
    const { actionType } = await inquirer.prompt([
      {
        type: "list",
        name: "actionType",
        message: `액션 ${actions.length + 1} - 어떤 작업을 추가하시겠습니까?`,
        choices: [
          { name: "상태 확인 (status)", value: "status" },
          { name: "파일 추가 (add)", value: "add" },
          { name: "커밋 (commit)", value: "commit" },
          { name: "푸시 (push)", value: "push" },
          { name: "풀 (pull)", value: "pull" },
          { name: "브랜치 전환 (branch)", value: "branch" },
          { name: "Stash 저장 (stash save)", value: "stash-save" },
          { name: "Stash 복원 (stash pop)", value: "stash-pop" },
        ],
      },
    ]);

    if (actionType === "add") {
      const { addAll } = await inquirer.prompt([
        {
          type: "confirm",
          name: "addAll",
          message: "모든 파일을 추가하시겠습니까?",
          default: true,
        },
      ]);
      actions.push({ type: "add", params: { all: addAll } });
    } else if (actionType === "stash-save") {
      actions.push({ type: "stash", params: { action: "save" } });
    } else if (actionType === "stash-pop") {
      actions.push({ type: "stash", params: { action: "pop" } });
    } else if (actionType === "branch") {
      actions.push({ type: "branch", params: { action: "switch" } });
    } else {
      actions.push({ type: actionType });
    }

    const { continue: continueAdding } = await inquirer.prompt([
      {
        type: "confirm",
        name: "continue",
        message: "액션을 더 추가하시겠습니까?",
        default: false,
      },
    ]);

    addMore = continueAdding;
  }

  const newCommand: CustomCommand = { name, description, actions };
  configService.addCustomCommand(newCommand);

  console.log(chalk.green(`\n✅ 커맨드 '${name}'이 추가되었습니다!`));
  console.log(chalk.cyan(`사용법: eg ${name}`));
}

async function removeCustomCommand(
  configService: ConfigService
): Promise<void> {
  const config = configService.getConfig();

  if (config.customCommands.length === 0) {
    console.log(chalk.yellow("삭제할 커맨드가 없습니다."));
    return;
  }

  const { selectedCommand } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedCommand",
      message: "삭제할 커맨드를 선택하세요:",
      choices: config.customCommands.map((cmd) => ({
        name: `${cmd.name} - ${cmd.description}`,
        value: cmd.name,
      })),
    },
  ]);

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `정말로 '${selectedCommand}' 커맨드를 삭제하시겠습니까?`,
      default: false,
    },
  ]);

  if (confirm) {
    configService.removeCustomCommand(selectedCommand);
  } else {
    console.log(chalk.yellow("취소되었습니다."));
  }
}

function showSettings(configService: ConfigService): void {
  const config = configService.getConfig();

  console.log(chalk.cyan.bold("\n⚙️  Easy Git 설정:\n"));
  console.log(chalk.white(`기본 브랜치: ${chalk.bold(config.defaultBranch)}`));
  console.log(
    chalk.white(
      `자동 Stash: ${config.autoStash ? chalk.green("ON") : chalk.gray("OFF")}`
    )
  );
  console.log(
    chalk.white(
      `브랜치 전환시 자동 Pull: ${
        config.autoPullOnBranchSwitch ? chalk.green("ON") : chalk.gray("OFF")
      }`
    )
  );
  console.log(
    chalk.white(
      `커스텀 커맨드 개수: ${chalk.bold(config.customCommands.length)}개`
    )
  );
  console.log();
}

async function resetSettings(configService: ConfigService): Promise<void> {
  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message:
        "설정을 기본값으로 초기화하시겠습니까? (모든 커스텀 커맨드가 삭제됩니다)",
      default: false,
    },
  ]);

  if (confirm) {
    configService.resetToDefault();
  } else {
    console.log(chalk.yellow("취소되었습니다."));
  }
}

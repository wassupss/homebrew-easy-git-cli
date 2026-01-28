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
import { handleRebase } from "./rebase";
import { handleRollback } from "./rollback";
import { handleBranch } from "./branch";
import { handlePR, createPR, viewPRList, openPRHome } from "./pr";
import { localeService } from "../services/locale-service";
import { getSafePageSize } from "../utils/terminal-helper";

export async function executeCustomCommand(
  commandName: string,
  gitService: GitService,
  configService: ConfigService
): Promise<void> {
  const command = configService.getCustomCommand(commandName);

  if (!command) {
    console.log(
      chalk.red(
        `❌ ${localeService.t("custom.commandNotFound")} '${commandName}'`
      )
    );
    return;
  }

  console.log(
    chalk.cyan(`\n🚀 ${localeService.t("custom.executing")} ${command.name}`)
  );
  console.log(chalk.gray(`   ${command.description}\n`));

  try {
    for (const action of command.actions) {
      await executeAction(action, gitService, configService);
    }
    console.log(
      chalk.green(
        `\n✅ '${command.name}'${localeService.t("custom.completed")}`
      )
    );
  } catch (error: any) {
    console.error(
      chalk.red(
        `\n❌ ${localeService.t("custom.executionError")} ${error.message}`
      )
    );
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
        console.log(
          chalk.green(`✅ ${localeService.t("custom.allFilesAdded")}`)
        );
      } else {
        await handleAdd(gitService);
      }
      break;

    case "commit":
      await handleCommit(gitService);
      break;

    case "create-commit":
      if (action.params?.message) {
        await gitService.commit(action.params.message);
        console.log(
          chalk.green(`✅ ${localeService.t("custom.commitCreated")}`)
        );
      } else {
        const { message } = await inquirer.prompt([
          {
            type: "input",
            name: "message",
            message: localeService.t("commit.enterMessage"),
            validate: (input) =>
              input.trim() ? true : localeService.t("commit.messageRequired"),
          },
        ]);
        await gitService.commit(message);
        console.log(
          chalk.green(`✅ ${localeService.t("custom.commitCreated")}`)
        );
      }
      break;

    case "push":
      await handlePush(gitService);
      break;

    case "pull":
      await handlePull(gitService);
      break;

    case "branch":
      await handleBranch(gitService);
      break;

    case "branch-switch":
      if (action.params?.name) {
        await gitService.switchBranch(action.params.name);
      } else {
        await promptAndSwitchBranch(gitService);
      }
      break;

    case "branch-create":
      if (action.params?.name) {
        await gitService.createBranch(action.params.name);
        console.log(
          chalk.green(
            `✅ ${localeService.t("custom.branchCreated")}: ${
              action.params.name
            }`
          )
        );
      } else {
        // 실행 시 입력 받기
        const { branchName } = await inquirer.prompt([
          {
            type: "input",
            name: "branchName",
            message: "생성할 브랜치 이름을 입력하세요:",
            validate: (input) =>
              input.trim() ? true : "브랜치 이름은 필수입니다",
          },
        ]);
        await gitService.createBranch(branchName);
        console.log(
          chalk.green(
            `✅ ${localeService.t("custom.branchCreated")}: ${branchName}`
          )
        );
      }
      break;

    case "branch-delete":
      if (action.params?.name) {
        await gitService.deleteBranch(
          action.params.name,
          action.params?.force || false
        );
        console.log(
          chalk.green(
            `✅ ${localeService.t("custom.branchDeleted")}: ${
              action.params.name
            }`
          )
        );
      } else {
        // 실행 시 입력 받기
        const branches = await gitService.getBranches();
        const branchList = Object.keys(branches.branches).filter(
          (name) => !branches.branches[name].current
        );

        if (branchList.length === 0) {
          console.log(chalk.yellow("삭제할 브랜치가 없습니다."));
          break;
        }

        const { branchName } = await inquirer.prompt([
          {
            type: "list",
            name: "branchName",
            message: "삭제할 브랜치를 선택하세요:",
            choices: branchList,
          },
        ]);

        const { force } = await inquirer.prompt([
          {
            type: "confirm",
            name: "force",
            message: "강제 삭제하시겠습니까?",
            default: false,
          },
        ]);

        await gitService.deleteBranch(branchName, force);
        console.log(
          chalk.green(
            `✅ ${localeService.t("custom.branchDeleted")}: ${branchName}`
          )
        );
      }
      break;

    case "stash":
      await handleStash(gitService);
      break;

    case "stash-save":
      if (action.params?.message) {
        await gitService.stashSave(action.params.message);
      } else {
        await gitService.stashSave();
      }
      console.log(chalk.green(`✅ ${localeService.t("custom.stashSaved")}`));
      break;

    case "stash-pop":
      await gitService.stashPop();
      console.log(chalk.green(`✅ ${localeService.t("custom.stashPopped")}`));
      break;

    case "stash-list":
      const stashList = await gitService.stashList();
      if (stashList.length === 0) {
        console.log(chalk.yellow(localeService.t("stash.empty")));
      } else {
        console.log(chalk.cyan.bold(`\n${localeService.t("stash.list")}\n`));
        stashList.forEach((stash: any) => {
          console.log(chalk.white(`${stash.index}: ${stash.message}`));
        });
      }
      break;

    case "stash-drop":
      if (action.params?.index !== undefined) {
        await gitService.stashDrop(action.params.index);
        console.log(
          chalk.green(`✅ ${localeService.t("custom.stashDropped")}`)
        );
      }
      break;

    case "stash-clear":
      await gitService.stashClear();
      console.log(chalk.green(`✅ ${localeService.t("custom.stashCleared")}`));
      break;

    case "rebase":
      await handleRebase(gitService);
      break;

    case "rebase-branch":
      if (action.params?.branch) {
        await gitService.rebase(action.params.branch);
        console.log(
          chalk.green(`✅ ${localeService.t("custom.rebaseComplete")}`)
        );
      }
      break;

    case "revert":
      if (action.params?.commitHash) {
        await gitService.revert(action.params.commitHash);
        console.log(
          chalk.green(`✅ ${localeService.t("custom.revertComplete")}`)
        );
      } else {
        // 실행 시 입력 받기
        const { commitHash } = await inquirer.prompt([
          {
            type: "input",
            name: "commitHash",
            message: "되돌릴 커밋 해시를 입력하세요:",
            validate: (input) =>
              input.trim() ? true : "커밋 해시는 필수입니다",
          },
        ]);
        await gitService.revert(commitHash);
        console.log(
          chalk.green(`✅ ${localeService.t("custom.revertComplete")}`)
        );
      }
      break;

    case "reset":
      if (action.params?.type === "soft") {
        await gitService.resetSoft(action.params?.commitHash);
      } else if (action.params?.type === "mixed") {
        await gitService.resetMixed(action.params?.commitHash);
      } else if (action.params?.type === "hard") {
        await gitService.resetHard(action.params?.commitHash);
      }
      console.log(chalk.green(`✅ ${localeService.t("custom.resetComplete")}`));
      break;

    case "discard":
      if (action.params?.files && action.params.files.length > 0) {
        await gitService.discardChanges(action.params.files);
        console.log(
          chalk.green(`✅ ${localeService.t("custom.discardComplete")}`)
        );
      }
      break;

    case "rollback":
      await handleRollback(gitService);
      break;

    case "branch-management":
      await handleBranch(gitService);
      break;

    case "pr":
      await handlePR(gitService);
      break;

    case "pr-create":
      await createPR(gitService);
      break;

    case "pr-list":
      await viewPRList(gitService);
      break;

    case "pr-open":
      await openPRHome(gitService);
      break;

    case "merge":
      if (action.params?.branch) {
        await gitService.merge(
          action.params.branch,
          action.params?.noFf || false
        );
        console.log(
          chalk.green(`✅ ${localeService.t("custom.mergeComplete")}`)
        );
      } else {
        // 실행 시 입력 받기
        const branches = await gitService.getBranches();
        const branchList = Object.keys(branches.branches).filter(
          (name) => !branches.branches[name].current
        );

        if (branchList.length === 0) {
          console.log(chalk.yellow("병합할 브랜치가 없습니다."));
          break;
        }

        const { branchName } = await inquirer.prompt([
          {
            type: "list",
            name: "branchName",
            message: "병합할 브랜치를 선택하세요:",
            choices: branchList,
          },
        ]);

        const { noFf } = await inquirer.prompt([
          {
            type: "confirm",
            name: "noFf",
            message: "No Fast-Forward 병합을 사용하시겠습니까?",
            default: false,
          },
        ]);

        await gitService.merge(branchName, noFf);
        console.log(
          chalk.green(`✅ ${localeService.t("custom.mergeComplete")}`)
        );
      }
      break;

    case "fetch":
      await gitService.fetchAll();
      console.log(chalk.green(`✅ ${localeService.t("custom.fetchComplete")}`));
      break;

    case "create-branch":
      if (action.params?.name) {
        await gitService.createBranch(action.params.name);
        console.log(
          chalk.green(
            `✅ ${localeService.t("custom.branchCreated")}: ${
              action.params.name
            }`
          )
        );
      }
      break;

    case "delete-branch":
      if (action.params?.name) {
        await gitService.deleteBranch(
          action.params.name,
          action.params?.force || false
        );
        console.log(
          chalk.green(
            `✅ ${localeService.t("custom.branchDeleted")}: ${
              action.params.name
            }`
          )
        );
      }
      break;

    case "tag":
      if (action.params?.name) {
        await gitService.createTag(action.params.name, action.params?.message);
        console.log(
          chalk.green(
            `✅ ${localeService.t("custom.tagCreated")}: ${action.params.name}`
          )
        );
      } else {
        // 실행 시 입력 받기
        const { tagName, tagMessage } = await inquirer.prompt([
          {
            type: "input",
            name: "tagName",
            message: "태그 이름을 입력하세요:",
            validate: (input) =>
              input.trim() ? true : "태그 이름은 필수입니다",
          },
          {
            type: "input",
            name: "tagMessage",
            message: "태그 메시지 (선택사항, 엔터로 건너뛰기):",
          },
        ]);
        await gitService.createTag(tagName, tagMessage || undefined);
        console.log(
          chalk.green(`✅ ${localeService.t("custom.tagCreated")}: ${tagName}`)
        );
      }
      break;

    default:
      console.log(
        chalk.yellow(
          `⚠️  ${localeService.t("custom.unknownAction")} ${action.type}`
        )
      );
  }
}

async function promptAndSwitchBranch(gitService: GitService): Promise<void> {
  const branches = await gitService.getBranches();
  const branchList = Object.keys(branches.branches).filter(
    (name) => !branches.branches[name].current
  );

  if (branchList.length === 0) {
    console.log(chalk.yellow(localeService.t("custom.noOtherBranches")));
    return;
  }

  const { selectedBranch } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedBranch",
      message: localeService.t("custom.selectBranch"),
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
  while (true) {
    const config = configService.getConfig();

    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: localeService.t("custom.selectAction"),
        choices: [
          { name: localeService.t("custom.execute"), value: "execute" },
          { name: localeService.t("custom.list"), value: "list" },
          { name: localeService.t("custom.add"), value: "add" },
          { name: localeService.t("custom.remove"), value: "remove" },
          { name: localeService.t("common.back"), value: "back" },
        ],
        pageSize: getSafePageSize(10, 5),
      },
    ]);

    if (action === "back") {
      return;
    }

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
    }
  }
}

async function executeCustomCommandInteractive(
  gitService: GitService,
  configService: ConfigService
): Promise<void> {
  const config = configService.getConfig();

  if (config.customCommands.length === 0) {
    console.log(chalk.yellow(localeService.t("custom.noCommands")));
    return;
  }

  const { selectedCommand } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedCommand",
      message: localeService.t("custom.selectToExecute"),
      choices: config.customCommands.map((cmd) => ({
        name: `${cmd.name} - ${cmd.description}`,
        value: cmd.name,
      })),
      pageSize: getSafePageSize(10, 5),
    },
  ]);

  await executeCustomCommand(selectedCommand, gitService, configService);
}

function showCustomCommandsList(configService: ConfigService): void {
  const config = configService.getConfig();

  console.log(chalk.cyan.bold(`\n${localeService.t("custom.listTitle")}\n`));

  if (config.customCommands.length === 0) {
    console.log(chalk.yellow(localeService.t("custom.noCommands")));
    return;
  }

  config.customCommands.forEach((cmd, index) => {
    console.log(chalk.green(`${index + 1}. ${cmd.name}`));
    console.log(
      chalk.gray(
        `   ${localeService.t("custom.description")} ${cmd.description}`
      )
    );
    console.log(
      chalk.gray(
        `   ${localeService.t("custom.actions")} ${cmd.actions
          .map((a) => a.type)
          .join(" → ")}`
      )
    );
    console.log();
  });
}

async function addCustomCommand(configService: ConfigService): Promise<void> {
  console.log(chalk.cyan(`\n${localeService.t("custom.addTitle")}\n`));
  console.log(chalk.gray(`${localeService.t("custom.addUsage")}\n`));

  const { name, description } = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: localeService.t("custom.enterName"),
      validate: (input) => {
        if (!input.trim()) return localeService.t("custom.nameRequired");
        if (!/^[a-z0-9-]+$/.test(input))
          return localeService.t("custom.nameInvalid");
        return true;
      },
    },
    {
      type: "input",
      name: "description",
      message: localeService.t("custom.enterDescription"),
      validate: (input) =>
        input.trim() ? true : localeService.t("custom.descriptionRequired"),
    },
  ]);

  const actions: any[] = [];
  let addMore = true;

  while (addMore) {
    // 먼저 카테고리 선택
    const categoryChoices = [
      { name: "📊 기본 작업", value: "basic" },
      { name: "🌿 브랜치 관리", value: "branch" },
      { name: "📦 스태시", value: "stash" },
      { name: "🔄 고급 작업", value: "advanced" },
      { name: "🔧 PR 작업", value: "pr" },
      { name: "📝 메뉴 열기", value: "menu" },
    ];

    // 액션이 하나라도 있으면 완료 옵션 추가
    if (actions.length > 0) {
      categoryChoices.push({ name: "✅ 완료 (저장하기)", value: "done" });
    }
    categoryChoices.push({
      name: localeService.t("common.back"),
      value: "back",
    });

    const { category } = await inquirer.prompt([
      {
        type: "list",
        name: "category",
        message: `액션 카테고리를 선택하세요 (${actions.length + 1}번째):`,
        choices: categoryChoices,
        pageSize: getSafePageSize(10, 5),
      },
    ]);

    // 뒤로가기 선택 시
    if (category === "back") {
      console.log(chalk.yellow(localeService.t("common.cancelled")));
      return;
    }

    // 완료 선택 시
    if (category === "done") {
      break;
    }

    let actionChoices: any[] = [];

    // 카테고리별 액션 목록
    switch (category) {
      case "basic":
        actionChoices = [
          { name: "📊 상태 보기", value: "status" },
          { name: "➕ 파일 추가 메뉴", value: "add" },
          { name: "➕ 모든 파일 추가", value: "add-all" },
          { name: "💾 커밋 생성", value: "create-commit" },
          { name: "⬆️  푸시 메뉴", value: "push" },
          { name: "⬇️  풀 메뉴", value: "pull" },
          { name: "📥 페치", value: "fetch" },
        ];
        break;

      case "branch":
        actionChoices = [
          { name: "🌿 브랜치 메뉴 (전체)", value: "branch" },
          { name: "🔀 브랜치 전환", value: "branch-switch" },
          { name: "➕ 브랜치 생성", value: "branch-create" },
          { name: "🗑️  브랜치 삭제", value: "branch-delete" },
          { name: "🔀 병합", value: "merge" },
        ];
        break;

      case "stash":
        actionChoices = [
          { name: "📦 스태시 메뉴 (전체)", value: "stash" },
          { name: "💾 스태시 저장", value: "stash-save" },
          { name: "📤 스태시 복원", value: "stash-pop" },
          { name: "📋 스태시 목록", value: "stash-list" },
          { name: "🗑️  스태시 삭제", value: "stash-drop" },
          { name: "🧹 스태시 전체삭제", value: "stash-clear" },
        ];
        break;

      case "advanced":
        actionChoices = [
          { name: "🔄 리베이스 메뉴", value: "rebase" },
          { name: "🔄 리베이스 실행", value: "rebase-branch" },
          { name: "↩️  커밋 되돌리기", value: "revert" },
          { name: "🔙 Soft Reset", value: "reset-soft" },
          { name: "🔙 Mixed Reset", value: "reset-mixed" },
          { name: "🔙 Hard Reset", value: "reset-hard" },
          { name: "🗑️  변경사항 버리기", value: "discard" },
          { name: "🏷️  태그 생성", value: "tag" },
          { name: "⏮️  롤백 메뉴", value: "rollback" },
        ];
        break;

      case "pr":
        actionChoices = [
          { name: "🔧 PR 메뉴 (전체)", value: "pr" },
          { name: "🆕 PR 생성", value: "pr-create" },
          { name: "📋 PR 목록", value: "pr-list" },
          { name: "🏠 PR 홈페이지 열기", value: "pr-open" },
        ];
        break;

      case "menu":
        actionChoices = [
          { name: "📝 커밋 메뉴", value: "commit" },
          { name: "🌳 브랜치 관리 메뉴", value: "branch-management" },
        ];
        break;
    }

    // 모든 카테고리에 뒤로가기 추가
    actionChoices.push({ name: localeService.t("common.back"), value: "back" });

    const { actionType } = await inquirer.prompt([
      {
        type: "list",
        name: "actionType",
        message: "실행할 액션을 선택하세요:",
        choices: actionChoices,
        pageSize: getSafePageSize(12, 5),
      },
    ]);

    // 뒤로가기 선택 시 카테고리 선택으로 돌아가기
    if (actionType === "back") {
      continue;
    }

    // 액션별 파라미터 처리 - 필요한 입력만 받기
    switch (actionType) {
      case "add":
      case "add-all":
        if (actionType === "add-all") {
          actions.push({ type: "add", params: { all: true } });
        } else {
          actions.push({ type: "add", params: {} });
        }
        break;

      case "create-commit":
        const { hasMessage } = await inquirer.prompt([
          {
            type: "confirm",
            name: "hasMessage",
            message: "커밋 메시지를 미리 설정하시겠습니까?",
            default: false,
          },
        ]);

        if (hasMessage) {
          const { commitMessage } = await inquirer.prompt([
            {
              type: "input",
              name: "commitMessage",
              message: "커밋 메시지:",
              validate: (input) =>
                input.trim() ? true : "커밋 메시지는 필수입니다",
            },
          ]);
          actions.push({
            type: "create-commit",
            params: { message: commitMessage },
          });
        } else {
          actions.push({ type: "create-commit", params: {} });
        }
        break;

      case "branch-switch":
        const { presetBranch } = await inquirer.prompt([
          {
            type: "confirm",
            name: "presetBranch",
            message: "브랜치 이름을 미리 설정하시겠습니까?",
            default: false,
          },
        ]);

        if (presetBranch) {
          const { branchName } = await inquirer.prompt([
            {
              type: "input",
              name: "branchName",
              message: "전환할 브랜치 이름:",
              validate: (input) =>
                input.trim() ? true : "브랜치 이름은 필수입니다",
            },
          ]);
          actions.push({ type: "branch-switch", params: { name: branchName } });
        } else {
          actions.push({ type: "branch-switch", params: {} });
        }
        break;

      case "branch-create":
        const { presetCreate } = await inquirer.prompt([
          {
            type: "confirm",
            name: "presetCreate",
            message: "브랜치 이름을 미리 설정하시겠습니까?",
            default: false,
          },
        ]);

        if (presetCreate) {
          const { branchName } = await inquirer.prompt([
            {
              type: "input",
              name: "branchName",
              message: "생성할 브랜치 이름:",
              validate: (input) =>
                input.trim() ? true : "브랜치 이름은 필수입니다",
            },
          ]);
          actions.push({ type: "branch-create", params: { name: branchName } });
        } else {
          actions.push({ type: "branch-create", params: {} });
        }
        break;

      case "branch-delete":
        const { presetDelete } = await inquirer.prompt([
          {
            type: "confirm",
            name: "presetDelete",
            message: "브랜치 이름을 미리 설정하시겠습니까?",
            default: false,
          },
        ]);

        if (presetDelete) {
          const { branchName } = await inquirer.prompt([
            {
              type: "input",
              name: "branchName",
              message: "삭제할 브랜치 이름:",
              validate: (input) =>
                input.trim() ? true : "브랜치 이름은 필수입니다",
            },
          ]);
          const { force } = await inquirer.prompt([
            {
              type: "confirm",
              name: "force",
              message: "강제 삭제하시겠습니까?",
              default: false,
            },
          ]);
          actions.push({
            type: "branch-delete",
            params: { name: branchName, force },
          });
        } else {
          actions.push({ type: "branch-delete", params: {} });
        }
        break;

      case "stash-save":
        const { stashMessage } = await inquirer.prompt([
          {
            type: "input",
            name: "stashMessage",
            message: "스태시 메시지 (선택사항, 엔터로 건너뛰기):",
          },
        ]);
        actions.push({
          type: "stash-save",
          params: stashMessage ? { message: stashMessage } : {},
        });
        break;

      case "stash-drop":
        // 실행 시 선택하도록
        actions.push({ type: "stash-drop", params: {} });
        break;

      case "rebase-branch":
        const { targetBranch } = await inquirer.prompt([
          {
            type: "input",
            name: "targetBranch",
            message: "리베이스할 브랜치 이름:",
            default: "main",
          },
        ]);
        actions.push({
          type: "rebase-branch",
          params: { branch: targetBranch },
        });
        break;

      case "revert":
        const { presetCommit } = await inquirer.prompt([
          {
            type: "confirm",
            name: "presetCommit",
            message: "커밋 해시를 미리 설정하시겠습니까?",
            default: false,
          },
        ]);

        if (presetCommit) {
          const { commitHash } = await inquirer.prompt([
            {
              type: "input",
              name: "commitHash",
              message: "되돌릴 커밋 해시:",
              validate: (input) =>
                input.trim() ? true : "커밋 해시는 필수입니다",
            },
          ]);
          actions.push({ type: "revert", params: { commitHash } });
        } else {
          actions.push({ type: "revert", params: {} });
        }
        break;

      case "reset-soft":
        actions.push({ type: "reset", params: { type: "soft" } });
        break;

      case "reset-mixed":
        actions.push({ type: "reset", params: { type: "mixed" } });
        break;

      case "reset-hard":
        actions.push({ type: "reset", params: { type: "hard" } });
        break;

      case "merge":
        const { presetMerge } = await inquirer.prompt([
          {
            type: "confirm",
            name: "presetMerge",
            message: "병합할 브랜치를 미리 설정하시겠습니까?",
            default: false,
          },
        ]);

        if (presetMerge) {
          const { branchName } = await inquirer.prompt([
            {
              type: "input",
              name: "branchName",
              message: "병합할 브랜치 이름:",
              validate: (input) =>
                input.trim() ? true : "브랜치 이름은 필수입니다",
            },
          ]);
          const { noFf } = await inquirer.prompt([
            {
              type: "confirm",
              name: "noFf",
              message: "No Fast-Forward 병합을 사용하시겠습니까?",
              default: false,
            },
          ]);
          actions.push({ type: "merge", params: { branch: branchName, noFf } });
        } else {
          actions.push({ type: "merge", params: {} });
        }
        break;

      case "tag":
        const { presetTag } = await inquirer.prompt([
          {
            type: "confirm",
            name: "presetTag",
            message: "태그 이름을 미리 설정하시겠습니까?",
            default: false,
          },
        ]);

        if (presetTag) {
          const { tagName, tagMessage } = await inquirer.prompt([
            {
              type: "input",
              name: "tagName",
              message: "태그 이름:",
              validate: (input) =>
                input.trim() ? true : "태그 이름은 필수입니다",
            },
            {
              type: "input",
              name: "tagMessage",
              message: "태그 메시지 (선택사항):",
            },
          ]);
          actions.push({
            type: "tag",
            params: { name: tagName, message: tagMessage || undefined },
          });
        } else {
          actions.push({ type: "tag", params: {} });
        }
        break;

      // 나머지는 파라미터 없이 바로 추가
      default:
        actions.push({ type: actionType });
        break;
    }

    console.log(chalk.gray(`\n✓ ${actionType} 액션이 추가되었습니다.\n`));

    const { continue: continueAdding } = await inquirer.prompt([
      {
        type: "list",
        name: "continue",
        message: "다음 작업을 선택하세요:",
        choices: [
          { name: "➕ 다른 액션 추가", value: true },
          { name: "✅ 완료 (저장하기)", value: false },
        ],
        default: false,
      },
    ]);

    addMore = continueAdding;
  }

  // 액션이 하나도 추가되지 않은 경우
  if (actions.length === 0) {
    console.log(
      chalk.yellow("\n⚠️  액션이 추가되지 않아 커맨드를 저장하지 않습니다.")
    );
    return;
  }

  const newCommand: CustomCommand = { name, description, actions };
  configService.addCustomCommand(newCommand);

  console.log(
    chalk.green(`\n✅ '${name}'${localeService.t("custom.commandAdded")}`)
  );
  console.log(chalk.cyan(`${localeService.t("custom.commandUsage")} ${name}`));
}

async function removeCustomCommand(
  configService: ConfigService
): Promise<void> {
  const config = configService.getConfig();

  if (config.customCommands.length === 0) {
    console.log(chalk.yellow(localeService.t("custom.noCommandsToDelete")));
    return;
  }

  const { selectedCommand } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedCommand",
      message: localeService.t("custom.selectToDelete"),
      choices: config.customCommands.map((cmd) => ({
        name: `${cmd.name} - ${cmd.description}`,
        value: cmd.name,
      })),
      pageSize: getSafePageSize(10, 5),
    },
  ]);

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `'${selectedCommand}' ${localeService.t(
        "custom.confirmDelete"
      )}`,
      default: false,
    },
  ]);

  if (confirm) {
    configService.removeCustomCommand(selectedCommand);
  } else {
    console.log(chalk.yellow(localeService.t("common.cancelled")));
  }
}

export function showSettings(configService: ConfigService): void {
  const config = configService.getConfig();

  console.log(chalk.cyan.bold(`\n⚙️  Easy Git 설정\n`));
  console.log(chalk.white(`기본 브랜치: ${chalk.bold(config.defaultBranch)}`));
  console.log(
    chalk.white(
      `자동 Stash: ${
        config.autoStash ? chalk.green("활성화") : chalk.gray("비활성화")
      }`
    )
  );
  console.log(
    chalk.white(
      `브랜치 전환시 자동 Pull: ${
        config.autoPullOnBranchSwitch
          ? chalk.green("활성화")
          : chalk.gray("비활성화")
      }`
    )
  );
  console.log(
    chalk.white(
      `커스텀 커맨드 개수: ${chalk.bold(config.customCommands.length)}`
    )
  );
  console.log();
}

export async function handleSettings(
  configService: ConfigService
): Promise<void> {
  while (true) {
    showSettings(configService);

    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "설정 작업을 선택하세요:",
        choices: [
          { name: "🔧 기본 브랜치 변경", value: "default-branch" },
          { name: "📦 자동 Stash 토글", value: "auto-stash" },
          { name: "⬇️  자동 Pull 토글", value: "auto-pull" },
          { name: "🔄 설정 초기화", value: "reset" },
          { name: localeService.t("common.back"), value: "back" },
        ],
        pageSize: getSafePageSize(10, 5),
      },
    ]);

    if (action === "back") {
      return;
    }

    switch (action) {
      case "default-branch":
        const { branchName } = await inquirer.prompt([
          {
            type: "input",
            name: "branchName",
            message: "기본 브랜치 이름을 입력하세요:",
            default: "main",
          },
        ]);
        configService.updateConfig({ defaultBranch: branchName });
        console.log(
          chalk.green(`✅ 기본 브랜치가 '${branchName}'으로 변경되었습니다.`)
        );
        break;

      case "auto-stash":
        const config1 = configService.getConfig();
        configService.updateConfig({ autoStash: !config1.autoStash });
        console.log(
          chalk.green(
            `✅ 자동 Stash가 ${
              !config1.autoStash ? "활성화" : "비활성화"
            }되었습니다.`
          )
        );
        break;

      case "auto-pull":
        const config2 = configService.getConfig();
        configService.updateConfig({
          autoPullOnBranchSwitch: !config2.autoPullOnBranchSwitch,
        });
        console.log(
          chalk.green(
            `✅ 자동 Pull이 ${
              !config2.autoPullOnBranchSwitch ? "활성화" : "비활성화"
            }되었습니다.`
          )
        );
        break;

      case "reset":
        const { confirm } = await inquirer.prompt([
          {
            type: "confirm",
            name: "confirm",
            message:
              "설정을 초기화하시겠습니까? (모든 커스텀 커맨드가 삭제됩니다)",
            default: false,
          },
        ]);

        if (confirm) {
          configService.resetToDefault();
        } else {
          console.log(chalk.yellow(localeService.t("common.cancelled")));
        }
        break;
    }
  }
}

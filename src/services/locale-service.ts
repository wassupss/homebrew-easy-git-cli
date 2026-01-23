import fs from "fs";
import path from "path";
import os from "os";

export type Language = "ko" | "en";

interface LocaleConfig {
  language: Language;
}

export class LocaleService {
  private configPath: string;
  private config: LocaleConfig;

  constructor() {
    const homeDir = os.homedir();
    const configDir = path.join(homeDir, ".easy-git");
    this.configPath = path.join(configDir, "locale.json");

    // 설정 디렉토리 생성
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    this.config = this.loadConfig();
  }

  private loadConfig(): LocaleConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, "utf-8");
        return JSON.parse(data);
      }
    } catch (error) {
      // 파일 읽기 실패 시 기본값 사용
    }

    // 기본값: 영어
    return { language: "en" };
  }

  private saveConfig(): void {
    try {
      fs.writeFileSync(
        this.configPath,
        JSON.stringify(this.config, null, 2),
        "utf-8"
      );
    } catch (error) {
      console.error("Failed to save locale config:", error);
    }
  }

  getLanguage(): Language {
    return this.config.language;
  }

  setLanguage(language: Language): void {
    this.config.language = language;
    this.saveConfig();
  }

  t(key: string): string {
    return translations[this.config.language][key] || key;
  }
}

// 번역 데이터
const translations: Record<Language, Record<string, string>> = {
  ko: {
    // 메인 메뉴
    "menu.welcome": "Git을 더 쉽게 사용하세요!",
    "menu.currentBranch": "현재 브랜치",
    "menu.whatToDo": "무엇을 하시겠습니까?",
    "menu.status": "📊 상태 확인 (Status)",
    "menu.staging": "📝 스테이징 (Staging)",
    "menu.commit": "💾 커밋 (Commit)",
    "menu.push": "⬆️  푸시 (Push)",
    "menu.pull": "⬇️  풀 (Pull)",
    "menu.branch": "🌿 브랜치 관리",
    "menu.rebase": "🔄 Rebase",
    "menu.rollback": "⏮️  Rollback (되돌리기)",
    "menu.stash": "📦 Stash 관리",
    "menu.remote": "🌐 Remote 관리",
    "menu.pr": "🔀 Pull Request",
    "menu.custom": "⚡ 커스텀 커맨드",
    "menu.language": "🌐 언어 설정",
    "menu.exit": "🚪 종료",
    "menu.goodbye": "안녕히 가세요!",
    "menu.initRepo": "새 Git 저장소 초기화",

    // 공통
    "common.back": "🔙 돌아가기",
    "common.cancel": "취소",
    "common.confirm": "확인",
    "common.yes": "예",
    "common.no": "아니오",
    "common.continue": "계속하시겠습니까?",
    "common.backToMenu": "메인 메뉴로 돌아가시겠습니까?",
    "common.cancelled": "취소되었습니다.",
    "common.success": "성공",
    "common.failed": "실패",

    // Git 상태
    "git.notRepository": "Git 저장소가 아닙니다.",
    "git.initialized": "Git 저장소가 초기화되었습니다.",

    // 언어 설정
    "language.select": "언어를 선택하세요:",
    "language.korean": "한국어",
    "language.english": "English",
    "language.changed": "언어가 변경되었습니다.",

    // 에러 메시지
    "error.notGitRepo": "Git 저장소가 아닙니다.",
    "error.generic": "오류",
    "error.retry": "다시 시도하시겠습니까?",
    "error.runInGitRepo": "Git 저장소 디렉토리에서 실행해주세요.",
    "error.unknownCommand": "알 수 없는 명령어",

    // Init
    "init.success": "Git 저장소가 초기화되었습니다.",

    // CLI
    "cli.availableCommands": "사용 가능한 명령어:",
    "cli.interactiveMode": "인터랙티브 메뉴",
    "cli.cloneRepo": "저장소 클론",
    "cli.customCommands": "커스텀 명령어",

    // Commit 메뉴
    "commit.selectAction": "커밋 작업을 선택하세요:",
    "commit.createNew": "💾 새 커밋 생성",
    "commit.viewLog": "📜 커밋 로그 보기",
    "commit.viewGraph": "🌳 커밋 그래프 보기",
    "commit.revert": "⏪ 커밋 되돌리기 (Revert)",
    "commit.reset": "↩️  커밋 취소 (Reset)",
    "commit.graphTitle": "🌳 커밋 그래프",
    "commit.selectGraphCount": "몇 개의 커밋을 보시겠습니까?",
    "commit.graph10": "최근 10개",
    "commit.graph20": "최근 20개",
    "commit.graph30": "최근 30개",
    "commit.graph50": "최근 50개",
    "commit.noCommits": "커밋 기록이 없습니다.",

    // PR 메뉴
    "pr.selectAction": "Pull Request 작업을 선택하세요:",
    "pr.createNew": "🆕 새 PR 생성",
    "pr.viewList": "📋 PR 목록 보기",
    "pr.openHome": "🏠 PR 홈페이지 열기",

    // Rebase 메뉴
    "rebase.selectAction": "Rebase 작업을 선택하세요:",
    "rebase.branch": "🔄 브랜치 Rebase",
    "rebase.continue": "▶️  Rebase 계속 진행",
    "rebase.skip": "⏭️  현재 커밋 건너뛰기",
    "rebase.abort": "❌ Rebase 취소",

    // Rollback 메뉴
    "rollback.selectAction": "Rollback 작업을 선택하세요:",
    "rollback.revert": "🔄 Revert (커밋 되돌리기 - 새 커밋 생성)",
    "rollback.resetSoft": "↩️  Reset --soft (변경사항 Staged로 유지)",
    "rollback.resetMixed": "↩️  Reset --mixed (변경사항 Unstaged로 유지)",
    "rollback.resetHard": "⚠️  Reset --hard (변경사항 모두 삭제)",
    "rollback.undoLastCommit": "⏪ 마지막 커밋 취소",
    "rollback.error": "Rollback 작업 실패",
    "rollback.recentCommits": "최근 커밋 목록",
    "rollback.noCommits": "커밋 히스토리가 없습니다.",
    "rollback.selectCommitToRevert": "되돌릴 커밋을 선택하세요:",
    "rollback.confirmRevert": "선택한 커밋을 되돌리시겠습니까?",
    "rollback.revertSuccess": "커밋 되돌리기 완료",
    "rollback.selectCommitToReset": "리셋할 커밋을 선택하세요:",
    "rollback.confirmReset":
      "정말로 리셋하시겠습니까? 이 작업은 되돌릴 수 없습니다!",
    "rollback.resetSuccess": "리셋 완료",
    "rollback.resetWarning.soft":
      "Soft Reset: 변경사항은 Staged 상태로 유지됩니다. (다시 커밋 가능)",
    "rollback.resetWarning.mixed":
      "Mixed Reset: 변경사항은 Unstaged 상태로 유지됩니다. (다시 add 필요)",
    "rollback.resetWarning.hard":
      "Hard Reset: ⚠️  모든 변경사항이 삭제됩니다! 이 작업은 되돌릴 수 없습니다!",
    "rollback.lastCommit": "마지막 커밋",
    "rollback.selectUndoMode": "어떤 방식으로 취소하시겠습니까?",
    "rollback.undoMode.soft": "Soft - 변경사항 Staged로 유지",
    "rollback.undoMode.mixed": "Mixed - 변경사항 Unstaged로 유지",
    "rollback.undoMode.hard": "Hard - 변경사항 모두 삭제 ⚠️",
    "rollback.confirmUndo": "정말로 마지막 커밋을 취소하시겠습니까?",
    "rollback.undoSuccess": "마지막 커밋이 취소되었습니다",

    // Status
    "status.title": "📊 Git 상태",
    "status.staged": "✅ Staged (커밋 준비됨):",
    "status.modified": "📝 Modified (수정됨):",
    "status.untracked": "❓ Untracked (추적되지 않음):",
    "status.deleted": "🗑️  Deleted (삭제됨):",
    "status.conflicted": "⚠️  Conflicted (충돌):",
    "status.currentBranch": "📍 현재 브랜치:",
    "status.clean": "✨ 작업 디렉토리가 깨끗합니다.",
    "status.pressEnter": "엔터를 눌러 계속...",

    // Add
    "add.noFiles": "추가할 파일이 없습니다.",
    "add.howToAdd": "어떻게 추가하시겠습니까?",
    "add.allFiles": "모든 파일 추가",
    "add.selectFiles": "특정 파일 선택",
    "add.selectFilesPrompt": "추가할 파일을 선택하세요 (스페이스바로 선택):",
    "add.minOneFile": "최소 1개 이상의 파일을 선택해야 합니다.",
    "add.allAdded": "모든 파일이 추가되었습니다.",
    "add.filesAdded": "개 파일이 추가되었습니다.",

    // Staging
    "staging.title": "📝 스테이징 관리",
    "staging.selectAction": "스테이징 작업을 선택하세요:",
    "staging.stage": "➕ 파일 스테이징",
    "staging.unstage": "➖ 스테이징 취소",
    "staging.noFiles": "스테이징할 파일이 없습니다.",
    "staging.noStagedFiles": "스테이징된 파일이 없습니다.",
    "staging.howToStage": "어떻게 스테이징하시겠습니까?",
    "staging.allFiles": "모든 파일 스테이징",
    "staging.selectFiles": "특정 파일 선택",
    "staging.selectFilesPrompt":
      "스테이징할 파일을 선택하세요 (스페이스바로 선택):",
    "staging.minOneFile": "최소 1개 이상의 파일을 선택해야 합니다.",
    "staging.allStaged": "모든 파일이 스테이징되었습니다.",
    "staging.filesStaged": "개 파일이 스테이징되었습니다.",
    "staging.selectToUnstage":
      "언스테이징할 파일을 선택하세요 (스페이스바로 선택):",
    "staging.allUnstaged": "모든 파일이 언스테이징되었습니다.",
    "staging.filesUnstaged": "개 파일이 언스테이징되었습니다.",
    "staging.unstageAll": "모든 파일 언스테이징",

    // Branch
    "branch.selectAction": "브랜치 작업을 선택하세요:",
    "branch.list": "📋 브랜치 목록 보기",
    "branch.create": "➕ 새 브랜치 생성",
    "branch.switch": "🔀 브랜치 전환",
    "branch.merge": "🔀 브랜치 병합",
    "branch.delete": "🗑️  브랜치 삭제",
    "branch.listTitle": "📋 브랜치 목록:",
    "branch.current": "(현재 브랜치)",
    "branch.currentBranch": "현재 브랜치",
    "branch.enterName": "새 브랜치 이름을 입력하세요:",
    "branch.nameRequired": "브랜치 이름은 비워둘 수 없습니다.",
    "branch.nameInvalid":
      "브랜치 이름은 영문, 숫자, -, _만 사용할 수 있습니다.",
    "branch.created": "가 생성되고 전환되었습니다!",
    "branch.noOtherBranches": "전환할 수 있는 다른 브랜치가 없습니다.",
    "branch.selectToSwitch": "전환할 브랜치를 선택하세요:",
    "branch.switched": "로 전환되었습니다!",
    "branch.selectToMerge": "병합할 브랜치를 선택하세요:",
    "branch.mergeInfo":
      "'{source}' 브랜치를 현재 브랜치 '{target}'에 병합합니다.",
    "branch.selectMergeStrategy": "병합 전략을 선택하세요:",
    "branch.fastForward": "Fast-Forward (가능한 경우)",
    "branch.noFastForward": "No Fast-Forward (항상 병합 커밋 생성)",
    "branch.confirmMerge": "병합을 진행하시겠습니까?",
    "branch.mergeSuccess": "'{branch}' 브랜치가 '{current}'에 병합되었습니다!",
    "branch.mergeFailed": "병합 실패",
    "branch.mergeConflict": "충돌이 발생했습니다!",
    "branch.conflictHelp":
      "1. 충돌 파일을 수동으로 해결하세요\n   2. 해결된 파일을 스테이징하세요\n   3. 커밋하여 병합을 완료하세요",
    "branch.abortMerge": "병합을 취소하시겠습니까?",
    "branch.mergeAborted": "병합이 취소되었습니다.",
    "branch.noDeleteable":
      "삭제할 수 있는 브랜치가 없습니다. (현재 브랜치는 삭제할 수 없습니다)",
    "branch.selectToDelete": "삭제할 브랜치를 선택하세요:",
    "branch.confirmDelete": "를 삭제하시겠습니까?",
    "branch.deleteForce":
      "강제 삭제하시겠습니까? (병합되지 않은 변경사항 포함)",
    "branch.deleted": "가 삭제되었습니다.",

    // Log
    "log.title": "📜 커밋 로그",
    "log.selectCount": "몇 개의 커밋을 보시겠습니까?",
    "log.latest": "최근",
    "log.commits": "개",
    "log.author": "작성자:",
    "log.date": "날짜:",
    "log.pressEnter": "엔터를 눌러 계속...",

    // Push/Pull
    "push.confirm": "를 푸시하시겠습니까?",
    "push.cancelled": "푸시가 취소되었습니다.",
    "pull.confirm": "를 풀하시겠습니까?",
    "pull.cancelled": "풀이 취소되었습니다.",

    // Stash
    "stash.selectAction": "Stash 작업을 선택하세요:",
    "stash.save": "💾 Stash 저장",
    "stash.pop": "📤 Stash 복원 (pop)",
    "stash.list": "📋 Stash 목록",
    "stash.drop": "🗑️  Stash 삭제",
    "stash.clear": "🗑️  모든 Stash 삭제",
    "stash.enterMessage": "Stash 메시지를 입력하세요 (선택사항):",
    "stash.noStash": "저장된 stash가 없습니다.",
    "stash.listTitle": "📋 저장된 Stash 목록:",
    "stash.selectToPop": "복원할 stash를 선택하세요:",
    "stash.selectToDrop": "삭제할 stash를 선택하세요:",
    "stash.confirmClear": "정말로 모든 stash를 삭제하시겠습니까?",

    // Remote
    "remote.selectAction": "Remote 작업을 선택하세요:",
    "remote.list": "📋 Remote 목록",
    "remote.add": "➕ Remote 추가",
    "remote.remove": "🗑️  Remote 제거",
    "remote.noRemotes": "등록된 원격 저장소가 없습니다.",
    "remote.listTitle": "📋 원격 저장소 목록:",
    "remote.enterName": "Remote 이름을 입력하세요:",
    "remote.enterUrl": "Remote URL을 입력하세요:",
    "remote.selectToRemove": "제거할 remote를 선택하세요:",
    "remote.confirmRemove": "를 제거하시겠습니까?",

    // Custom
    "custom.selectAction": "커스텀 커맨드 관리:",
    "custom.execute": "▶️  커스텀 커맨드 실행",
    "custom.list": "📋 커스텀 커맨드 목록",
    "custom.add": "➕ 새 커맨드 추가",
    "custom.remove": "🗑️  커맨드 삭제",
    "custom.settings": "⚙️  설정 보기",
    "custom.reset": "🔄 기본값으로 초기화",
    "custom.noCommands": "등록된 커스텀 커맨드가 없습니다.",
    "custom.selectToExecute": "실행할 커맨드를 선택하세요:",
    "custom.commandNotFound": "커스텀 커맨드를 찾을 수 없습니다.",
    "custom.executing": "커스텀 커맨드 실행:",
    "custom.completed": "커맨드 완료!",
    "custom.executionError": "커맨드 실행 중 오류:",
    "custom.noCommandsToDelete": "삭제할 커맨드가 없습니다.",
    "custom.selectToDelete": "삭제할 커맨드를 선택하세요:",
    "custom.confirmDelete": "커맨드를 삭제하시겠습니까?",
    "custom.listTitle": "등록된 커스텀 커맨드:",
    "custom.description": "설명:",
    "custom.actions": "액션:",
    "custom.addTitle": "새 커스텀 커맨드 추가",
    "custom.addUsage": "'eg <커맨드이름>' 형태로 사용됩니다.",
    "custom.enterName": "커맨드 이름:",
    "custom.nameRequired": "이름은 비워둘 수 없습니다.",
    "custom.nameInvalid": "소문자, 숫자, - 만 사용 가능합니다.",
    "custom.enterDescription": "설명:",
    "custom.descriptionRequired": "설명은 비워둘 수 없습니다.",
    "custom.selectActionType": "어떤 작업을 추가하시겠습니까?",
    "custom.actionStatus": "상태 확인 (status)",
    "custom.actionAdd": "파일 추가 (add)",
    "custom.actionCommit": "커밋 (commit)",
    "custom.actionPush": "푸시 (push)",
    "custom.actionPull": "풀 (pull)",
    "custom.actionBranch": "브랜치 전환 (branch)",
    "custom.actionRebase": "Rebase",
    "custom.actionRevert": "커밋 되돌리기 (revert)",
    "custom.actionReset": "커밋 취소 (reset)",
    "custom.actionStashSave": "Stash 저장 (stash save)",
    "custom.actionStashPop": "Stash 복원 (stash pop)",
    "custom.addAllFiles": "모든 파일을 추가하시겠습니까?",
    "custom.enterTargetBranch": "Rebase할 대상 브랜치를 입력하세요 (예: main):",
    "custom.enterCommitHash": "되돌릴 커밋 해시를 입력하세요 (예: abc1234):",
    "custom.commitHashRequired": "커밋 해시를 입력해주세요.",
    "custom.selectResetType": "Reset 타입을 선택하세요:",
    "custom.resetSoft": "Soft (변경사항 Staged로 유지)",
    "custom.resetMixed": "Mixed (변경사항 Unstaged로 유지)",
    "custom.resetHard": "Hard (변경사항 모두 삭제)",
    "custom.addMoreActions": "액션을 더 추가하시겠습니까?",
    "custom.commandAdded": "커맨드가 추가되었습니다!",
    "custom.commandUsage": "사용법: eg",
    "custom.settingsTitle": "Easy Git 설정:",
    "custom.defaultBranch": "기본 브랜치:",
    "custom.autoStash": "자동 Stash:",
    "custom.autoPull": "브랜치 전환시 자동 Pull:",
    "custom.commandCount": "커스텀 커맨드 개수:",
    "custom.confirmReset":
      "설정을 기본값으로 초기화하시겠습니까? (모든 커스텀 커맨드가 삭제됩니다)",
    "custom.allFilesAdded": "모든 파일이 추가되었습니다.",
    "custom.stashSaved": "Stash 저장됨",
    "custom.stashPopped": "Stash 복원됨",
    "custom.rebaseComplete": "Rebase 완료",
    "custom.revertComplete": "커밋 되돌리기 완료",
    "custom.resetComplete": "커밋 취소 완료",
    "custom.unknownAction": "알 수 없는 액션:",
    "custom.noOtherBranches": "전환할 수 있는 다른 브랜치가 없습니다.",
    "custom.selectBranch": "전환할 브랜치를 선택하세요:",

    // Stash 상세
    "stash.addMessagePrompt": "Stash에 메시지를 추가하시겠습니까?",
    "stash.messagePrompt": "Stash 메시지를 입력하세요:",
    "stash.messageRequired": "메시지는 비워둘 수 없습니다.",
    "stash.saved": "변경사항이 Stash에 저장되었습니다!",
    "stash.listEmpty": "저장된 Stash가 없습니다.",
    "stash.popNone": "복원할 Stash가 없습니다.",
    "stash.confirmPop": "최근 Stash를 복원하시겠습니까?",
    "stash.popped": "Stash가 복원되었습니다!",
    "stash.dropNone": "삭제할 Stash가 없습니다.",
    "stash.enterIndex": "삭제할 Stash의 번호를 입력하세요:",
    "stash.indexInvalid": "사이의 숫자를 입력하세요.",
    "stash.confirmDrop": "정말로 stash를 삭제하시겠습니까?",
    "stash.dropCancelled": "삭제가 취소되었습니다.",
    "stash.dropped": "가 삭제되었습니다!",
    "stash.clearNone": "삭제할 Stash가 없습니다.",
    "stash.confirmClearAll": "정말로 모든 Stash를 삭제하시겠습니까?",
    "stash.cleared": "모든 Stash가 삭제되었습니다!",

    // Remote 상세
    "remote.listEmpty": "원격 저장소가 없습니다.",
    "remote.fetch": "Fetch:",
    "remote.push": "Push:",
    "remote.enterNamePrompt": "원격 저장소 이름을 입력하세요:",
    "remote.nameRequired": "이름은 비워둘 수 없습니다.",
    "remote.enterUrlPrompt": "원격 저장소 URL을 입력하세요:",
    "remote.urlRequired": "URL은 비워둘 수 없습니다.",
    "remote.urlWarning": "일반적인 Git URL 형식이 아닙니다. 계속 진행합니다.",
    "remote.added": "원격 저장소가 추가되었습니다!",
    "remote.addFailed": "추가 실패:",
    "remote.removeNone": "제거할 원격 저장소가 없습니다.",
    "remote.confirmRemovePrompt": "을 제거하시겠습니까?",
    "remote.removed": "원격 저장소가 제거되었습니다!",
    "remote.removeFailed": "제거 실패:",
    "remote.fetchSuccess": "원격 브랜치 정보를 가져왔습니다!",
    "remote.fetchFailed": "Fetch 실패:",
    "remote.fetchAction": "🔄 Fetch (원격 정보 가져오기)",

    // Clone
    "clone.title": "Git 저장소 클론",
    "clone.enterUrl": "클론할 저장소 URL을 입력하세요:",
    "clone.urlRequired": "URL은 비워둘 수 없습니다.",
    "clone.useDefaultPath": "폴더로 클론하시겠습니까?",
    "clone.enterPath": "클론할 경로를 입력하세요 (폴더명 또는 전체 경로):",
    "clone.pathRequired": "경로는 비워둘 수 없습니다.",
    "clone.success": "저장소가 성공적으로 클론되었습니다!",
    "clone.location": "위치:",
    "clone.moveCommand": "다음 명령어로 이동하세요:",
    "clone.failed": "클론 실패:",
    "clone.alreadyExists":
      "해당 폴더가 이미 존재합니다. 다른 이름을 사용해주세요.",
  },
  en: {
    // 메인 메뉴
    "menu.welcome": "Make Git easier to use!",
    "menu.currentBranch": "Current Branch",
    "menu.whatToDo": "What would you like to do?",
    "menu.status": "📊 Status",
    "menu.staging": "📝 Staging",
    "menu.commit": "💾 Commit",
    "menu.push": "⬆️  Push",
    "menu.pull": "⬇️  Pull",
    "menu.branch": "🌿 Branch Management",
    "menu.rebase": "🔄 Rebase",
    "menu.rollback": "⏮️  Rollback",
    "menu.stash": "📦 Stash Management",
    "menu.remote": "🌐 Remote Management",
    "menu.pr": "🔀 Pull Request",
    "menu.custom": "⚡ Custom Commands",
    "menu.language": "🌐 Language Settings",
    "menu.exit": "🚪 Exit",
    "menu.goodbye": "Goodbye!",
    "menu.initRepo": "Initialize New Git Repository",

    // 공통
    "common.back": "🔙 Back",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.yes": "Yes",
    "common.no": "No",
    "common.continue": "Continue?",
    "common.backToMenu": "Return to main menu?",
    "common.cancelled": "Cancelled.",
    "common.success": "Success",
    "common.failed": "Failed",

    // Git 상태
    "git.notRepository": "Not a Git repository.",
    "git.initialized": "Git repository initialized.",

    // 언어 설정
    "language.select": "Select Language:",
    "language.korean": "한국어",
    "language.english": "English",
    "language.changed": "Language changed.",

    // 에러 메시지
    "error.notGitRepo": "Not a Git repository.",
    "error.generic": "Error",
    "error.retry": "Would you like to retry?",
    "error.runInGitRepo": "Please run in a Git repository directory.",
    "error.unknownCommand": "Unknown command",

    // Init
    "init.success": "Git repository initialized.",

    // CLI
    "cli.availableCommands": "Available commands:",
    "cli.interactiveMode": "Interactive menu",
    "cli.cloneRepo": "Clone repository",
    "cli.customCommands": "Custom commands",

    // Commit 메뉴
    "commit.selectAction": "Select commit action:",
    "commit.createNew": "💾 Create New Commit",
    "commit.viewLog": "📜 View Commit Log",
    "commit.viewGraph": "🌳 View Commit Graph",
    "commit.revert": "⏪ Revert Commit",
    "commit.reset": "↩️  Reset Commit",
    "commit.graphTitle": "🌳 Commit Graph",
    "commit.selectGraphCount": "How many commits would you like to view?",
    "commit.graph10": "Latest 10",
    "commit.graph20": "Latest 20",
    "commit.graph30": "Latest 30",
    "commit.graph50": "Latest 50",
    "commit.noCommits": "No commit history found.",

    // PR 메뉴
    "pr.selectAction": "Select Pull Request action:",
    "pr.createNew": "🆕 Create New PR",
    "pr.viewList": "📋 View PR List",
    "pr.openHome": "🏠 Open Repository Home",

    // Rebase 메뉴
    "rebase.selectAction": "Select rebase action:",
    "rebase.branch": "🔄 Rebase Branch",
    "rebase.continue": "▶️  Continue Rebase",
    "rebase.skip": "⏭️  Skip Current Commit",
    "rebase.abort": "❌ Abort Rebase",

    // Rollback 메뉴
    "rollback.selectAction": "Select rollback action:",
    "rollback.revert": "🔄 Revert (Create new commit to undo changes)",
    "rollback.resetSoft": "↩️  Reset --soft (Keep changes staged)",
    "rollback.resetMixed": "↩️  Reset --mixed (Keep changes unstaged)",
    "rollback.resetHard": "⚠️  Reset --hard (Delete all changes)",
    "rollback.undoLastCommit": "⏪ Undo Last Commit",
    "rollback.error": "Rollback operation failed",
    "rollback.recentCommits": "Recent Commits",
    "rollback.noCommits": "No commit history found.",
    "rollback.selectCommitToRevert": "Select commit to revert:",
    "rollback.confirmRevert":
      "Are you sure you want to revert the selected commit?",
    "rollback.revertSuccess": "Commit reverted successfully",
    "rollback.selectCommitToReset": "Select commit to reset to:",
    "rollback.confirmReset":
      "Are you sure you want to reset? This action cannot be undone!",
    "rollback.resetSuccess": "Reset completed",
    "rollback.resetWarning.soft":
      "Soft Reset: Changes will be kept in staged state. (Can be committed again)",
    "rollback.resetWarning.mixed":
      "Mixed Reset: Changes will be kept in unstaged state. (Need to add again)",
    "rollback.resetWarning.hard":
      "Hard Reset: ⚠️  All changes will be deleted! This action cannot be undone!",
    "rollback.lastCommit": "Last Commit",
    "rollback.selectUndoMode": "How would you like to undo?",
    "rollback.undoMode.soft": "Soft - Keep changes staged",
    "rollback.undoMode.mixed": "Mixed - Keep changes unstaged",
    "rollback.undoMode.hard": "Hard - Delete all changes ⚠️",
    "rollback.confirmUndo": "Are you sure you want to undo the last commit?",
    "rollback.undoSuccess": "Last commit has been undone",

    // Status
    "status.title": "📊 Git Status",
    "status.staged": "✅ Staged:",
    "status.modified": "📝 Modified:",
    "status.untracked": "❓ Untracked:",
    "status.deleted": "🗑️  Deleted:",
    "status.conflicted": "⚠️  Conflicted:",
    "status.currentBranch": "📍 Current Branch:",
    "status.clean": "✨ Working directory is clean.",
    "status.pressEnter": "Press Enter to continue...",

    // Add
    "add.noFiles": "No files to add.",
    "add.howToAdd": "How would you like to add files?",
    "add.allFiles": "Add all files",
    "add.selectFiles": "Select specific files",
    "add.selectFilesPrompt": "Select files to add (use spacebar):",
    "add.minOneFile": "You must select at least one file.",
    "add.allAdded": "All files added.",
    "add.filesAdded": " files added.",

    // Staging
    "staging.title": "📝 Staging Management",
    "staging.selectAction": "Select staging action:",
    "staging.stage": "➕ Stage Files",
    "staging.unstage": "➖ Unstage Files",
    "staging.noFiles": "No files to stage.",
    "staging.noStagedFiles": "No staged files.",
    "staging.howToStage": "How would you like to stage files?",
    "staging.allFiles": "Stage all files",
    "staging.selectFiles": "Select specific files",
    "staging.selectFilesPrompt": "Select files to stage (use spacebar):",
    "staging.minOneFile": "You must select at least one file.",
    "staging.allStaged": "All files staged.",
    "staging.filesStaged": " files staged.",
    "staging.selectToUnstage": "Select files to unstage (use spacebar):",
    "staging.allUnstaged": "All files unstaged.",
    "staging.filesUnstaged": " files unstaged.",
    "staging.unstageAll": "Unstage all files",

    // Branch
    "branch.selectAction": "Select branch action:",
    "branch.list": "📋 List Branches",
    "branch.create": "➕ Create New Branch",
    "branch.switch": "🔀 Switch Branch",
    "branch.merge": "🔀 Merge Branch",
    "branch.delete": "🗑️  Delete Branch",
    "branch.listTitle": "📋 Branch List:",
    "branch.current": "(current branch)",
    "branch.currentBranch": "Current Branch",
    "branch.enterName": "Enter new branch name:",
    "branch.nameRequired": "Branch name cannot be empty.",
    "branch.nameInvalid":
      "Branch name can only contain letters, numbers, -, and _.",
    "branch.created": " created and switched!",
    "branch.noOtherBranches": "No other branches to switch to.",
    "branch.selectToSwitch": "Select branch to switch to:",
    "branch.switched": " switched!",
    "branch.selectToMerge": "Select branch to merge:",
    "branch.mergeInfo": "Merging '{source}' into current branch '{target}'.",
    "branch.selectMergeStrategy": "Select merge strategy:",
    "branch.fastForward": "Fast-Forward (if possible)",
    "branch.noFastForward": "No Fast-Forward (always create merge commit)",
    "branch.confirmMerge": "Proceed with merge?",
    "branch.mergeSuccess": "'{branch}' merged into '{current}'!",
    "branch.mergeFailed": "Merge failed",
    "branch.mergeConflict": "Conflicts detected!",
    "branch.conflictHelp":
      "1. Resolve conflicts manually\n   2. Stage resolved files\n   3. Commit to complete the merge",
    "branch.abortMerge": "Abort merge?",
    "branch.mergeAborted": "Merge aborted.",
    "branch.noDeleteable":
      "No branches to delete. (Current branch cannot be deleted)",
    "branch.selectToDelete": "Select branch to delete:",
    "branch.confirmDelete": " delete?",
    "branch.deleteForce": "Force delete? (includes unmerged changes)",
    "branch.deleted": " deleted.",

    // Log
    "log.title": "📜 Commit Log",
    "log.selectCount": "How many commits would you like to view?",
    "log.latest": "Latest",
    "log.commits": "",
    "log.author": "Author:",
    "log.date": "Date:",
    "log.pressEnter": "Press Enter to continue...",

    // Push/Pull
    "push.confirm": " push?",
    "push.cancelled": "Push cancelled.",
    "pull.confirm": " pull?",
    "pull.cancelled": "Pull cancelled.",

    // Stash
    "stash.selectAction": "Select stash action:",
    "stash.save": "💾 Save Stash",
    "stash.pop": "📤 Pop Stash",
    "stash.list": "📋 List Stashes",
    "stash.drop": "🗑️  Drop Stash",
    "stash.clear": "🗑️  Clear All Stashes",
    "stash.enterMessage": "Enter stash message (optional):",
    "stash.noStash": "No stashes found.",
    "stash.listTitle": "📋 Saved Stashes:",
    "stash.selectToPop": "Select stash to pop:",
    "stash.selectToDrop": "Select stash to drop:",
    "stash.confirmClear": "Are you sure you want to clear all stashes?",

    // Remote
    "remote.selectAction": "Select remote action:",
    "remote.list": "📋 List Remotes",
    "remote.add": "➕ Add Remote",
    "remote.remove": "🗑️  Remove Remote",
    "remote.noRemotes": "No remotes registered.",
    "remote.listTitle": "📋 Remote List:",
    "remote.enterName": "Enter remote name:",
    "remote.enterUrl": "Enter remote URL:",
    "remote.selectToRemove": "Select remote to remove:",
    "remote.confirmRemove": " remove?",

    // Custom
    "custom.selectAction": "Custom command management:",
    "custom.execute": "▶️  Execute Custom Command",
    "custom.list": "📋 List Custom Commands",
    "custom.add": "➕ Add New Command",
    "custom.remove": "🗑️  Remove Command",
    "custom.settings": "⚙️  View Settings",
    "custom.reset": "🔄 Reset to Default",
    "custom.noCommands": "No custom commands registered.",
    "custom.selectToExecute": "Select command to execute:",
    "custom.commandNotFound": "Custom command not found.",
    "custom.executing": "Executing custom command:",
    "custom.completed": " command completed!",
    "custom.executionError": "Error during command execution:",
    "custom.noCommandsToDelete": "No commands to delete.",
    "custom.selectToDelete": "Select command to delete:",
    "custom.confirmDelete": " delete command?",
    "custom.listTitle": "Registered Custom Commands:",
    "custom.description": "Description:",
    "custom.actions": "Actions:",
    "custom.addTitle": "Add New Custom Command",
    "custom.addUsage": "Usage: 'eg <command-name>'",
    "custom.enterName": "Command name:",
    "custom.nameRequired": "Name cannot be empty.",
    "custom.nameInvalid": "Only lowercase letters, numbers, and - are allowed.",
    "custom.enterDescription": "Description:",
    "custom.descriptionRequired": "Description cannot be empty.",
    "custom.selectActionType": "What action would you like to add?",
    "custom.actionStatus": "Check status",
    "custom.actionAdd": "Add files",
    "custom.actionCommit": "Commit",
    "custom.actionPush": "Push",
    "custom.actionPull": "Pull",
    "custom.actionBranch": "Switch branch",
    "custom.actionRebase": "Rebase",
    "custom.actionRevert": "Revert commit",
    "custom.actionReset": "Reset commit",
    "custom.actionStashSave": "Stash save",
    "custom.actionStashPop": "Stash pop",
    "custom.addAllFiles": "Add all files?",
    "custom.enterTargetBranch": "Enter target branch for rebase (e.g., main):",
    "custom.enterCommitHash": "Enter commit hash to revert (e.g., abc1234):",
    "custom.commitHashRequired": "Please enter a commit hash.",
    "custom.selectResetType": "Select reset type:",
    "custom.resetSoft": "Soft (keep changes staged)",
    "custom.resetMixed": "Mixed (keep changes unstaged)",
    "custom.resetHard": "Hard (delete all changes)",
    "custom.addMoreActions": "Add more actions?",
    "custom.commandAdded": " command added!",
    "custom.commandUsage": "Usage: eg",
    "custom.settingsTitle": "Easy Git Settings:",
    "custom.defaultBranch": "Default branch:",
    "custom.autoStash": "Auto stash:",
    "custom.autoPull": "Auto pull on branch switch:",
    "custom.commandCount": "Custom commands:",
    "custom.confirmReset":
      "Reset settings to default? (All custom commands will be deleted)",
    "custom.allFilesAdded": "All files added.",
    "custom.stashSaved": "Stash saved",
    "custom.stashPopped": "Stash popped",
    "custom.rebaseComplete": "Rebase complete",
    "custom.revertComplete": "Revert complete",
    "custom.resetComplete": "Reset complete",
    "custom.unknownAction": "Unknown action:",
    "custom.noOtherBranches": "No other branches to switch to.",
    "custom.selectBranch": "Select branch to switch to:",

    // Stash 상세
    "stash.addMessagePrompt": "Add a message to stash?",
    "stash.messagePrompt": "Enter stash message:",
    "stash.messageRequired": "Message cannot be empty.",
    "stash.saved": "Changes saved to stash!",
    "stash.listEmpty": "No stashes found.",
    "stash.popNone": "No stash to pop.",
    "stash.confirmPop": "Pop the most recent stash?",
    "stash.popped": "Stash popped!",
    "stash.dropNone": "No stash to drop.",
    "stash.enterIndex": "Enter stash index to drop:",
    "stash.indexInvalid": " enter a number between.",
    "stash.confirmDrop": "Really drop stash?",
    "stash.dropCancelled": "Drop cancelled.",
    "stash.dropped": " dropped!",
    "stash.clearNone": "No stash to clear.",
    "stash.confirmClearAll": "Really clear all stashes?",
    "stash.cleared": "All stashes cleared!",

    // Remote 상세
    "remote.listEmpty": "No remotes found.",
    "remote.fetch": "Fetch:",
    "remote.push": "Push:",
    "remote.enterNamePrompt": "Enter remote name:",
    "remote.nameRequired": "Name cannot be empty.",
    "remote.enterUrlPrompt": "Enter remote URL:",
    "remote.urlRequired": "URL cannot be empty.",
    "remote.urlWarning": "Not a typical Git URL format. Continuing anyway.",
    "remote.added": " remote added!",
    "remote.addFailed": "Add failed:",
    "remote.removeNone": "No remotes to remove.",
    "remote.confirmRemovePrompt": " remove?",
    "remote.removed": " remote removed!",
    "remote.removeFailed": "Remove failed:",
    "remote.fetchSuccess": "Fetched remote branch information!",
    "remote.fetchFailed": "Fetch failed:",
    "remote.fetchAction": "🔄 Fetch",

    // Clone
    "clone.title": "Git Repository Clone",
    "clone.enterUrl": "Enter repository URL to clone:",
    "clone.urlRequired": "URL cannot be empty.",
    "clone.useDefaultPath": " clone in current directory?",
    "clone.enterPath": "Enter clone path (folder name or full path):",
    "clone.pathRequired": "Path cannot be empty.",
    "clone.success": "Repository cloned successfully!",
    "clone.location": "Location:",
    "clone.moveCommand": "Navigate with this command:",
    "clone.failed": "Clone failed:",
    "clone.alreadyExists":
      "Folder already exists. Please use a different name.",
  },
};

export const localeService = new LocaleService();

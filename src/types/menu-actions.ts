// 메뉴 액션 타입 정의

export interface MenuAction {
  id: string;
  name: string;
  description: string;
  category: "menu" | "action";
  requiresInput?: boolean;
  inputType?: "text" | "select" | "confirm";
  inputPrompt?: string;
}

export const MENU_ACTIONS: Record<string, MenuAction> = {
  // 직접 실행 액션들
  status: {
    id: "status",
    name: "📊 상태 보기",
    description: "Git 상태 확인",
    category: "action",
  },
  add: {
    id: "add",
    name: "➕ 파일 추가 메뉴",
    description: "파일 추가 대화형 메뉴",
    category: "menu",
  },
  "add-all": {
    id: "add-all",
    name: "➕ 모든 파일 추가",
    description: "모든 변경사항 스테이징",
    category: "action",
  },
  "commit-menu": {
    id: "commit-menu",
    name: "📝 커밋 메뉴",
    description: "커밋 관련 대화형 메뉴",
    category: "menu",
  },
  commit: {
    id: "commit",
    name: "💾 커밋 생성",
    description: "커밋 메시지 입력 후 커밋",
    category: "action",
    requiresInput: true,
    inputType: "text",
    inputPrompt: "커밋 메시지를 입력하세요",
  },
  push: {
    id: "push",
    name: "⬆️  푸시 메뉴",
    description: "푸시 대화형 메뉴",
    category: "menu",
  },
  "push-current": {
    id: "push-current",
    name: "⬆️  현재 브랜치 푸시",
    description: "현재 브랜치를 origin으로 푸시",
    category: "action",
  },
  pull: {
    id: "pull",
    name: "⬇️  풀 메뉴",
    description: "풀 대화형 메뉴",
    category: "menu",
  },
  "pull-current": {
    id: "pull-current",
    name: "⬇️  현재 브랜치 풀",
    description: "현재 브랜치에서 풀",
    category: "action",
  },

  // 브랜치 관련
  "branch-menu": {
    id: "branch-menu",
    name: "🌿 브랜치 메뉴",
    description: "브랜치 관리 대화형 메뉴",
    category: "menu",
  },
  "branch-switch": {
    id: "branch-switch",
    name: "🔀 브랜치 전환",
    description: "다른 브랜치로 전환",
    category: "action",
    requiresInput: true,
    inputType: "select",
    inputPrompt: "전환할 브랜치를 선택하세요",
  },
  "branch-create": {
    id: "branch-create",
    name: "➕ 브랜치 생성",
    description: "새 브랜치 생성",
    category: "action",
    requiresInput: true,
    inputType: "text",
    inputPrompt: "새 브랜치 이름을 입력하세요",
  },
  "branch-delete": {
    id: "branch-delete",
    name: "🗑️  브랜치 삭제",
    description: "브랜치 삭제",
    category: "action",
    requiresInput: true,
    inputType: "select",
    inputPrompt: "삭제할 브랜치를 선택하세요",
  },

  // 스태시 관련
  "stash-menu": {
    id: "stash-menu",
    name: "📦 스태시 메뉴",
    description: "스태시 관리 대화형 메뉴",
    category: "menu",
  },
  "stash-save": {
    id: "stash-save",
    name: "💾 스태시 저장",
    description: "현재 변경사항 스태시",
    category: "action",
  },
  "stash-pop": {
    id: "stash-pop",
    name: "📤 스태시 복원",
    description: "최근 스태시 복원",
    category: "action",
  },
  "stash-list": {
    id: "stash-list",
    name: "📋 스태시 목록",
    description: "스태시 목록 보기",
    category: "action",
  },
  "stash-drop": {
    id: "stash-drop",
    name: "🗑️  스태시 삭제",
    description: "특정 스태시 삭제",
    category: "action",
    requiresInput: true,
    inputType: "select",
    inputPrompt: "삭제할 스태시를 선택하세요",
  },
  "stash-clear": {
    id: "stash-clear",
    name: "🧹 스태시 전체삭제",
    description: "모든 스태시 삭제",
    category: "action",
  },

  // 리베이스 관련
  "rebase-menu": {
    id: "rebase-menu",
    name: "🔄 리베이스 메뉴",
    description: "리베이스 대화형 메뉴",
    category: "menu",
  },
  rebase: {
    id: "rebase",
    name: "🔄 리베이스 실행",
    description: "특정 브랜치로 리베이스",
    category: "action",
    requiresInput: true,
    inputType: "text",
    inputPrompt: "리베이스할 브랜치 이름 (기본: main)",
  },

  // 커밋 관리
  "commit-revert": {
    id: "commit-revert",
    name: "↩️  커밋 되돌리기",
    description: "커밋 되돌리기 (Revert)",
    category: "action",
    requiresInput: true,
    inputType: "text",
    inputPrompt: "되돌릴 커밋 해시를 입력하세요",
  },
  "commit-reset-soft": {
    id: "commit-reset-soft",
    name: "🔙 Soft Reset",
    description: "커밋만 취소 (변경사항 유지)",
    category: "action",
  },
  "commit-reset-mixed": {
    id: "commit-reset-mixed",
    name: "🔙 Mixed Reset",
    description: "커밋+스테이징 취소",
    category: "action",
  },
  "commit-reset-hard": {
    id: "commit-reset-hard",
    name: "🔙 Hard Reset",
    description: "모든 변경사항 취소",
    category: "action",
  },

  // 기타
  merge: {
    id: "merge",
    name: "🔀 병합",
    description: "브랜치 병합",
    category: "action",
    requiresInput: true,
    inputType: "text",
    inputPrompt: "병합할 브랜치 이름을 입력하세요",
  },
  fetch: {
    id: "fetch",
    name: "📥 페치",
    description: "원격 저장소 정보 가져오기",
    category: "action",
  },
  tag: {
    id: "tag",
    name: "🏷️  태그 생성",
    description: "태그 생성",
    category: "action",
    requiresInput: true,
    inputType: "text",
    inputPrompt: "태그 이름을 입력하세요",
  },
  "discard-changes": {
    id: "discard-changes",
    name: "🗑️  변경사항 버리기",
    description: "선택한 파일의 변경사항 폐기",
    category: "action",
  },

  // 대화형 메뉴들
  "pr-menu": {
    id: "pr-menu",
    name: "🔧 PR 메뉴",
    description: "Pull Request 관리 메뉴",
    category: "menu",
  },
  "pr-create": {
    id: "pr-create",
    name: "🆕 PR 생성",
    description: "Pull Request 생성",
    category: "action",
  },
  "pr-list": {
    id: "pr-list",
    name: "📋 PR 목록",
    description: "Pull Request 목록 보기",
    category: "action",
  },
  "pr-open": {
    id: "pr-open",
    name: "🏠 PR 홈페이지 열기",
    description: "PR 페이지를 브라우저에서 열기",
    category: "action",
  },

  "rollback-menu": {
    id: "rollback-menu",
    name: "⏮️  롤백 메뉴",
    description: "롤백 관리 메뉴",
    category: "menu",
  },
  "log-menu": {
    id: "log-menu",
    name: "📜 로그 메뉴",
    description: "커밋 로그 보기 메뉴",
    category: "menu",
  },
  "remote-menu": {
    id: "remote-menu",
    name: "🌐 원격 저장소 메뉴",
    description: "원격 저장소 관리 메뉴",
    category: "menu",
  },
};

export function getActionsByCategory(
  category?: "menu" | "action"
): MenuAction[] {
  const actions = Object.values(MENU_ACTIONS);
  if (category) {
    return actions.filter((a) => a.category === category);
  }
  return actions;
}

export function getActionById(id: string): MenuAction | undefined {
  return MENU_ACTIONS[id];
}

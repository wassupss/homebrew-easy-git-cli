import {
  MENU_ACTIONS,
  getActionsByCategory,
  getActionById,
  MenuAction,
} from "../../../src/types/menu-actions";

describe("Menu Actions", () => {
  describe("MENU_ACTIONS 구조", () => {
    it("모든 액션이 정의되어 있어야 함", () => {
      expect(MENU_ACTIONS).toBeDefined();
      expect(Object.keys(MENU_ACTIONS).length).toBeGreaterThan(0);
    });

    it("각 액션이 필수 속성을 가져야 함", () => {
      Object.values(MENU_ACTIONS).forEach((action) => {
        expect(action.id).toBeDefined();
        expect(action.name).toBeDefined();
        expect(action.description).toBeDefined();
        expect(action.category).toBeDefined();
        expect(["menu", "action"]).toContain(action.category);
      });
    });

    it("기본 액션들이 존재해야 함", () => {
      const requiredActions = [
        "status",
        "add",
        "commit",
        "push",
        "pull",
        "branch-switch",
        "branch-create",
        "stash-save",
        "stash-pop",
      ];

      requiredActions.forEach((actionId) => {
        expect(MENU_ACTIONS[actionId]).toBeDefined();
      });
    });

    it("메뉴 액션들이 존재해야 함", () => {
      const menuActions = [
        "branch-menu",
        "stash-menu",
        "pr-menu",
        "rebase-menu",
        "rollback-menu",
      ];

      menuActions.forEach((actionId) => {
        expect(MENU_ACTIONS[actionId]).toBeDefined();
        expect(MENU_ACTIONS[actionId].category).toBe("menu");
      });
    });
  });

  describe("getActionsByCategory", () => {
    it("모든 액션을 반환해야 함 (카테고리 지정 없이)", () => {
      const actions = getActionsByCategory();

      expect(actions.length).toBeGreaterThan(0);
      expect(actions.length).toBe(Object.keys(MENU_ACTIONS).length);
    });

    it("menu 카테고리 액션들만 반환해야 함", () => {
      const menuActions = getActionsByCategory("menu");

      expect(menuActions.length).toBeGreaterThan(0);
      menuActions.forEach((action) => {
        expect(action.category).toBe("menu");
      });
    });

    it("action 카테고리 액션들만 반환해야 함", () => {
      const actions = getActionsByCategory("action");

      expect(actions.length).toBeGreaterThan(0);
      actions.forEach((action) => {
        expect(action.category).toBe("action");
      });
    });

    it("menu와 action 카테고리의 합이 전체 액션 수와 같아야 함", () => {
      const menuActions = getActionsByCategory("menu");
      const actions = getActionsByCategory("action");
      const allActions = getActionsByCategory();

      expect(menuActions.length + actions.length).toBe(allActions.length);
    });
  });

  describe("getActionById", () => {
    it("존재하는 액션을 ID로 조회할 수 있어야 함", () => {
      const action = getActionById("status");

      expect(action).toBeDefined();
      expect(action?.id).toBe("status");
      expect(action?.name).toContain("상태");
    });

    it("존재하지 않는 ID는 undefined를 반환해야 함", () => {
      const action = getActionById("non-existent-action");

      expect(action).toBeUndefined();
    });

    it("각 액션의 ID가 고유해야 함", () => {
      const ids = Object.keys(MENU_ACTIONS);
      const uniqueIds = new Set(ids);

      expect(ids.length).toBe(uniqueIds.size);
    });
  });

  describe("액션 속성 검증", () => {
    it("입력이 필요한 액션들이 올바른 속성을 가져야 함", () => {
      const actionsRequiringInput = Object.values(MENU_ACTIONS).filter(
        (action) => action.requiresInput
      );

      actionsRequiringInput.forEach((action) => {
        expect(action.inputType).toBeDefined();
        expect(["text", "select", "confirm"]).toContain(action.inputType);
        expect(action.inputPrompt).toBeDefined();
      });
    });

    it("브랜치 관련 액션들이 존재해야 함", () => {
      const branchActions = [
        "branch-menu",
        "branch-switch",
        "branch-create",
        "branch-delete",
      ];

      branchActions.forEach((actionId) => {
        const action = getActionById(actionId);
        expect(action).toBeDefined();
        expect(action?.name).toContain("브랜치");
      });
    });

    it("스태시 관련 액션들이 존재해야 함", () => {
      const stashActions = [
        "stash-menu",
        "stash-save",
        "stash-pop",
        "stash-list",
        "stash-drop",
        "stash-clear",
      ];

      stashActions.forEach((actionId) => {
        const action = getActionById(actionId);
        expect(action).toBeDefined();
        expect(action?.name).toContain("스태시");
      });
    });

    it("PR 관련 액션들이 존재해야 함", () => {
      const prActions = ["pr-menu", "pr-create", "pr-list", "pr-open"];

      prActions.forEach((actionId) => {
        const action = getActionById(actionId);
        expect(action).toBeDefined();
      });
    });
  });

  describe("액션 이름과 설명", () => {
    it("모든 액션이 이름을 가져야 함", () => {
      Object.values(MENU_ACTIONS).forEach((action) => {
        expect(action.name.length).toBeGreaterThan(0);
      });
    });

    it("모든 액션의 설명이 비어있지 않아야 함", () => {
      Object.values(MENU_ACTIONS).forEach((action) => {
        expect(action.description.length).toBeGreaterThan(0);
      });
    });

    it("액션 이름에 공백이 있거나 이모지가 있어야 함", () => {
      Object.values(MENU_ACTIONS).forEach((action) => {
        // 이름이 최소한 2자 이상이어야 함
        expect(action.name.length).toBeGreaterThan(1);
      });
    });
  });
});

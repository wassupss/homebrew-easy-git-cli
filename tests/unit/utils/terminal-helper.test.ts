import {
  getSafePageSize,
  isTerminalLargeEnough,
} from "../../../src/utils/terminal-helper";

describe("Terminal Helper", () => {
  describe("getSafePageSize", () => {
    let originalRows: number | undefined;

    beforeEach(() => {
      originalRows = process.stdout.rows;
    });

    afterEach(() => {
      if (originalRows !== undefined) {
        (process.stdout as any).rows = originalRows;
      }
    });

    it("기본값을 반환해야 함", () => {
      (process.stdout as any).rows = 30;
      const pageSize = getSafePageSize(15, 5);

      expect(pageSize).toBe(15);
    });

    it("터미널이 작으면 조정된 값을 반환해야 함", () => {
      (process.stdout as any).rows = 15;
      const pageSize = getSafePageSize(15, 5);

      // 15행 - 10(헤더/푸터) = 5
      expect(pageSize).toBe(5);
    });

    it("최소값보다 작아지지 않아야 함", () => {
      (process.stdout as any).rows = 10;
      const pageSize = getSafePageSize(15, 5);

      expect(pageSize).toBeGreaterThanOrEqual(5);
    });

    it("터미널 높이가 없을 때 기본값을 사용해야 함", () => {
      (process.stdout as any).rows = undefined;
      const pageSize = getSafePageSize(15, 5);

      // rows가 없으면 24로 가정 -> 24-10=14, min(14, 15)=14
      expect(pageSize).toBeGreaterThanOrEqual(5);
    });

    it("매우 작은 터미널에서 최소값을 유지해야 함", () => {
      (process.stdout as any).rows = 5;
      const pageSize = getSafePageSize(15, 5);

      expect(pageSize).toBe(5);
    });

    it("매우 큰 터미널에서 기본값을 유지해야 함", () => {
      (process.stdout as any).rows = 100;
      const pageSize = getSafePageSize(15, 5);

      expect(pageSize).toBe(15);
    });
  });

  describe("isTerminalLargeEnough", () => {
    let originalRows: number | undefined;

    beforeEach(() => {
      originalRows = process.stdout.rows;
    });

    afterEach(() => {
      if (originalRows !== undefined) {
        (process.stdout as any).rows = originalRows;
      }
    });

    it("터미널이 충분히 크면 true를 반환해야 함", () => {
      (process.stdout as any).rows = 30;
      const isLarge = isTerminalLargeEnough(20);

      expect(isLarge).toBe(true);
    });

    it("터미널이 작으면 false를 반환해야 함", () => {
      (process.stdout as any).rows = 15;
      const isLarge = isTerminalLargeEnough(20);

      expect(isLarge).toBe(false);
    });

    it("정확히 최소값이면 true를 반환해야 함", () => {
      (process.stdout as any).rows = 20;
      const isLarge = isTerminalLargeEnough(20);

      expect(isLarge).toBe(true);
    });

    it("기본 최소값(20)으로 체크할 수 있어야 함", () => {
      (process.stdout as any).rows = 25;
      const isLarge = isTerminalLargeEnough();

      expect(isLarge).toBe(true);
    });
  });

  describe("터미널 크기 감지", () => {
    it("process.stdout.rows가 숫자거나 undefined여야 함", () => {
      const rows = process.stdout.rows;

      expect(rows === undefined || typeof rows === "number").toBe(true);
    });
  });
});

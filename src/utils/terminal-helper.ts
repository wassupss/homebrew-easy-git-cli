/**
 * 터미널 관련 헬퍼 함수들
 */

/**
 * 터미널 높이를 기반으로 안전한 pageSize를 계산합니다
 * @param defaultSize 기본 페이지 사이즈
 * @param minSize 최소 페이지 사이즈
 * @returns 계산된 페이지 사이즈
 */
export function getSafePageSize(
  defaultSize: number = 15,
  minSize: number = 5
): number {
  const terminalHeight = process.stdout.rows || 24;

  // 터미널 높이에서 헤더/푸터를 위한 공간 확보
  // 대략 10줄 정도를 헤더, 프롬프트, 여백 등으로 사용
  const availableHeight = terminalHeight - 10;

  // 최소값과 계산된 값 중 큰 값 사용
  const calculatedSize = Math.max(
    minSize,
    Math.min(availableHeight, defaultSize)
  );

  return calculatedSize;
}

/**
 * 화면을 지웁니다 (선택적)
 */
export function clearScreen(): void {
  // console.clear()는 사용하지 않고 여백만 추가
  // 이전 내용을 볼 수 있도록 유지
  console.log("\n");
}

/**
 * 터미널이 충분히 큰지 확인합니다
 * @param minRows 최소 필요 행 수
 * @returns 터미널이 충분히 큰 경우 true
 */
export function isTerminalLargeEnough(minRows: number = 20): boolean {
  const terminalHeight = process.stdout.rows || 24;
  return terminalHeight >= minRows;
}

/**
 * 터미널 크기 경고 메시지를 표시합니다
 */
export function showTerminalSizeWarning(): void {
  const terminalHeight = process.stdout.rows || 24;
  if (terminalHeight < 20) {
    console.log("\n⚠️  터미널 높이가 작아 일부 메뉴가 잘릴 수 있습니다.");
    console.log(
      "   터미널 창을 더 크게 조정하시면 더 나은 경험을 하실 수 있습니다.\n"
    );
  }
}

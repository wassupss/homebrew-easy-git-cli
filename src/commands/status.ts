import chalk from "chalk";
import { GitService } from "../services/git-service";

export async function displayStatus(gitService: GitService): Promise<void> {
  const status = await gitService.getStatus();

  console.log(chalk.bold.cyan("\n📊 Git 상태\n"));

  // Staged files
  if (status.staged.length > 0) {
    console.log(chalk.green.bold("✅ Staged (커밋 준비됨):"));
    status.staged.forEach((file: string) =>
      console.log(chalk.green(`   + ${file}`))
    );
    console.log();
  }

  // Modified files
  if (status.modified.length > 0) {
    console.log(chalk.yellow.bold("📝 Modified (수정됨):"));
    status.modified.forEach((file: string) =>
      console.log(chalk.yellow(`   M ${file}`))
    );
    console.log();
  }

  // New files
  if (status.not_added.length > 0) {
    console.log(chalk.red.bold("❓ Untracked (추적되지 않음):"));
    status.not_added.forEach((file: string) =>
      console.log(chalk.red(`   ? ${file}`))
    );
    console.log();
  }

  // Deleted files
  if (status.deleted.length > 0) {
    console.log(chalk.red.bold("🗑️  Deleted (삭제됨):"));
    status.deleted.forEach((file: string) =>
      console.log(chalk.red(`   D ${file}`))
    );
    console.log();
  }

  // Conflicted files
  if (status.conflicted.length > 0) {
    console.log(chalk.magenta.bold("⚠️  Conflicted (충돌):"));
    status.conflicted.forEach((file: string) =>
      console.log(chalk.magenta(`   ! ${file}`))
    );
    console.log();
  }

  if (
    status.staged.length === 0 &&
    status.modified.length === 0 &&
    status.not_added.length === 0 &&
    status.deleted.length === 0 &&
    status.conflicted.length === 0
  ) {
    console.log(chalk.green("✨ 작업 디렉토리가 깨끗합니다!\n"));
  }

  // Branch info
  console.log(chalk.blue(`📍 현재 브랜치: ${chalk.bold(status.current)}`));
  if (status.ahead > 0) {
    console.log(
      chalk.cyan(`   ⬆️  로컬이 원격보다 ${status.ahead}개 커밋 앞서 있습니다.`)
    );
  }
  if (status.behind > 0) {
    console.log(
      chalk.cyan(
        `   ⬇️  로컬이 원격보다 ${status.behind}개 커밋 뒤에 있습니다.`
      )
    );
  }
  console.log();
}

import ora from "ora";
import {
  GitExecutor,
  GitStatus,
  GitLog,
  GitBranch,
  GitRemote,
} from "../utils/git-executor";

export class GitService {
  private git: GitExecutor;

  constructor(baseDir?: string) {
    this.git = new GitExecutor(baseDir || process.cwd());
  }

  async isGitRepository(): Promise<boolean> {
    return await this.git.isGitRepository();
  }

  async init(): Promise<void> {
    const spinner = ora("Git 저장소 초기화 중...").start();
    try {
      await this.git.init();
      spinner.succeed("Git 저장소가 초기화되었습니다.");
    } catch (error: any) {
      spinner.fail("초기화 실패");
      throw error;
    }
  }

  async getStatus(): Promise<GitStatus> {
    return await this.git.status();
  }

  async getCurrentBranch(): Promise<string> {
    return await this.git.currentBranch();
  }

  async add(files: string[]): Promise<void> {
    const spinner = ora("파일 추가 중...").start();
    try {
      await this.git.add(files);
      spinner.succeed(`${files.length}개 파일 추가됨`);
    } catch (error: any) {
      spinner.fail("파일 추가 실패");
      throw error;
    }
  }

  async addAll(): Promise<void> {
    const spinner = ora("모든 파일 추가 중...").start();
    try {
      await this.git.addAll();
      spinner.succeed("모든 파일 추가됨");
    } catch (error: any) {
      spinner.fail("파일 추가 실패");
      throw error;
    }
  }

  async reset(): Promise<void> {
    const spinner = ora("언스테이징 중...").start();
    try {
      await this.git.reset();
      spinner.succeed("모든 파일 언스테이징됨");
    } catch (error: any) {
      spinner.fail("언스테이징 실패");
      throw error;
    }
  }

  async unstageFile(file: string): Promise<void> {
    try {
      await this.git.unstageFile(file);
    } catch (error: any) {
      throw error;
    }
  }

  async commit(message: string): Promise<void> {
    const spinner = ora("커밋 중...").start();
    try {
      await this.git.commit(message);
      spinner.succeed("커밋 완료");
    } catch (error: any) {
      spinner.fail("커밋 실패");
      throw error;
    }
  }

  async push(remote: string = "origin", branch?: string): Promise<void> {
    const spinner = ora("푸시 중...").start();
    try {
      if (branch) {
        await this.git.push(remote, branch);
      } else {
        await this.git.push();
      }
      spinner.succeed("푸시 완료");
    } catch (error: any) {
      spinner.fail("푸시 실패");
      throw error;
    }
  }

  async pull(remote: string = "origin", branch?: string): Promise<void> {
    const spinner = ora("풀 중...").start();
    try {
      if (branch) {
        await this.git.pull(remote, branch);
      } else {
        await this.git.pull();
      }
      spinner.succeed("풀 완료");
    } catch (error: any) {
      spinner.fail("풀 실패");
      throw error;
    }
  }

  async getBranches(): Promise<GitBranch> {
    return await this.git.branch();
  }

  async createBranch(branchName: string): Promise<void> {
    const spinner = ora(`브랜치 '${branchName}' 생성 중...`).start();
    try {
      await this.git.createBranch(branchName);
      spinner.succeed(`브랜치 '${branchName}' 생성 및 전환됨`);
    } catch (error: any) {
      spinner.fail("브랜치 생성 실패");
      throw error;
    }
  }

  async switchBranch(branchName: string): Promise<void> {
    const spinner = ora(`브랜치 '${branchName}'로 전환 중...`).start();
    try {
      await this.git.checkout(branchName);
      spinner.succeed(`브랜치 '${branchName}'로 전환됨`);
    } catch (error: any) {
      spinner.fail("브랜치 전환 실패");
      throw error;
    }
  }

  async deleteBranch(
    branchName: string,
    force: boolean = false
  ): Promise<void> {
    const spinner = ora(`브랜치 '${branchName}' 삭제 중...`).start();
    try {
      await this.git.deleteBranch(branchName, force);
      spinner.succeed(`브랜치 '${branchName}' 삭제됨`);
    } catch (error: any) {
      spinner.fail("브랜치 삭제 실패");
      throw error;
    }
  }

  async getLog(maxCount: number = 10): Promise<GitLog> {
    return await this.git.log(maxCount);
  }

  async stashSave(message?: string): Promise<void> {
    const spinner = ora("Stash 저장 중...").start();
    try {
      if (message) {
        await this.git.stash(["save", message]);
      } else {
        await this.git.stash();
      }
      spinner.succeed("Stash 저장됨");
    } catch (error: any) {
      spinner.fail("Stash 저장 실패");
      throw error;
    }
  }

  async stashPop(): Promise<void> {
    const spinner = ora("Stash 복원 중...").start();
    try {
      await this.git.stash(["pop"]);
      spinner.succeed("Stash 복원됨");
    } catch (error: any) {
      spinner.fail("Stash 복원 실패");
      throw error;
    }
  }

  async stashList(): Promise<
    Array<{ index: number; message: string; hash: string }>
  > {
    return await this.git.stashList();
  }

  async stashDrop(index: number = 0): Promise<void> {
    const spinner = ora("Stash 삭제 중...").start();
    try {
      await this.git.stash(["drop", `stash@{${index}}`]);
      spinner.succeed("Stash 삭제됨");
    } catch (error: any) {
      spinner.fail("Stash 삭제 실패");
      throw error;
    }
  }

  async stashClear(): Promise<void> {
    const spinner = ora("모든 Stash 삭제 중...").start();
    try {
      await this.git.stash(["clear"]);
      spinner.succeed("모든 Stash 삭제됨");
    } catch (error: any) {
      spinner.fail("Stash 삭제 실패");
      throw error;
    }
  }

  // Remote 관련 메서드
  async getRemotes(): Promise<GitRemote[]> {
    return await this.git.getRemotes();
  }

  async addRemote(name: string, url: string): Promise<void> {
    const spinner = ora(`원격 저장소 '${name}' 추가 중...`).start();
    try {
      await this.git.addRemote(name, url);
      spinner.succeed(`원격 저장소 '${name}' 추가됨`);
    } catch (error: any) {
      spinner.fail("원격 저장소 추가 실패");
      throw error;
    }
  }

  async removeRemote(name: string): Promise<void> {
    const spinner = ora(`원격 저장소 '${name}' 제거 중...`).start();
    try {
      await this.git.removeRemote(name);
      spinner.succeed(`원격 저장소 '${name}' 제거됨`);
    } catch (error: any) {
      spinner.fail("원격 저장소 제거 실패");
      throw error;
    }
  }

  async clone(repoUrl: string, localPath?: string): Promise<void> {
    const spinner = ora("저장소 클론 중...").start();
    try {
      if (localPath) {
        await this.git.clone(repoUrl, localPath);
      } else {
        await this.git.clone(repoUrl);
      }
      spinner.succeed("저장소 클론 완료");
    } catch (error: any) {
      spinner.fail("클론 실패");
      throw error;
    }
  }

  async fetchAll(): Promise<void> {
    const spinner = ora("원격 브랜치 정보 가져오는 중...").start();
    try {
      await this.git.fetch();
      spinner.succeed("Fetch 완료");
    } catch (error: any) {
      spinner.fail("Fetch 실패");
      throw error;
    }
  }

  async hasRemoteUpdates(): Promise<boolean> {
    try {
      await this.git.fetch();
      const status = await this.git.status();
      return status.behind > 0;
    } catch (error) {
      return false;
    }
  }

  async switchBranchWithPull(branchName: string): Promise<void> {
    const spinner = ora(`브랜치 '${branchName}'로 전환 중...`).start();
    try {
      await this.git.checkout(branchName);
      spinner.text = "원격 변경사항 확인 중...";

      const hasUpdates = await this.hasRemoteUpdates();

      if (hasUpdates) {
        spinner.text = "원격 변경사항 가져오는 중...";
        await this.git.pull();
        spinner.succeed(
          `브랜치 '${branchName}'로 전환 및 최신 코드 가져오기 완료`
        );
      } else {
        spinner.succeed(`브랜치 '${branchName}'로 전환됨 (최신 상태)`);
      }
    } catch (error: any) {
      spinner.fail("브랜치 전환 실패");
      throw error;
    }
  }

  async rebase(branch: string): Promise<void> {
    const spinner = ora(`'${branch}' 브랜치로 rebase 중...`).start();
    try {
      await this.git.rebase(branch);
      spinner.succeed(`'${branch}' 브랜치로 rebase 완료`);
    } catch (error: any) {
      spinner.fail("Rebase 실패");
      throw error;
    }
  }

  async rebaseContinue(): Promise<void> {
    const spinner = ora("Rebase 계속 진행 중...").start();
    try {
      await this.git.rebaseContinue();
      spinner.succeed("Rebase 계속 진행 완료");
    } catch (error: any) {
      spinner.fail("Rebase 계속 진행 실패");
      throw error;
    }
  }

  async rebaseAbort(): Promise<void> {
    const spinner = ora("Rebase 취소 중...").start();
    try {
      await this.git.rebaseAbort();
      spinner.succeed("Rebase 취소됨");
    } catch (error: any) {
      spinner.fail("Rebase 취소 실패");
      throw error;
    }
  }

  async rebaseSkip(): Promise<void> {
    const spinner = ora("Rebase 현재 커밋 건너뛰는 중...").start();
    try {
      await this.git.rebaseSkip();
      spinner.succeed("Rebase 커밋 건너뛰기 완료");
    } catch (error: any) {
      spinner.fail("Rebase 건너뛰기 실패");
      throw error;
    }
  }

  async revert(commitHash: string): Promise<void> {
    const spinner = ora(`커밋 ${commitHash} 되돌리는 중...`).start();
    try {
      await this.git.revert(commitHash);
      spinner.succeed(`커밋 ${commitHash} 되돌리기 완료`);
    } catch (error: any) {
      spinner.fail("커밋 되돌리기 실패");
      throw error;
    }
  }

  async resetSoft(commitHash?: string): Promise<void> {
    const target = commitHash || "이전 커밋";
    const spinner = ora(`커밋 취소 중 (Soft)...`).start();
    try {
      await this.git.resetSoft(commitHash);
      spinner.succeed(`커밋 취소됨 (변경사항은 Staged 상태로 유지)`);
    } catch (error: any) {
      spinner.fail("커밋 취소 실패");
      throw error;
    }
  }

  async resetMixed(commitHash?: string): Promise<void> {
    const target = commitHash || "이전 커밋";
    const spinner = ora(`커밋 취소 중 (Mixed)...`).start();
    try {
      await this.git.resetMixed(commitHash);
      spinner.succeed(`커밋 취소됨 (변경사항은 Unstaged 상태로 유지)`);
    } catch (error: any) {
      spinner.fail("커밋 취소 실패");
      throw error;
    }
  }

  async resetHard(commitHash?: string): Promise<void> {
    const target = commitHash || "이전 커밋";
    const spinner = ora(`커밋 취소 중 (Hard)...`).start();
    try {
      await this.git.resetHard(commitHash);
      spinner.succeed(`커밋 취소됨 (변경사항 모두 삭제됨)`);
    } catch (error: any) {
      spinner.fail("커밋 취소 실패");
      throw error;
    }
  }

  async merge(branch: string, noFf: boolean = false): Promise<void> {
    const spinner = ora(`'${branch}' 브랜치 병합 중...`).start();
    try {
      await this.git.merge(branch, noFf);
      spinner.succeed(`'${branch}' 브랜치 병합 완료`);
    } catch (error: any) {
      spinner.fail("병합 실패");
      throw error;
    }
  }

  async mergeAbort(): Promise<void> {
    const spinner = ora("병합 취소 중...").start();
    try {
      await this.git.mergeAbort();
      spinner.succeed("병합 취소됨");
    } catch (error: any) {
      spinner.fail("병합 취소 실패");
      throw error;
    }
  }

  async getGraph(maxCount: number = 20): Promise<string> {
    return await this.git.getGraph(maxCount);
  }
}

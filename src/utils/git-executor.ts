import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface GitStatus {
  current: string;
  files: Array<{
    path: string;
    working_dir: string;
    index: string;
  }>;
  staged: string[];
  modified: string[];
  not_added: string[];
  deleted: string[];
  conflicted: string[];
  ahead: number;
  behind: number;
  tracking: string | null;
}

export interface GitLog {
  latest: {
    hash: string;
    date: string;
    message: string;
    author_name: string;
    author_email: string;
  } | null;
  total: number;
  all: Array<{
    hash: string;
    date: string;
    message: string;
    author_name: string;
    author_email: string;
  }>;
}

export interface GitBranch {
  all: string[];
  branches: { [key: string]: { current: boolean; name: string } };
  current: string;
}

export interface GitRemote {
  name: string;
  refs: {
    fetch: string;
    push: string;
  };
}

export class GitExecutor {
  private cwd: string;

  constructor(baseDir?: string) {
    this.cwd = baseDir || process.cwd();
  }

  private async execute(command: string): Promise<string> {
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.cwd,
        maxBuffer: 10 * 1024 * 1024, // 10MB
      });
      return stdout.trim();
    } catch (error: any) {
      throw new Error(error.stderr || error.message);
    }
  }

  async isGitRepository(): Promise<boolean> {
    try {
      await this.execute("git rev-parse --git-dir");
      return true;
    } catch {
      return false;
    }
  }

  async init(): Promise<void> {
    await this.execute("git init");
  }

  async status(): Promise<GitStatus> {
    const statusOutput = await this.execute(
      "git status --porcelain=v1 --branch"
    );
    const lines = statusOutput.split("\n").filter((line) => line.trim());

    const status: GitStatus = {
      current: "",
      files: [],
      staged: [],
      modified: [],
      not_added: [],
      deleted: [],
      conflicted: [],
      ahead: 0,
      behind: 0,
      tracking: null,
    };

    for (const line of lines) {
      if (line.startsWith("##")) {
        // Branch info
        const branchInfo = line.substring(3);
        const [branchPart, ...trackingParts] = branchInfo.split("...");
        status.current = branchPart.trim();

        if (trackingParts.length > 0) {
          const trackingInfo = trackingParts.join("...");
          status.tracking = trackingInfo.split("[")[0].trim();

          const aheadMatch = trackingInfo.match(/ahead (\d+)/);
          const behindMatch = trackingInfo.match(/behind (\d+)/);

          if (aheadMatch) status.ahead = parseInt(aheadMatch[1]);
          if (behindMatch) status.behind = parseInt(behindMatch[1]);
        }
      } else {
        const index = line[0];
        const workingDir = line[1];
        const path = line.substring(3).trim();

        const fileInfo = {
          path,
          index,
          working_dir: workingDir,
        };

        status.files.push(fileInfo);

        // Categorize files
        if (index === "?" && workingDir === "?") {
          status.not_added.push(path);
        } else if (index === "D" || workingDir === "D") {
          status.deleted.push(path);
        } else if (index === "U" || workingDir === "U") {
          status.conflicted.push(path);
        } else if (index !== " " && index !== "?") {
          status.staged.push(path);
        } else if (workingDir === "M") {
          status.modified.push(path);
        }
      }
    }

    return status;
  }

  async currentBranch(): Promise<string> {
    return await this.execute("git branch --show-current");
  }

  async add(files: string[]): Promise<void> {
    const filesArg = files.map((f) => `"${f}"`).join(" ");
    await this.execute(`git add ${filesArg}`);
  }

  async addAll(): Promise<void> {
    await this.execute("git add .");
  }

  async reset(): Promise<void> {
    await this.execute("git reset");
  }

  async unstageFile(file: string): Promise<void> {
    await this.execute(`git reset HEAD "${file}"`);
  }

  async commit(message: string): Promise<void> {
    const escapedMessage = message.replace(/"/g, '\\"');
    await this.execute(`git commit -m "${escapedMessage}"`);
  }

  async push(remote: string = "origin", branch?: string): Promise<void> {
    if (branch) {
      await this.execute(`git push ${remote} ${branch}`);
    } else {
      await this.execute("git push");
    }
  }

  async pull(remote: string = "origin", branch?: string): Promise<void> {
    if (branch) {
      await this.execute(`git pull ${remote} ${branch}`);
    } else {
      await this.execute("git pull");
    }
  }

  async branch(): Promise<GitBranch> {
    const output = await this.execute("git branch");
    const lines = output.split("\n").filter((line) => line.trim());

    const branches: GitBranch = {
      all: [],
      branches: {},
      current: "",
    };

    for (const line of lines) {
      const isCurrent = line.startsWith("*");
      const branchName = line.replace("*", "").trim();

      if (branchName) {
        branches.all.push(branchName);
        branches.branches[branchName] = {
          current: isCurrent,
          name: branchName,
        };

        if (isCurrent) {
          branches.current = branchName;
        }
      }
    }

    return branches;
  }

  async createBranch(branchName: string): Promise<void> {
    await this.execute(`git checkout -b ${branchName}`);
  }

  async checkout(branchName: string): Promise<void> {
    await this.execute(`git checkout ${branchName}`);
  }

  async deleteBranch(
    branchName: string,
    force: boolean = false
  ): Promise<void> {
    const flag = force ? "-D" : "-d";
    await this.execute(`git branch ${flag} ${branchName}`);
  }

  async log(maxCount: number = 10): Promise<GitLog> {
    const format = "%H%n%aI%n%s%n%an%n%ae%n---END---";
    const output = await this.execute(
      `git log -${maxCount} --pretty=format:"${format}"`
    );

    const commits = output
      .split("---END---")
      .filter((entry) => entry.trim())
      .map((entry) => {
        const lines = entry.trim().split("\n");
        return {
          hash: lines[0],
          date: lines[1],
          message: lines[2],
          author_name: lines[3],
          author_email: lines[4],
        };
      });

    return {
      latest: commits[0] || null,
      total: commits.length,
      all: commits,
    };
  }

  async stash(args?: string[]): Promise<string> {
    if (args && args.length > 0) {
      return await this.execute(`git stash ${args.join(" ")}`);
    }
    return await this.execute("git stash");
  }

  async stashList(): Promise<
    Array<{ index: number; message: string; hash: string }>
  > {
    try {
      const output = await this.execute("git stash list");
      if (!output) return [];

      return output.split("\n").map((line, index) => {
        const match = line.match(/stash@\{(\d+)\}: (.*): (.*)/);
        return {
          index,
          hash: match ? match[0] : "",
          message: match ? match[3] : line,
        };
      });
    } catch {
      return [];
    }
  }

  async getRemotes(): Promise<GitRemote[]> {
    try {
      const output = await this.execute("git remote -v");
      if (!output) return [];

      const remotes: Map<string, GitRemote> = new Map();

      output.split("\n").forEach((line) => {
        const [name, urlAndType] = line.split("\t");
        if (!name || !urlAndType) return;

        const match = urlAndType.match(/(.*) \((fetch|push)\)/);
        if (!match) return;

        const url = match[1];
        const type = match[2] as "fetch" | "push";

        if (!remotes.has(name)) {
          remotes.set(name, {
            name,
            refs: { fetch: "", push: "" },
          });
        }

        const remote = remotes.get(name)!;
        remote.refs[type] = url;
      });

      return Array.from(remotes.values());
    } catch {
      return [];
    }
  }

  async addRemote(name: string, url: string): Promise<void> {
    await this.execute(`git remote add ${name} ${url}`);
  }

  async removeRemote(name: string): Promise<void> {
    await this.execute(`git remote remove ${name}`);
  }

  async clone(repoUrl: string, localPath?: string): Promise<void> {
    if (localPath) {
      await this.execute(`git clone ${repoUrl} ${localPath}`);
    } else {
      await this.execute(`git clone ${repoUrl}`);
    }
  }

  async fetch(): Promise<void> {
    await this.execute("git fetch");
  }

  async rebase(branch: string): Promise<void> {
    await this.execute(`git rebase ${branch}`);
  }

  async rebaseContinue(): Promise<void> {
    await this.execute("git rebase --continue");
  }

  async rebaseAbort(): Promise<void> {
    await this.execute("git rebase --abort");
  }

  async rebaseSkip(): Promise<void> {
    await this.execute("git rebase --skip");
  }

  async revert(commitHash: string): Promise<void> {
    await this.execute(`git revert ${commitHash} --no-edit`);
  }

  async resetSoft(commitHash?: string): Promise<void> {
    const target = commitHash || "HEAD~1";
    await this.execute(`git reset --soft ${target}`);
  }

  async resetMixed(commitHash?: string): Promise<void> {
    const target = commitHash || "HEAD~1";
    await this.execute(`git reset --mixed ${target}`);
  }

  async resetHard(commitHash?: string): Promise<void> {
    const target = commitHash || "HEAD~1";
    await this.execute(`git reset --hard ${target}`);
  }

  async merge(branch: string, noFf: boolean = false): Promise<void> {
    const ffFlag = noFf ? "--no-ff" : "";
    await this.execute(`git merge ${branch} ${ffFlag}`.trim());
  }

  async mergeAbort(): Promise<void> {
    await this.execute("git merge --abort");
  }

  async getGraph(maxCount: number = 20): Promise<string> {
    const format = "%C(auto)%h %C(blue)%an %C(green)%ar %C(auto)%d %C(reset)%s";
    return await this.execute(
      `git log --graph --oneline --decorate --all -${maxCount} --pretty=format:"${format}"`
    );
  }

  async discardChanges(files: string[]): Promise<void> {
    // 각 파일을 개별적으로 처리
    for (const file of files) {
      try {
        // Staged 파일인지 확인하고 unstage
        const statusResult = await this.execute(
          `git status --porcelain "${file}"`
        );

        if (statusResult) {
          const statusCode = statusResult.substring(0, 2);

          // Staged 파일이면 먼저 unstage
          if (statusCode[0] !== " " && statusCode[0] !== "?") {
            await this.execute(`git restore --staged "${file}"`);
          }

          // Untracked 파일은 삭제
          if (statusCode === "??") {
            await this.execute(`rm -f "${file}"`);
          } else {
            // Modified/Deleted 파일은 restore
            await this.execute(`git restore "${file}"`);
          }
        }
      } catch (error) {
        // 개별 파일 처리 실패는 무시하고 계속 진행
        console.warn(`Warning: Could not discard changes for ${file}`);
      }
    }
  }

  async createTag(tagName: string, message?: string): Promise<void> {
    if (message) {
      await this.execute(`git tag -a "${tagName}" -m "${message}"`);
    } else {
      await this.execute(`git tag "${tagName}"`);
    }
  }
}

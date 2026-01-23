import { exec } from "child_process";
import { promisify } from "util";
import chalk from "chalk";
import inquirer from "inquirer";
import { GitService } from "../services/git-service";

const execAsync = promisify(exec);

interface RemoteInfo {
  provider: "github" | "gitlab" | "bitbucket" | "unknown";
  owner: string;
  repo: string;
  url: string;
}

export async function handlePR(gitService: GitService): Promise<void> {
  try {
    // PR 메뉴 표시
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "Pull Request 작업을 선택하세요:",
        choices: [
          { name: "🆕 새 PR 생성", value: "create" },
          { name: "📋 PR 목록 보기", value: "list" },
          { name: "🏠 PR 홈페이지 열기", value: "home" },
          { name: "🔙 돌아가기", value: "back" },
        ],
      },
    ]);

    if (action === "back") {
      return;
    }

    if (action === "list") {
      await viewPRList(gitService);
      return;
    }

    if (action === "home") {
      await openPRHome(gitService);
      return;
    }

    // action === "create"
    // 현재 브랜치 확인
    const currentBranch = await gitService.getCurrentBranch();

    if (currentBranch === "main" || currentBranch === "master") {
      console.log(
        chalk.yellow(
          "⚠️  메인 브랜치에서는 PR을 생성할 수 없습니다. 다른 브랜치로 전환해주세요."
        )
      );
      return;
    }

    // Remote 정보 가져오기
    const remotes = await gitService.getRemotes();

    if (remotes.length === 0) {
      console.log(
        chalk.red("❌ 원격 저장소가 설정되지 않았습니다. Remote를 추가해주세요.")
      );
      return;
    }

    // origin 선택 (또는 첫 번째 remote)
    const originRemote = remotes.find((r) => r.name === "origin") || remotes[0];
    const remoteUrl = originRemote.refs.push || originRemote.refs.fetch;

    const remoteInfo = parseRemoteUrl(remoteUrl);

    if (remoteInfo.provider === "unknown") {
      console.log(
        chalk.yellow(
          `⚠️  지원하지 않는 Git 호스팅 서비스입니다: ${remoteUrl}`
        )
      );
      console.log(chalk.gray("지원 서비스: GitHub, GitLab, Bitbucket"));
      return;
    }

    console.log(chalk.cyan("\n📝 Pull Request 생성\n"));
    console.log(chalk.white(`현재 브랜치: ${chalk.bold(currentBranch)}`));
    console.log(
      chalk.white(`Remote: ${chalk.bold(originRemote.name)} (${remoteUrl})`)
    );
    console.log(
      chalk.white(
        `Provider: ${chalk.bold(capitalizeProvider(remoteInfo.provider))}`
      )
    );

    const { baseBranch } = await inquirer.prompt([
      {
        type: "input",
        name: "baseBranch",
        message: "병합할 대상 브랜치 (Base branch):",
        default: "main",
      },
    ]);

    const prUrl = generatePRUrl(
      remoteInfo,
      currentBranch,
      baseBranch,
      originRemote.name
    );

    console.log(chalk.cyan(`\n🌐 PR 생성 페이지를 여는 중...\n`));
    console.log(chalk.gray(`URL: ${prUrl}\n`));

    // 브라우저에서 열기
    await openBrowser(prUrl);

    console.log(chalk.green("✅ 브라우저에서 PR 생성 페이지를 열었습니다!"));
  } catch (error: any) {
    console.error(chalk.red(`❌ PR 생성 실패: ${error.message}`));
  }
}

function parseRemoteUrl(url: string): RemoteInfo {
  // SSH 형식: git@github.com:owner/repo.git
  const sshMatch = url.match(
    /git@([^:]+):([^/]+)\/(.+?)(?:\.git)?$/
  );

  // HTTPS 형식: https://github.com/owner/repo.git
  const httpsMatch = url.match(
    /https?:\/\/([^/]+)\/([^/]+)\/(.+?)(?:\.git)?$/
  );

  let host: string;
  let owner: string;
  let repo: string;

  if (sshMatch) {
    [, host, owner, repo] = sshMatch;
  } else if (httpsMatch) {
    [, host, owner, repo] = httpsMatch;
  } else {
    return {
      provider: "unknown",
      owner: "",
      repo: "",
      url,
    };
  }

  // Provider 판별
  let provider: "github" | "gitlab" | "bitbucket" | "unknown" = "unknown";

  if (host.includes("github.com")) {
    provider = "github";
  } else if (host.includes("gitlab.com")) {
    provider = "gitlab";
  } else if (host.includes("bitbucket.org")) {
    provider = "bitbucket";
  }

  return {
    provider,
    owner,
    repo,
    url,
  };
}

function generatePRUrl(
  remoteInfo: RemoteInfo,
  sourceBranch: string,
  targetBranch: string,
  remoteName: string
): string {
  const { provider, owner, repo } = remoteInfo;

  switch (provider) {
    case "github":
      // GitHub: https://github.com/owner/repo/compare/main...feature-branch
      return `https://github.com/${owner}/${repo}/compare/${targetBranch}...${sourceBranch}?expand=1`;

    case "gitlab":
      // GitLab: https://gitlab.com/owner/repo/-/merge_requests/new?merge_request[source_branch]=feature-branch&merge_request[target_branch]=main
      return `https://gitlab.com/${owner}/${repo}/-/merge_requests/new?merge_request[source_branch]=${sourceBranch}&merge_request[target_branch]=${targetBranch}`;

    case "bitbucket":
      // Bitbucket: https://bitbucket.org/owner/repo/pull-requests/new?source=feature-branch&dest=main
      return `https://bitbucket.org/${owner}/${repo}/pull-requests/new?source=${sourceBranch}&dest=${targetBranch}`;

    default:
      return "";
  }
}

async function openBrowser(url: string): Promise<void> {
  const platform = process.platform;

  let command: string;

  switch (platform) {
    case "darwin": // macOS
      command = `open "${url}"`;
      break;
    case "win32": // Windows
      command = `start "" "${url}"`;
      break;
    default: // Linux
      command = `xdg-open "${url}"`;
      break;
  }

  try {
    await execAsync(command);
  } catch (error: any) {
    console.log(
      chalk.yellow(
        "\n⚠️  브라우저를 자동으로 열 수 없습니다. 아래 URL을 복사해서 사용하세요:"
      )
    );
    console.log(chalk.cyan(url));
  }
}

function capitalizeProvider(provider: string): string {
  return provider.charAt(0).toUpperCase() + provider.slice(1);
}

// PR 홈페이지 열기
export async function openPRHome(gitService: GitService): Promise<void> {
  try {
    const remotes = await gitService.getRemotes();

    if (remotes.length === 0) {
      console.log(
        chalk.red("❌ 원격 저장소가 설정되지 않았습니다.")
      );
      return;
    }

    const originRemote = remotes.find((r) => r.name === "origin") || remotes[0];
    const remoteUrl = originRemote.refs.push || originRemote.refs.fetch;
    const remoteInfo = parseRemoteUrl(remoteUrl);

    if (remoteInfo.provider === "unknown") {
      console.log(
        chalk.yellow("⚠️  지원하지 않는 Git 호스팅 서비스입니다.")
      );
      return;
    }

    let homeUrl = "";

    switch (remoteInfo.provider) {
      case "github":
        homeUrl = `https://github.com/${remoteInfo.owner}/${remoteInfo.repo}`;
        break;
      case "gitlab":
        homeUrl = `https://gitlab.com/${remoteInfo.owner}/${remoteInfo.repo}`;
        break;
      case "bitbucket":
        homeUrl = `https://bitbucket.org/${remoteInfo.owner}/${remoteInfo.repo}`;
        break;
    }

    console.log(chalk.cyan("\n🏠 저장소 홈페이지를 여는 중...\n"));
    console.log(chalk.gray(`URL: ${homeUrl}\n`));
    await openBrowser(homeUrl);
    console.log(chalk.green("✅ 브라우저에서 저장소 홈페이지를 열었습니다!"));
  } catch (error: any) {
    console.error(chalk.red(`❌ 홈페이지 열기 실패: ${error.message}`));
  }
}

// PR 목록 보기 기능 (선택사항)
export async function viewPRList(gitService: GitService): Promise<void> {
  try {
    const remotes = await gitService.getRemotes();

    if (remotes.length === 0) {
      console.log(chalk.red("❌ 원격 저장소가 설정되지 않았습니다."));
      return;
    }

    const originRemote = remotes.find((r) => r.name === "origin") || remotes[0];
    const remoteUrl = originRemote.refs.push || originRemote.refs.fetch;
    const remoteInfo = parseRemoteUrl(remoteUrl);

    if (remoteInfo.provider === "unknown") {
      console.log(
        chalk.yellow("⚠️  지원하지 않는 Git 호스팅 서비스입니다.")
      );
      return;
    }

    let prListUrl = "";

    switch (remoteInfo.provider) {
      case "github":
        prListUrl = `https://github.com/${remoteInfo.owner}/${remoteInfo.repo}/pulls`;
        break;
      case "gitlab":
        prListUrl = `https://gitlab.com/${remoteInfo.owner}/${remoteInfo.repo}/-/merge_requests`;
        break;
      case "bitbucket":
        prListUrl = `https://bitbucket.org/${remoteInfo.owner}/${remoteInfo.repo}/pull-requests/`;
        break;
    }

    console.log(chalk.cyan("\n📋 PR 목록 페이지를 여는 중...\n"));
    await openBrowser(prListUrl);
    console.log(chalk.green("✅ 브라우저에서 PR 목록을 열었습니다!"));
  } catch (error: any) {
    console.error(chalk.red(`❌ PR 목록 열기 실패: ${error.message}`));
  }
}

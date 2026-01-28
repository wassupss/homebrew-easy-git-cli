import fs from "fs";
import path from "path";
import os from "os";
import https from "https";
import chalk from "chalk";
import boxen from "boxen";

interface VersionCache {
  lastChecked: number;
  latestVersion: string;
}

export class VersionService {
  private packageVersion: string;
  private cachePath: string;
  private cacheValidityMs = 1000 * 60 * 60 * 24; // 24시간

  constructor() {
    // package.json에서 현재 버전 읽기
    const packageJsonPath = path.join(__dirname, "../../package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    this.packageVersion = packageJson.version;

    // 캐시 경로 설정
    const homeDir = os.homedir();
    const configDir = path.join(homeDir, ".easy-git");
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    this.cachePath = path.join(configDir, "version-cache.json");
  }

  /**
   * 현재 설치된 버전을 반환
   */
  getCurrentVersion(): string {
    return this.packageVersion;
  }

  /**
   * npm에서 최신 버전을 가져옴
   */
  private async fetchLatestVersion(): Promise<string> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: "registry.npmjs.org",
        path: "/@wassupsong/easy-git-cli/latest",
        method: "GET",
        headers: {
          "User-Agent": "easy-git-cli",
        },
      };

      https
        .get(options, (res) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            try {
              const parsed = JSON.parse(data);
              resolve(parsed.version);
            } catch (error) {
              reject(error);
            }
          });
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  }

  /**
   * 캐시에서 버전 정보 읽기
   */
  private readCache(): VersionCache | null {
    try {
      if (fs.existsSync(this.cachePath)) {
        const data = fs.readFileSync(this.cachePath, "utf-8");
        return JSON.parse(data);
      }
    } catch (error) {
      // 캐시 읽기 실패 시 null 반환
    }
    return null;
  }

  /**
   * 캐시에 버전 정보 저장
   */
  private writeCache(version: string): void {
    try {
      const cache: VersionCache = {
        lastChecked: Date.now(),
        latestVersion: version,
      };
      fs.writeFileSync(this.cachePath, JSON.stringify(cache, null, 2), "utf-8");
    } catch (error) {
      // 캐시 쓰기 실패는 무시
    }
  }

  /**
   * 최신 버전을 확인 (캐시 사용)
   */
  async getLatestVersion(): Promise<string | null> {
    const cache = this.readCache();

    // 캐시가 유효한 경우
    if (cache && Date.now() - cache.lastChecked < this.cacheValidityMs) {
      return cache.latestVersion;
    }

    // 캐시가 없거나 만료된 경우 새로 가져오기
    try {
      const latestVersion = await this.fetchLatestVersion();
      this.writeCache(latestVersion);
      return latestVersion;
    } catch (error) {
      // 네트워크 오류 시 캐시된 버전 반환 (있다면)
      return cache ? cache.latestVersion : null;
    }
  }

  /**
   * 버전 비교 (semver 간단 구현)
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split(".").map(Number);
    const parts2 = v2.split(".").map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }

    return 0;
  }

  /**
   * 업데이트가 필요한지 확인
   */
  async checkForUpdates(): Promise<{
    updateAvailable: boolean;
    currentVersion: string;
    latestVersion: string | null;
  }> {
    const currentVersion = this.getCurrentVersion();
    const latestVersion = await this.getLatestVersion();

    if (!latestVersion) {
      return {
        updateAvailable: false,
        currentVersion,
        latestVersion: null,
      };
    }

    const updateAvailable =
      this.compareVersions(latestVersion, currentVersion) > 0;

    return {
      updateAvailable,
      currentVersion,
      latestVersion,
    };
  }

  /**
   * 업데이트 알림 메시지 표시
   */
  async showUpdateNotification(): Promise<void> {
    try {
      const { updateAvailable, currentVersion, latestVersion } =
        await this.checkForUpdates();

      if (updateAvailable && latestVersion) {
        const message =
          chalk.yellow.bold("🎉 새로운 버전이 출시되었습니다!\n\n") +
          chalk.white(`현재 버전: ${chalk.red(currentVersion)}\n`) +
          chalk.white(`최신 버전: ${chalk.green.bold(latestVersion)}\n\n`) +
          chalk.gray("업데이트 방법:\n") +
          chalk.cyan("  npm install -g @wassupsong/easy-git-cli\n") +
          chalk.gray("또는\n") +
          chalk.cyan("  brew upgrade easy-git");

        const updateBox = boxen(message, {
          padding: 1,
          margin: 1,
          borderStyle: "round",
          borderColor: "yellow",
          align: "center",
        });

        console.log(updateBox);
      }
    } catch (error) {
      // 업데이트 확인 실패는 조용히 무시
    }
  }

  /**
   * 버전 정보 표시
   */
  displayVersion(): void {
    const currentVersion = this.getCurrentVersion();
    console.log(chalk.cyan.bold(`\n📦 Easy Git CLI`));
    console.log(chalk.white(`버전: ${chalk.green(currentVersion)}`));
    console.log(
      chalk.gray(
        `Repository: https://github.com/wassupss/homebrew-easy-git-cli\n`
      )
    );
  }
}

export const versionService = new VersionService();

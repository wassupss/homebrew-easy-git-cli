class EasyGit < Formula
  desc "Interactive CLI tool to make Git easier to use with multi-language support"
  homepage "https://github.com/wassupss/homebrew-easy-git-cli"
  url "https://registry.npmjs.org/@wassupsong/easy-git-cli/-/easy-git-cli-1.2.1.tgz"
  sha256 "96a0851bf7331a6fb689bfa218157d31d8f6972a9d45025010e4c63fc70ffc68"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    system "#{bin}/easy-git", "--version"
  end
end

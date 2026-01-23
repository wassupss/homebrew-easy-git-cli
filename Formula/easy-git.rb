class EasyGit < Formula
  desc "Interactive CLI tool to make Git easier to use with multi-language support"
  homepage "https://github.com/wassupss/easy-git-cli"
  url "https://registry.npmjs.org/@wassupsong/easy-git-cli/-/easy-git-cli-1.1.2.tgz"
  sha256 "01bb1d16fe96d86a993ad08226985c20487e1b318ea28cf7c92d527621f44a9f"
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

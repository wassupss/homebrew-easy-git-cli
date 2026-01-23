class EasyGit < Formula
  desc "Interactive CLI tool to make Git easier to use with multi-language support"
  homepage "https://github.com/wassupss/easy-git-cli"
  url "https://registry.npmjs.org/@wassupsong/easy-git-cli/-/easy-git-cli-1.1.0.tgz"
  sha256 "7165302b3517ae68889523be39617472c53a86a38a2e38ac6e5a7f7a5a2e4837"
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

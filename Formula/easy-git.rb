class EasyGit < Formula
  desc "Interactive CLI tool to make Git easier to use with multi-language support"
  homepage "https://github.com/wassupss/homebrew-easy-git-cli"
  url "https://registry.npmjs.org/@wassupsong/easy-git-cli/-/easy-git-cli-1.3.0.tgz"
  sha256 "c68944b21f3ce6777530362d3b2c3543a766f66bf935bf891a347ec579c7aa90"
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

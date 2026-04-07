class EasyGit < Formula
  desc "Interactive CLI tool to make Git easier to use with multi-language support"
  homepage "https://github.com/wassupss/homebrew-easy-git-cli"
  url "https://registry.npmjs.org/@wassupsong/easy-git-cli/-/easy-git-cli-1.6.2.tgz"
  sha256 "6a0107402732894cd248ee7478ed0e2f178d65b0c6cfec17d27ac6dae0d3206f"
  license "MIT"

  depends_on "node" => :build

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink Dir["#{libexec}/bin/*"]

    # Use env node so nvm/fnm/volta users don't need brew's node at runtime
    Dir["#{libexec}/bin/*"].each do |f|
      next unless File.file?(f) && File.read(f, 64).start_with?("#!")
      inreplace f, %r{^#!.*/node$}, "#!/usr/bin/env node"
    end
  end

  test do
    system "#{bin}/easy-git", "--version"
  end
end

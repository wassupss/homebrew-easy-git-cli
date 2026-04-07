class EasyGit < Formula
  desc "Interactive CLI tool to make Git easier to use with multi-language support"
  homepage "https://github.com/wassupss/homebrew-easy-git-cli"
  url "https://registry.npmjs.org/@wassupsong/easy-git-cli/-/easy-git-cli-1.6.3.tgz"
  sha256 "d989903f01471278085edb7f809e4446d014b4e3f5f9f33fb0074f755e6284a3"
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

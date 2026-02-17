{
  description = "Calorie Tracker (Astro + Prisma + SQLite)";

  nixConfig = {
    extra-substituters = [
      "https://cache.garnix.io"
    ];
    extra-trusted-public-keys = [
      "cache.garnix.io:CTFPyKSLcx5RMJKfLo5EEPUObbA78b0YQ2DTCJXqr9g="
    ];
  };

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
        playwrightBrowsers = pkgs.playwright-driver.browsers;
        playwrightBrowserRevisions = builtins.fromJSON (
          builtins.readFile "${pkgs.playwright-driver}/browsers.json"
        );
        chromiumRevision =
          (builtins.head (
            builtins.filter (browser: browser.name == "chromium") playwrightBrowserRevisions.browsers
          )).revision;
        playwrightLibs = with pkgs; [
          alsa-lib
          atk
          at-spi2-atk
          at-spi2-core
          cairo
          cups
          dbus
          expat
          glib
          gtk3
          libdrm
          libxkbcommon
          mesa
          nspr
          nss
          pango
          udev
          libx11
          libxcomposite
          libxdamage
          libxext
          libxfixes
          libxrandr
          libxcb
        ];
      in
      {
        devShells.default = pkgs.mkShell {
          packages =
            with pkgs;
            [
              nodejs_22
              sqlite
              openssl
              pkg-config
              prisma-engines
            ]
            ++ playwrightLibs;

          LD_LIBRARY_PATH = "${pkgs.lib.makeLibraryPath playwrightLibs}:$LD_LIBRARY_PATH";

          PRISMA_FMT_BINARY = "${pkgs.prisma-engines}/bin/prisma-fmt";
          PRISMA_SCHEMA_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/schema-engine";
          PRISMA_QUERY_ENGINE_LIBRARY = "${pkgs.prisma-engines}/lib/libquery_engine.node";
          PRISMA_QUERY_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/query-engine";

          shellHook = ''
            export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
            export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
            export PLAYWRIGHT_BROWSERS_PATH="${playwrightBrowsers}"
            export PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH="${playwrightBrowsers}/chromium-${chromiumRevision}/chrome-linux/chrome"

            if [ ! -f .env ] && [ -f .env.example ]; then
              cp .env.example .env
              echo "Created .env from .env.example"
            fi
          '';
        };

        apps.dev = {
          type = "app";
          program = toString (
            pkgs.writeShellScript "calorie-tracker-dev" ''
              exec ${pkgs.nodejs_22}/bin/npm run dev
            ''
          );
        };

        apps.build = {
          type = "app";
          program = toString (
            pkgs.writeShellScript "calorie-tracker-build" ''
              exec ${pkgs.nodejs_22}/bin/npm run build
            ''
          );
        };
      }
    );
}

{
  description = "Calorie Tracker (Astro + Prisma + SQLite)";

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
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_22
            sqlite
            openssl
            pkg-config
            prisma-engines
          ];

          PRISMA_FMT_BINARY = "${pkgs.prisma-engines}/bin/prisma-fmt";
          PRISMA_SCHEMA_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/schema-engine";
          PRISMA_QUERY_ENGINE_LIBRARY = "${pkgs.prisma-engines}/lib/libquery_engine.node";
          PRISMA_QUERY_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/query-engine";

          shellHook = ''
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

# Plan 01: Nix 開発環境構築

## 目的

Docker を廃止し、Nix devShell で再現可能な開発環境を構築する。

---

## 変更ファイル

| ファイル | 変更種別 |
|---------|---------|
| `flake.nix` | 新規作成（プロジェクトルート） |
| `.envrc` | 新規作成（direnv 連携） |
| `docker/Dockerfile` | 削除 |
| `docker/docker-compose.yml` | 削除 |

---

## 実装内容

### `flake.nix`

```nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = nixpkgs.legacyPackages.${system}; in {
        devShells.default = pkgs.mkShell {
          packages = [
            pkgs.nodejs_20
            pkgs.nodePackages.npm
          ];
        };
      });
}
```

`wrangler` は npm devDependencies で管理する（Nix には入れない）。

### `.envrc`

```
use flake
```

direnv がインストールされていれば `cd` で自動的に devShell に入る。

---

## 検証

```sh
nix develop         # devShell に入れること
node --version      # v20.x が表示されること
npm --version       # npm が使えること
```

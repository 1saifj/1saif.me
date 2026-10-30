# Anti-slop provenance

- Source: bundled install-anti-slop skill asset, copied from its `assets/anti-slop` folder.
- Source commit: unknown; the skill bundle does not expose a repository revision for the generic anti-slop rules.
- Installed tree digest: 74a4d5d2854d6a55bfcc3e874b56ac04333e0c10c94cf43e7ecc71a08d607392 (SHA-256 over sorted file hashes, excluding this provenance file).
- Oxlint compatibility: oxlint@1.82.0 with @oxlint/plugins@1.82.0.
- Configuration: repository root .oxlintrc.json; command npm run lint:oxlint.
- Scope: generic anti-slop rules are enabled at error severity. The optional Effect rules are intentionally not registered because this repository has no direct effect dependency.
- Local deviation: the vendored plugin and its dependencies are ignored by application lint through tools/oxlint/anti-slop/**; the repository retains its existing ESLint command separately.

The nested vendor/eslint-stylistic/UPSTREAM.md records the exact upstream commit for the vendored padding rule and remains authoritative for that dependency.

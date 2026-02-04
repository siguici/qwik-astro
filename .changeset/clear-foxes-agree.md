---
"@qwikdev/create-astro": patch
"@qwikdev/astro": patch
---

Fix unresolved module handling and update build tooling

### Fixes
- Return `null` instead of throwing on unresolved modules in `resolveId`

### Chore
- Migrate build tooling from `tsup` to `tsdown`

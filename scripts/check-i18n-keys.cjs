/* Static i18n key check — catches mistyped/missing t() keys at build/CI time,
   independent of the (DEV-only) runtime missingKeyHandler. The render verifier
   (verify.cjs) runs the production preview build where that handler is compiled
   out, so this is the guard that actually fails on a bad key.

   Usage:  node scripts/check-i18n-keys.cjs   (exit 1 if any literal key is missing)
   Scans src/ for t('literal.key') / t("literal.key") and i18n.t('...') and
   verifies each exists in src/locales/ar.json (plural keys resolve via their
   <base>_one/_other variants). Dynamic t(`...${x}`) keys are reported + skipped. */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const AR = path.join(ROOT, 'src', 'locales', 'ar.json')
const SRC = path.join(ROOT, 'src')

const ar = JSON.parse(fs.readFileSync(AR, 'utf8'))
const leaves = new Set()
;(function walk(o, prefix) {
  for (const k of Object.keys(o)) {
    const key = prefix ? prefix + '.' + k : k
    if (o[k] && typeof o[k] === 'object') walk(o[k], key)
    else leaves.add(key)
  }
})(ar, '')

const PLURAL = /_(zero|one|two|few|many|other)$/
const pluralBases = new Set()
for (const k of leaves) if (PLURAL.test(k)) pluralBases.add(k.replace(PLURAL, ''))

const files = []
;(function rec(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) rec(p)
    else if (/\.tsx?$/.test(e.name)) files.push(p)
  }
})(SRC)

const T_LITERAL = /\bt\(\s*['"]([^'"]+)['"]/g
const T_DYNAMIC = /\bt\(\s*`/g
const missing = []
let dynamic = 0
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8')
  let m
  while ((m = T_LITERAL.exec(src))) {
    const key = m[1]
    // Only real key shapes (word chars + dots) — skips comment placeholders like t('<namespace>.<key>').
    if (!/^[A-Za-z0-9_.]+$/.test(key)) continue
    if (!leaves.has(key) && !pluralBases.has(key)) missing.push({ file: path.relative(ROOT, f), key })
  }
  const d = src.match(T_DYNAMIC)
  if (d) dynamic += d.length
}

console.log(`i18n key check: ${files.length} source files, ${leaves.size} keys in ar.json, ${dynamic} dynamic t(\`…\`) call(s) skipped.`)
if (missing.length) {
  console.error(`\n✗ ${missing.length} missing key(s):`)
  for (const x of missing) console.error(`  ${x.file}: t('${x.key}')`)
  process.exit(1)
}
console.log('✓ all literal t() keys resolve in ar.json')

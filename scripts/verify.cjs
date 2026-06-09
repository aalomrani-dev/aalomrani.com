/* Headless render verification for the Knowledge Platform app.
   Usage:  node scripts/verify.cjs '<json-config>'
   config = { base?: "http://localhost:4173",
              scenarios: [{ name, path, theme?: "light"|"dark", auth?: 0|1, role?: "user"|"owner" }] }
   For each scenario: sets kp-theme / kp-auth / kp-role in localStorage BEFORE load,
   emulates prefers-reduced-motion:reduce (so scroll-reveal content is visible),
   navigates, asserts ZERO console errors / pageerrors, screenshots fullPage.
   Exits non-zero if any scenario logs an error. */
const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')

const cfg = JSON.parse(process.argv[2] || '{}')
const BASE = cfg.base || 'http://localhost:4173'
const scenarios = cfg.scenarios || []
const SHOTS = path.join(__dirname, 'shots')
fs.mkdirSync(SHOTS, { recursive: true })

;(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] })
  let failures = 0
  const summary = []

  for (const s of scenarios) {
    const page = await browser.newPage()
    await page.setViewport({ width: s.width || 1280, height: s.height || 900, deviceScaleFactor: 1 })
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])

    const errors = []
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console.error: ' + m.text()) })
    page.on('pageerror', (e) => errors.push('pageerror: ' + (e && e.message ? e.message : String(e))))
    page.on('requestfailed', (r) => {
      const u = r.url()
      // ignore external placeholder images (unsplash) failing offline — they aren't app errors
      if (/^https?:\/\/(images\.unsplash|via\.placeholder)/.test(u)) return
      errors.push('requestfailed: ' + u + ' — ' + (r.failure() ? r.failure().errorText : ''))
    })

    const theme = s.theme || 'light'
    const auth = s.auth ? '1' : null
    const role = s.role || null
    await page.evaluateOnNewDocument((theme, auth, role) => {
      try {
        localStorage.setItem('kp-theme', theme)
        if (auth) localStorage.setItem('kp-auth', auth); else localStorage.removeItem('kp-auth')
        if (role) localStorage.setItem('kp-role', role); else localStorage.removeItem('kp-role')
      } catch (e) {}
    }, theme, auth, role)

    const url = BASE + (s.path || '/')
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
      await new Promise((r) => setTimeout(r, 450)) // let mount + any effects settle
    } catch (e) {
      errors.push('navigation: ' + e.message)
    }

    const shot = path.join(SHOTS, (s.name || s.path || 'screen').replace(/[^\w.-]+/g, '_') + '.png')
    try { await page.screenshot({ path: shot, fullPage: true }) } catch (e) { errors.push('screenshot: ' + e.message) }

    const ok = errors.length === 0
    if (!ok) failures++
    summary.push({ name: s.name, url, theme, auth: !!s.auth, role, ok, errors })
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${s.name.padEnd(28)} ${theme}${s.auth ? '/auth' : '/guest'}${role ? '/' + role : ''}  -> ${path.basename(shot)}`)
    for (const er of errors) console.log('      ! ' + er)
    await page.close()
  }

  await browser.close()
  console.log(`\n${summary.length - failures}/${summary.length} scenarios clean`)
  process.exit(failures ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(2) })

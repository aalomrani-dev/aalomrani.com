/* Responsiveness audit for the Knowledge Platform app (RTL, Arabic-first).
   Usage:  node scripts/responsive-check.cjs '<json-config>'
   config = {
     base?: "http://localhost:4173",
     outDir?: "resp",                       // subdir under scripts/shots/
     widths?: [320, 375, 768, 1280, 1920],  // viewport widths to sweep
     height?: 900,
     themes?: ["light"],                    // ["light","dark"]
     failOnOffenders?: true,                // default true; set false to gate only on doc-overflow/errors
     routes: [
       { name, path, auth?: 0|1, role?: "user"|"owner" }
     ]
   }
   For every route × width × theme it: sets kp-theme/kp-auth/kp-role BEFORE load,
   emulates prefers-reduced-motion:reduce, navigates, settles, then runs layout
   checks and screenshots fullPage. Because the site is FULL RTL, the primary
   signal is horizontal overflow (scrollWidth > innerWidth); we ALSO flag any
   VISIBLE, un-clipped element whose box pokes past an inline edge (a cut-off the
   document doesn't scroll for — e.g. clipped by body overflow-x:hidden).
   Exits non-zero on any CRITICAL issue: doc overflow, an off-edge element
   (unless failOnOffenders:false), or a console/page error. */
const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')

const cfg = JSON.parse(process.argv[2] || '{}')
const BASE = cfg.base || 'http://localhost:4173'
const WIDTHS = cfg.widths || [320, 375, 768, 1280, 1920]
const HEIGHT = cfg.height || 900
const THEMES = cfg.themes || ['light']
const ROUTES = cfg.routes || []
const FAIL_ON_OFFENDERS = cfg.failOnOffenders !== false // default true
const SHOTS = path.join(__dirname, 'shots', cfg.outDir || 'resp')
fs.mkdirSync(SHOTS, { recursive: true })

// In-page layout probe. Returns overflow info + flagged elements + tap targets.
function probe(isMobile) {
  const docW = document.documentElement.scrollWidth
  const innerW = window.innerWidth
  const overflowPx = docW - innerW
  const hasHOverflow = overflowPx > 1

  // Is the element visually clipped by an ancestor before it reaches the viewport
  // edge? (decorative blobs, popovers, ken-burns images all live inside
  // overflow-hidden parents and only LOOK like overflow.) If so it is not a real
  // horizontal-scroll bug — skip it to cut false positives.
  function clippedByAncestor(node) {
    let p = node.parentElement
    while (p && p !== document.body) {
      const ps = getComputedStyle(p)
      if (/(hidden|clip)/.test(ps.overflowX) || /(hidden|clip)/.test(ps.overflow)) {
        const pr = p.getBoundingClientRect()
        // ancestor clips on the right before the viewport edge, and on the left at/after 0
        if (pr.right <= innerW + 1 && pr.left >= -1) return true
      }
      p = p.parentElement
    }
    return false
  }

  // Invisible because the element OR an ancestor is opacity:0 / visibility:hidden
  // / display:none — e.g. a closed popover or hover-tooltip still in the DOM.
  // It paints nothing, so it can't be a visible overflow. Skip the whole subtree.
  function invisible(node) {
    let p = node
    while (p && p !== document.body) {
      const s = getComputedStyle(p)
      if (s.opacity === '0' || s.visibility === 'hidden' || s.display === 'none') return true
      p = p.parentElement
    }
    return false
  }

  // Elements whose box extends past either inline edge of the viewport.
  const offenders = []
  const seen = new Set()
  const all = document.querySelectorAll('body *')
  for (const el of all) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue
    const style = getComputedStyle(el)
    if (style.position === 'fixed' || invisible(el)) continue
    const pastRight = r.right - innerW   // overflow on the visual right
    const pastLeft = -r.left             // overflow on the visual left
    if ((pastRight > 1 || pastLeft > 1) && !clippedByAncestor(el)) {
      const sel =
        el.tagName.toLowerCase() +
        (el.id ? '#' + el.id : '') +
        (el.className && typeof el.className === 'string'
          ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.')
          : '')
      const key = sel + '|' + Math.round(r.left) + '|' + Math.round(r.right)
      if (seen.has(key)) continue
      seen.add(key)
      offenders.push({
        sel,
        text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40),
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
        pastRight: Math.round(Math.max(0, pastRight)),
        pastLeft: Math.round(Math.max(0, pastLeft)),
      })
    }
  }
  // Keep the worst few to keep the report readable.
  offenders.sort((a, b) => (b.pastRight + b.pastLeft) - (a.pastRight + a.pastLeft))

  // Tap targets that are too small on mobile (sub-32px in either axis).
  const tinyTargets = []
  if (isMobile) {
    const interactive = document.querySelectorAll('a, button, [role="button"], input, select')
    for (const el of interactive) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      if (r.height < 32 || r.width < 24) {
        tinyTargets.push({
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 24),
          w: Math.round(r.width),
          h: Math.round(r.height),
        })
      }
    }
  }

  return { docW, innerW, overflowPx: Math.round(overflowPx), hasHOverflow, offenders: offenders.slice(0, 8), tinyTargets: tinyTargets.slice(0, 8) }
}

;(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] })
  let critical = 0
  const report = []

  for (const route of ROUTES) {
    for (const theme of THEMES) {
      for (const width of WIDTHS) {
        const isMobile = width <= 480
        const page = await browser.newPage()
        await page.setViewport({ width, height: HEIGHT, deviceScaleFactor: 1 })
        await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])

        const errors = []
        page.on('console', (m) => { if (m.type() === 'error') errors.push('console.error: ' + m.text()) })
        page.on('pageerror', (e) => errors.push('pageerror: ' + (e && e.message ? e.message : String(e))))
        page.on('requestfailed', (r) => {
          const u = r.url()
          if (/^https?:\/\/(images\.unsplash|via\.placeholder)/.test(u)) return
          errors.push('requestfailed: ' + u + ' — ' + (r.failure() ? r.failure().errorText : ''))
        })

        const auth = route.auth ? '1' : null
        const role = route.role || null
        await page.evaluateOnNewDocument((theme, auth, role) => {
          try {
            localStorage.setItem('kp-theme', theme)
            if (auth) localStorage.setItem('kp-auth', auth); else localStorage.removeItem('kp-auth')
            if (role) localStorage.setItem('kp-role', role); else localStorage.removeItem('kp-role')
          } catch (e) {}
        }, theme, auth, role)

        const url = BASE + (route.path || '/')
        let probeResult = null
        try {
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
          await new Promise((r) => setTimeout(r, 400))
          probeResult = await page.evaluate(probe, isMobile)
        } catch (e) {
          errors.push('navigation: ' + e.message)
        }

        const tag = `${(route.name || route.path).replace(/[^\w.-]+/g, '_')}-${theme}-${width}`
        const shot = path.join(SHOTS, tag + '.png')
        try { await page.screenshot({ path: shot, fullPage: true }) } catch (e) { errors.push('screenshot: ' + e.message) }

        const overflow = probeResult ? probeResult.hasHOverflow : false
        const offenderCount = probeResult ? probeResult.offenders.length : 0
        const isCritical = errors.length > 0 || overflow || (FAIL_ON_OFFENDERS && offenderCount > 0)
        if (isCritical) critical++

        const rec = {
          route: route.name || route.path,
          path: route.path,
          theme,
          width,
          auth: !!route.auth,
          role,
          shot: path.relative(path.join(__dirname, '..'), shot),
          overflowPx: probeResult ? probeResult.overflowPx : null,
          hasHOverflow: overflow,
          offenders: probeResult ? probeResult.offenders : [],
          tinyTargets: probeResult ? probeResult.tinyTargets : [],
          errors,
        }
        report.push(rec)

        const flag = isCritical ? 'FAIL' : 'ok  '
        let line = `${flag} ${String(width).padStart(4)}px ${theme.padEnd(5)} ${(route.name || route.path).padEnd(20)}`
        if (overflow) line += `  HOVERFLOW +${rec.overflowPx}px`
        if (errors.length) line += `  ${errors.length} err`
        if (rec.offenders.length) line += `  ${rec.offenders.length} offender(s)`
        if (rec.tinyTargets.length) line += `  ${rec.tinyTargets.length} tiny-tap`
        console.log(line)
        for (const o of rec.offenders) console.log(`        ↳ ${o.sel}  [${o.left}..${o.right}] +R${o.pastRight}/+L${o.pastLeft}  "${o.text}"`)
        for (const er of errors) console.log(`        ! ${er}`)
        await page.close()
      }
    }
  }

  await browser.close()
  const clean = report.length - critical
  console.log(`\n${clean}/${report.length} clean · ${critical} with critical issues (overflow / off-edge element / errors)`)
  console.log(`Screenshots: ${path.relative(path.join(__dirname, '..'), SHOTS)}/`)
  // Machine-readable block for easy parsing.
  console.log('\n===JSON===')
  console.log(JSON.stringify({ base: BASE, total: report.length, critical, report }, null, 0))
  process.exit(critical ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(2) })

import type { MouseEvent } from 'react'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Reveal } from '@/components/ui/Reveal'
import { Button } from '@/components/ui/Button'
import { CountUp } from '@/components/ui/CountUp'
import { STATS } from '@/data/content'
import heroImg from '@/assets/hero.webp'

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function Hero() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const cardRef = useRef<HTMLDivElement>(null)

  // Pointer parallax: stash a normalized -0.5..0.5 cursor offset on the card as CSS
  // vars; the decorative layers read it and drift at different rates for depth. This
  // writes to .style directly (no re-render), is pointer-only (no-op on touch), and
  // is skipped entirely under reduced-motion.
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el || prefersReduced()) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--hx', String((e.clientX - r.left) / r.width - 0.5))
    el.style.setProperty('--hy', String((e.clientY - r.top) / r.height - 0.5))
  }
  const onLeave = () => {
    const el = cardRef.current
    if (!el) return
    el.style.setProperty('--hx', '0')
    el.style.setProperty('--hy', '0')
  }

  return (
    <section className="max-w-[1280px] mx-auto px-4 md:px-8 pt-6">
      <div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-line bg-surface grid lg:grid-cols-2"
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        {/* mint blob — deepest parallax layer */}
        <span
          aria-hidden="true"
          className="absolute -bottom-16 w-64 h-64 rounded-full pointer-events-none z-0"
          style={{
            insetInlineStart: -40,
            background: 'radial-gradient(circle, var(--surface-tint), transparent 70%)',
            transform: 'translate3d(calc(var(--hx, 0) * -34px), calc(var(--hy, 0) * -26px), 0)',
            transition: 'transform .4s var(--ease-out)',
          }}
        />

        {/* text */}
        <div
          className="relative z-[1] overflow-hidden flex flex-col justify-center p-8 md:p-12 order-2 lg:order-1"
          style={{ background: 'linear-gradient(180deg, var(--surface-tint), var(--surface-card) 60%)' }}
        >
          {/* breathing aurora glow — behind the welcome text */}
          <span
            aria-hidden="true"
            className="kp-hero-aura absolute z-0 pointer-events-none"
            style={{
              insetInlineStart: '6%',
              top: '10%',
              width: 340,
              height: 340,
              background:
                'radial-gradient(circle, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%)',
              filter: 'blur(42px)',
            }}
          />
          {/* dotted texture (parallax wrapper + gentle drift) — behind the welcome text */}
          <span
            aria-hidden="true"
            className="absolute top-7 z-0 pointer-events-none"
            style={{
              insetInlineStart: 28,
              transform: 'translate3d(calc(var(--hx, 0) * -18px), calc(var(--hy, 0) * -12px), 0)',
              transition: 'transform .4s var(--ease-out)',
            }}
          >
            <span
              className="kp-dots-drift block w-32 h-24"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, var(--accent-soft) 1.6px, transparent 0)',
                backgroundSize: '14px 14px',
                opacity: 0.55,
              }}
            />
          </span>

          {/* content — above the decorations */}
          <div className="relative z-[1]">
            <Reveal>
              <h1 className="font-display font-black text-strong leading-[1.25]" style={{ fontSize: 'clamp(1.9rem, 3.4vw, 2.7rem)' }}>
                {t('home.hero.titleLine1')}
                <br />
                <span style={{ color: 'var(--accent-strong)' }}>{t('home.hero.titleHighlight')}</span>
              </h1>
            </Reveal>
            <Reveal delay={100}>
              <p className="mt-5 text-body leading-relaxed" style={{ maxWidth: '46ch' }}>
                {t('home.hero.subtitle')}
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button icon="bookOpen" onClick={() => navigate('/library')}>
                  {t('home.hero.ctaBrowse')}
                </Button>
                <Button variant="secondary" onClick={() => navigate('/about')}>
                  {t('home.hero.ctaAbout')}
                </Button>
              </div>
            </Reveal>
            <Reveal delay={260}>
              <div className="mt-9 flex flex-wrap gap-x-8 gap-y-4 pt-6 border-t border-line">
                {STATS.map((s) => (
                  <div key={s.key} className="min-w-[88px]">
                    <div className="font-display font-black text-strong text-2xl tnum">
                      <CountUp to={s.value} suffix={s.suffix} />
                    </div>
                    <div className="text-[12px] text-muted mt-0.5 leading-snug max-w-[16ch]">{t(`stats.${s.key}.label`)}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        {/* image */}
        <div className="relative min-h-[260px] lg:min-h-[460px] order-1 lg:order-2 overflow-hidden bg-tint">
          <img src={heroImg} alt={t('a11y.heroImageAlt')} fetchPriority="high" width={1280} height={960} className="kp-kenburns absolute inset-0 w-full h-full object-cover" />
          <span
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to right, transparent 76%, color-mix(in srgb, var(--surface-card) 72%, transparent))' }}
          />
        </div>
      </div>
    </section>
  )
}

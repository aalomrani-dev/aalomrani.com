import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Reveal } from '@/components/ui/Reveal'
import { Button } from '@/components/ui/Button'
import { CountUp } from '@/components/ui/CountUp'
import { STATS } from '@/data/content'
import heroImg from '@/assets/hero.webp'

export function Hero() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  return (
    <section className="max-w-[1280px] mx-auto px-4 md:px-8 pt-6">
      <div
        className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-line bg-surface grid lg:grid-cols-2"
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        {/* dotted decoration (gentle drift) */}
        <span
          aria-hidden="true"
          className="kp-dots-drift absolute top-5 z-10 w-28 h-20 pointer-events-none"
          style={{
            insetInlineStart: 20,
            backgroundImage: 'radial-gradient(circle at 1px 1px, var(--accent-soft) 1.6px, transparent 0)',
            backgroundSize: '14px 14px',
            opacity: 0.7,
          }}
        />
        {/* mint blob */}
        <span
          aria-hidden="true"
          className="absolute -bottom-16 w-64 h-64 rounded-full pointer-events-none z-0"
          style={{ insetInlineStart: -40, background: 'radial-gradient(circle, var(--surface-tint), transparent 70%)' }}
        />

        {/* text */}
        <div
          className="relative z-[1] flex flex-col justify-center p-8 md:p-12 order-2 lg:order-1"
          style={{ background: 'linear-gradient(180deg, var(--surface-tint), var(--surface-card) 60%)' }}
        >
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
              <Button icon="download" onClick={() => navigate('/download')}>
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

        {/* image */}
        <div className="relative min-h-[260px] lg:min-h-[460px] order-1 lg:order-2 overflow-hidden bg-tint">
          <img src={heroImg} alt={t('a11y.heroImageAlt')} className="kp-kenburns absolute inset-0 w-full h-full object-cover" />
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

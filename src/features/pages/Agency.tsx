import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/ui/Icon'
import { Reveal } from '@/components/ui/Reveal'
import { PageHero } from '@/components/layout/PageHero'
import { AGENCY_PILLARS } from '@/data/content'

export function Agency() {
  const { t } = useTranslation()
  return (
    <div>
      <PageHero
        eyebrow={t('agency.hero.eyebrow')}
        icon="target"
        title={t('agency.hero.title')}
        desc={t('agency.hero.desc')}
      />

      <div className="max-w-[1100px] mx-auto px-6 md:px-8 py-12 space-y-12">
        {/* mission block */}
        <Reveal>
          <div
            className="rounded-[var(--radius-xl)] bg-surface border border-line p-7 md:p-9"
            style={{ borderInlineStart: '4px solid var(--sec-agency)' }}
          >
            <h2 className="font-display font-bold text-strong text-2xl flex items-center gap-3">
              <span
                className="grid place-items-center w-11 h-11 rounded-[var(--radius-md)] shrink-0"
                style={{ background: 'var(--sec-agency-surface)', color: 'var(--sec-agency)' }}
              >
                <Icon name="target" size={22} />
              </span>
              {t('agency.roleHeading')}
            </h2>
            <p className="text-body leading-loose text-lg mt-5">{t('agency.body')}</p>
          </div>
        </Reveal>

        {/* vision strip */}
        <Reveal delay={80}>
          <div
            className="relative overflow-hidden rounded-[var(--radius-xl)] px-7 py-9 md:px-10 text-center"
            style={{ background: 'linear-gradient(135deg, var(--navy-800), var(--sec-agency))' }}
          >
            <span
              aria-hidden="true"
              className="absolute -top-16 w-64 h-64 rounded-full pointer-events-none"
              style={{ insetInlineEnd: -40, background: 'radial-gradient(circle, rgba(207,161,74,.35), transparent 70%)' }}
            />
            <span
              className="relative inline-flex items-center gap-2 text-sm font-semibold mb-3"
              style={{ color: 'var(--highlight)' }}
            >
              <Icon name="sparkles" size={16} />
              {t('agency.visionEyebrow')}
            </span>
            <p
              className="relative font-display font-bold text-2xl md:text-3xl leading-snug max-w-3xl mx-auto"
              style={{ color: 'var(--text-on-navy)' }}
            >
              {t('agency.vision')}
            </p>
          </div>
        </Reveal>

        {/* pillars */}
        <div>
          <Reveal>
            <h2 className="font-display font-bold text-strong text-2xl mb-6 text-center">{t('agency.pillarsHeading')}</h2>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AGENCY_PILLARS.map((p, i) => (
              <Reveal key={p.key} delay={i * 70} style={{ height: '100%' }}>
                <div className="h-full p-6 rounded-[var(--radius-lg)] bg-surface border border-line">
                  <span
                    className="grid place-items-center w-12 h-12 rounded-[var(--radius-md)] mb-4"
                    style={{ background: 'var(--sec-agency-surface)', color: 'var(--sec-agency)' }}
                  >
                    <Icon name={p.icon} size={24} />
                  </span>
                  <h3 className="font-display font-bold text-strong text-lg leading-snug">{t(`pillars.${p.key}.title`)}</h3>
                  <p className="text-sm text-muted mt-2 leading-relaxed">{t(`pillars.${p.key}.desc`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/ui/Icon'
import { Reveal } from '@/components/ui/Reveal'
import { PageHero } from '@/components/layout/PageHero'
import { DEPARTMENTS } from '@/data/content'

export function Departments() {
  const { t } = useTranslation()
  return (
    <div>
      <PageHero
        eyebrow={t('departments.hero.eyebrow')}
        icon="building"
        title={t('departments.hero.title')}
        desc={t('departments.hero.desc')}
      />

      <div className="max-w-[1240px] mx-auto px-6 md:px-8 py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEPARTMENTS.map((d, i) => (
            <Reveal key={d.key} delay={i * 70} style={{ height: '100%' }}>
              <div
                className="kp-tile group relative h-full p-6 rounded-[var(--radius-xl)] bg-surface border border-line overflow-hidden"
                style={{ '--accent': 'var(--sec-departments)' } as CSSProperties}
              >
                <span className="kp-tile-glow" />
                <span
                  className="grid place-items-center w-12 h-12 rounded-[var(--radius-md)] mb-4 transition-transform group-hover:scale-110"
                  style={{ background: 'var(--sec-departments-surface)', color: 'var(--sec-departments)' }}
                >
                  <Icon name={d.icon} size={24} />
                </span>
                <h3 className="font-display font-bold text-strong text-xl leading-snug">{t(`departments.${d.key}.name`)}</h3>
                <p className="text-sm text-muted mt-2 leading-relaxed">{t(`departments.${d.key}.desc`)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  )
}

import type { CSSProperties, MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Reveal } from '@/components/ui/Reveal'
import { Icon } from '@/components/ui/Icon'
import { useTranslation } from 'react-i18next'
import { SECTIONS } from '@/data/content'

export function FeatureCards() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const onMove = (e: MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <section className="max-w-[1280px] mx-auto px-4 md:px-8 mt-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SECTIONS.map((s, i) => (
          <Reveal key={s.key} delay={i * 60}>
            <button
              onMouseMove={onMove}
              onClick={() => navigate(s.route === 'home' ? '/' : '/' + s.route)}
              className="kp-tile group relative w-full h-full text-center overflow-hidden rounded-[var(--radius-lg)] bg-surface border border-line p-6 flex flex-col items-center"
              style={{ '--accent': `var(--sec-${s.accent})` } as CSSProperties}
            >
              <span className="kp-tile-glow" />
              <span
                className="grid place-items-center w-14 h-14 rounded-full mb-4 transition-transform group-hover:scale-110"
                style={{ background: `var(--sec-${s.accent}-surface)`, color: `var(--sec-${s.accent})` }}
              >
                <Icon name={s.icon} size={26} />
              </span>
              <span className="font-display font-bold text-strong text-[17px]">{t(`sections.${s.key}.title`)}</span>
              <span className="text-[13px] text-muted mt-2 leading-relaxed">{t(`sections.${s.key}.blurb`)}</span>
              <span className="mt-4 text-muted transition-transform group-hover:-translate-x-1">
                <Icon name="arrowLeft" size={20} />
              </span>
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { OWNER, ABOUT_HIGHLIGHTS } from '@/data/content'

export function About() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  return (
    <div className="max-w-[900px] mx-auto px-6 md:px-8 py-14">
      <Reveal className="flex flex-col items-center text-center">
        {/* Portrait placeholder — swap for an <img> when the agency provides a photo. */}
        <span
          className="grid place-items-center rounded-full text-white shadow-[var(--shadow-md)] overflow-hidden"
          style={{
            width: 140,
            height: 140,
            background: 'linear-gradient(135deg, var(--navy-700), var(--teal-600))',
            outline: '4px solid var(--surface-tint)',
          }}
        >
          {OWNER.photo ? (
            <img src={OWNER.photo} alt={t('owner.name')} className="w-full h-full object-cover" />
          ) : (
            <Icon name="user" size={56} />
          )}
        </span>
        <span className="mt-6 text-sm font-semibold text-accentStrong inline-flex items-center gap-2">
          <Icon name="user" size={16} />
          {t('about.eyebrow')}
        </span>
        <h1 className="font-display font-bold text-strong text-4xl mt-2">{t('owner.name')}</h1>
        <p className="text-muted mt-2">{t('owner.role')}</p>
      </Reveal>

      <Reveal delay={120} className="mt-10 space-y-5 text-body leading-relaxed text-lg">
        <p>{t('owner.bio1')}</p>
        <p>{t('owner.bio2')}</p>
      </Reveal>

      <Reveal delay={200} className="mt-10 grid gap-4 sm:grid-cols-3">
        {ABOUT_HIGHLIGHTS.map((h) => (
          <div key={h.key} className="p-5 rounded-[var(--radius-lg)] bg-surface border border-line text-center">
            <span className="grid place-items-center w-11 h-11 rounded-[var(--radius-md)] bg-tint text-accentStrong mx-auto mb-3">
              <Icon name={h.icon} size={22} />
            </span>
            <p className="font-semibold text-strong">{t(`highlights.${h.key}.title`)}</p>
            <p className="text-sm text-muted mt-1">{t(`highlights.${h.key}.sub`)}</p>
          </div>
        ))}
      </Reveal>

      <Reveal delay={280} className="mt-12 flex flex-wrap justify-center gap-3">
        <Button icon="bookOpen" onClick={() => navigate('/library')}>
          {t('about.browseLibraryCta')}
        </Button>
        <Button variant="secondary" icon="building" onClick={() => navigate('/departments')}>
          {t('about.departmentsCta')}
        </Button>
      </Reveal>
    </div>
  )
}

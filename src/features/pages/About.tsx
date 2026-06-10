import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { OWNER } from '@/data/content'

const INTERESTS = ['businessDev', 'processImprovement', 'digitalTransformation', 'knowledgeManagement', 'ai', 'institutionalDev'] as const
const CREDENTIALS = ['pmp', 'cbpai'] as const

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

      <Reveal delay={120} className="mt-10 text-body leading-relaxed text-lg">
        <p>{t('owner.bioFull')}</p>
      </Reveal>

      {/* مجالات الاهتمام */}
      <Reveal delay={200} className="mt-12">
        <h2 className="flex items-center gap-2.5 font-display font-bold text-strong text-xl">
          <span className="text-accentStrong"><Icon name="sparkles" size={20} /></span>
          {t('about.interestsHeading')}
        </h2>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {INTERESTS.map((k) => (
            <span
              key={k}
              className="inline-flex items-center gap-2 px-3.5 h-9 rounded-full bg-tint text-accentStrong text-sm font-medium border border-line"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
              {t(`about.interests.${k}`)}
            </span>
          ))}
        </div>
      </Reveal>

      {/* الاعتمادات المهنية */}
      <Reveal delay={260} className="mt-10">
        <h2 className="flex items-center gap-2.5 font-display font-bold text-strong text-xl">
          <span className="text-accentStrong"><Icon name="shield" size={20} /></span>
          {t('about.credentialsHeading')}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {CREDENTIALS.map((k) => (
            <div key={k} className="flex items-center gap-3 p-4 rounded-[var(--radius-lg)] bg-surface border border-line">
              <span className="grid place-items-center w-10 h-10 rounded-[var(--radius-md)] bg-tint text-accentStrong shrink-0">
                <Icon name="checkCircle" size={20} />
              </span>
              <span className="latin font-medium text-strong text-sm leading-snug" dir="ltr">
                {t(`about.credentials.${k}`)}
              </span>
            </div>
          ))}
        </div>
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

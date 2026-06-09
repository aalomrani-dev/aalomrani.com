import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Reveal } from '@/components/ui/Reveal'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'

interface PlaceholderProps {
  title: string
  icon?: IconName
  note?: string
}

/* Stand-in for routes whose full screens land in later phases (download,
   library, departments, about, agency) so navigation never dead-ends. */
export function Placeholder({ title, icon = 'sparkles', note }: PlaceholderProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  return (
    <section className="max-w-[880px] mx-auto px-4 md:px-8 py-20 text-center">
      <Reveal>
        <span className="inline-grid place-items-center w-16 h-16 rounded-full mb-5" style={{ background: 'var(--surface-tint)', color: 'var(--accent-strong)' }}>
          <Icon name={icon} size={30} />
        </span>
        <h1 className="font-display font-black text-strong text-3xl mb-3">{title}</h1>
        <p className="text-body leading-relaxed max-w-[48ch] mx-auto">{note ?? t('placeholder.defaultNote')}</p>
        <div className="mt-7 flex justify-center">
          <Button icon="arrowLeft" onClick={() => navigate('/')}>
            {t('common.backToHome')}
          </Button>
        </div>
      </Reveal>
    </section>
  )
}

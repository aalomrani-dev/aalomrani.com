import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { useLeadCapture } from '@/lib/leadCapture'
import { OWNER } from '@/data/content'

export function Footer() {
  const { t } = useTranslation()
  const { open } = useLeadCapture()
  return (
    <footer className="mt-20">
      <div className="relative overflow-hidden text-center px-6 py-7" style={{ background: 'var(--navy-800)' }}>
        <p className="inline-flex items-center gap-3 font-display font-medium text-lg" style={{ color: 'var(--text-on-navy)' }}>
          <Icon name="sparkles" size={20} style={{ color: 'var(--highlight)' }} />
          {t('footer.tagline')}
        </p>
        <div className="mt-5">
          <Button variant="sand" icon="download" onClick={open}>
            {t('footer.leadCta')}
          </Button>
        </div>
      </div>
      <div className="bg-app border-t border-line">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 py-4 flex items-center justify-between gap-x-6 gap-y-2 flex-wrap">
          <p className="text-xs text-faint latin" dir="ltr">© 2026 aalomrani . All Rights Reserved</p>
          <div className="inline-flex items-center gap-x-4 gap-y-2 flex-wrap">
            <a
              href={`mailto:${OWNER.email}`}
              aria-label={t('contact.heading')}
              className="text-xs text-faint inline-flex items-center gap-1.5 hover:text-strong transition"
            >
              <Icon name="mail" size={13} />
              {t('contact.heading')}
            </a>
            <span className="text-xs text-faint inline-flex items-center gap-1.5">
              <Icon name="sparkles" size={13} />
              {t('footer.qaAssistantSoon')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

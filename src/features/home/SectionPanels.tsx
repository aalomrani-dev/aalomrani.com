import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Reveal } from '@/components/ui/Reveal'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { FileTypeChip } from '@/components/ui/FileTypeChip'
import { SECTIONS, DEPARTMENTS, OWNER, type SectionDef } from '@/data/content'

function PanelShell({ s, children }: { s: SectionDef; children: ReactNode }) {
  const { t } = useTranslation()
  return (
    <div className="rounded-[var(--radius-lg)] bg-surface border border-line overflow-hidden h-full flex flex-col">
      <div className="flex items-center gap-2.5 px-5 py-3.5" style={{ background: `var(--sec-${s.accent}-surface)` }}>
        <Icon name={s.icon} size={20} style={{ color: `var(--sec-${s.accent})` }} />
        <h3 className="font-display font-bold" style={{ color: `var(--sec-${s.accent})` }}>
          {t(`sections.${s.key}.title`)}
        </h3>
      </div>
      <div className="p-5 flex flex-col flex-1">{children}</div>
    </div>
  )
}

function GoalNote({ accent, children }: { accent: string; children: ReactNode }) {
  const { t } = useTranslation()
  return (
    <div className="mt-4 pt-4 border-t border-line">
      <p className="flex items-start gap-2 text-[13px] text-muted leading-relaxed">
        <span style={{ color: `var(--sec-${accent})` }} className="mt-0.5 shrink-0">
          <Icon name="target" size={15} />
        </span>
        <span>
          <span className="font-semibold text-body">{t('home.sections.goalLabel')}</span>
          {children}
        </span>
      </p>
    </div>
  )
}

function DownloadPanel({ s }: { s: SectionDef }) {
  const { t } = useTranslation()
  return (
    <PanelShell s={s}>
      <p className="text-sm text-body mb-3">{t(`sections.${s.key}.intro`)}</p>
      <ul className="space-y-2.5">
        {s.fileItems?.map((it) => (
          <li key={it.key} className="flex items-center gap-2.5 text-sm text-body">
            {it.ft ? (
              <FileTypeChip type={it.ft} size="sm" />
            ) : (
              <span className="shrink-0 text-faint" aria-hidden="true">
                <Icon name="file" size={16} />
              </span>
            )}
            {t(`sections.download.fileItems.${it.key}`)}
          </li>
        ))}
      </ul>
      <div className="mt-auto"><GoalNote accent={s.accent}>{t(`sections.${s.key}.goal`)}</GoalNote></div>
    </PanelShell>
  )
}

function ListPanel({ s }: { s: SectionDef }) {
  const { t } = useTranslation()
  return (
    <PanelShell s={s}>
      <p className="text-sm text-body mb-3">{t(`sections.${s.key}.intro`)}</p>
      <ul className="space-y-2">
        {s.listItems?.map((it) => (
          <li key={it} className="flex items-center gap-2.5 text-sm text-body">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: `var(--sec-${s.accent})` }} />
            {t(`sections.library.listItems.${it}`)}
          </li>
        ))}
      </ul>
      <div className="mt-auto"><GoalNote accent={s.accent}>{t(`sections.${s.key}.goal`)}</GoalNote></div>
    </PanelShell>
  )
}

function DeptPanel({ s }: { s: SectionDef }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  return (
    <PanelShell s={s}>
      <p className="text-sm font-semibold text-strong mb-3">{t(`sections.${s.key}.intro`)}</p>
      <ul className="space-y-2">
        {DEPARTMENTS.map((d) => (
          <li key={d.key}>
            <button
              onClick={() => navigate('/departments')}
              className="flex items-center gap-2.5 w-full text-start p-2 rounded-[var(--radius-sm)] text-[13px] text-body transition hover:bg-[var(--sec-departments-surface)]"
            >
              <span
                className="grid place-items-center w-7 h-7 rounded-full shrink-0"
                style={{ background: 'var(--sec-departments-surface)', color: 'var(--sec-departments)' }}
              >
                <Icon name="user" size={14} />
              </span>
              {t(`departments.${d.key}.name`)}
            </button>
          </li>
        ))}
      </ul>
    </PanelShell>
  )
}

function AboutPanel({ s }: { s: SectionDef }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  return (
    <PanelShell s={s}>
      {OWNER.photo && (
        <div className="w-full h-[140px] rounded-[var(--radius-md)] mb-4 overflow-hidden bg-tint">
          <img src={OWNER.photo} alt={t('owner.name')} loading="lazy" className="w-full h-full object-cover" />
        </div>
      )}
      <p className="text-[13px] text-body leading-relaxed">{t('owner.bio1')}</p>
      <p className="text-[13px] text-body leading-relaxed mt-3">{t('owner.bio2')}</p>
      <div className="mt-auto pt-4">
        <Button size="sm" variant="ghost" iconEnd="arrowLeft" onClick={() => navigate('/about')}>
          {t('common.more')}
        </Button>
      </div>
    </PanelShell>
  )
}

function AgencyPanel({ s }: { s: SectionDef }) {
  const { t } = useTranslation()
  return (
    <PanelShell s={s}>
      <p className="text-[13px] text-body leading-relaxed">{t('agency.body')}</p>
      <div className="mt-auto pt-5 flex items-end justify-center gap-1.5 opacity-60" aria-hidden="true" style={{ color: 'var(--sec-agency)' }}>
        {[26, 40, 30, 52, 34, 46, 28].map((h, i) => (
          <span key={i} className="w-5 rounded-t-sm border" style={{ height: h, borderColor: 'currentColor', background: 'var(--sec-agency-surface)' }} />
        ))}
      </div>
    </PanelShell>
  )
}

export function DetailSections() {
  return (
    <section className="max-w-[1280px] mx-auto px-4 md:px-8 mt-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 items-stretch">
        {SECTIONS.map((s, i) => (
          <Reveal key={s.key} delay={i * 60} style={{ height: '100%' }}>
            {s.kind === 'download' ? (
              <DownloadPanel s={s} />
            ) : s.kind === 'list' ? (
              <ListPanel s={s} />
            ) : s.kind === 'departments' ? (
              <DeptPanel s={s} />
            ) : s.kind === 'about' ? (
              <AboutPanel s={s} />
            ) : (
              <AgencyPanel s={s} />
            )}
          </Reveal>
        ))}
      </div>
    </section>
  )
}

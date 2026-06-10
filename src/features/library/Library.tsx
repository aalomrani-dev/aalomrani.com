import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { FileCard } from '@/components/ui/FileCard'
import { CategoryChip } from '@/components/ui/CategoryChip'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { Reveal } from '@/components/ui/Reveal'
import { Toast, useToast } from '@/components/ui/Toast'
import { PageHero } from '@/components/layout/PageHero'
import { useAuth } from '@/lib/auth'
import { useFiles, categoryChips, downloadFile } from '@/lib/data'
import { useFileGate } from '@/features/file/FileGate'
import type { FileItem } from '@/data/content'

export function Library() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, isActiveMember } = useAuth()
  const { files, categories, loading } = useFiles()
  const { toast, showToast } = useToast()
  const gate = useFileGate()
  const [cat, setCat] = useState('all')

  const list = files.filter((f) => cat === 'all' || f.cat === cat)
  const cats = categoryChips(files, categories, t('library.filterAll'))
  // Browsing is open; the moment a guest opens or downloads a file, gate them.
  const openFile = (f: FileItem) => {
    if (!user) return gate.open()
    navigate('/file/' + f.id)
  }
  const download = async (f: FileItem) => {
    if (!user) return gate.open()
    const outcome = await downloadFile(f, user.id)
    if (outcome === 'ok') showToast(t('file.downloadStarted', { title: f.title }))
    else if (outcome === 'no-binary') showToast(t('file.noBinary'))
    else if (outcome === 'denied') showToast(t('file.denied'))
    else showToast(t('file.downloadError'))
  }

  return (
    <div>
      <PageHero
        eyebrow={t('library.heroEyebrow')}
        icon="bookOpen"
        title={t('library.heroTitle')}
        desc={t('library.heroDesc')}
      />

      <div className="max-w-[1240px] mx-auto px-6 md:px-8 py-10">
        {!user && (
          <Reveal>
            <div
              className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-[var(--radius-lg)] border bg-tint"
              style={{ borderColor: 'var(--accent-soft)' }}
            >
              <Icon name="lock" size={20} style={{ color: 'var(--accent-strong)' }} />
              <span className="text-sm text-body flex-1 min-w-[200px]">
                {t('library.guestBanner')}
              </span>
              <Button size="sm" icon="userPlus" onClick={() => navigate('/login')}>
                {t('common.login')}
              </Button>
            </div>
          </Reveal>
        )}
        {user && !isActiveMember && (
          <Reveal>
            <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-[var(--radius-lg)] border" style={{ borderColor: 'var(--warning-600)', background: 'var(--warning-100)' }}>
              <Icon name="clock" size={20} style={{ color: 'var(--warning-600)' }} />
              <span className="text-sm text-body flex-1 min-w-[200px]">{t('auth.pendingBanner')}</span>
            </div>
          </Reveal>
        )}

        {/* mobile / tablet: horizontal category chips */}
        <div className="flex gap-2 flex-wrap mb-6 lg:hidden">
          {cats.map((c) => (
            <CategoryChip key={c.key} active={cat === c.key} count={c.count} onClick={() => setCat(c.key)}>
              {c.label}
            </CategoryChip>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* desktop: sticky vertical sidebar */}
          <aside className="hidden lg:block lg:sticky lg:top-24 self-start">
            <p className="text-xs font-semibold text-faint mb-3 px-2">{t('library.categoriesHeading')}</p>
            <nav className="flex flex-col gap-1">
              {cats.map((c) => {
                const active = cat === c.key
                return (
                  <button
                    key={c.key}
                    onClick={() => setCat(c.key)}
                    aria-pressed={active}
                    className={`flex items-center justify-between gap-2 px-3 h-10 rounded-[var(--radius-sm)] text-sm transition ${
                      active ? 'bg-tint text-accentStrong font-semibold' : 'text-body hover:bg-tint'
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <Icon name="folder" size={16} />
                      <span className="truncate">{c.label}</span>
                    </span>
                    <span className="font-mono text-xs text-muted tnum">{c.count}</span>
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* files */}
          <div>
            {loading ? (
              <SkeletonGrid count={4} className="grid gap-4 sm:grid-cols-2" />
            ) : list.length === 0 ? (
              <EmptyState
                icon="inbox"
                title={t('empty.emptyCategory.title')}
                note={t('empty.emptyCategory.note')}
                actionLabel={t('empty.emptyCategory.action')}
                onAction={() => setCat('all')}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {list.map((f, i) => (
                  <Reveal key={f.id} delay={i * 50}>
                    <FileCard file={f} locked={false} onOpen={openFile} onDownload={download} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast message={toast} />
    </div>
  )
}

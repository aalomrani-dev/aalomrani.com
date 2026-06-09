import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { IconButton } from '@/components/ui/IconButton'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CategoryChip } from '@/components/ui/CategoryChip'
import { FileCard } from '@/components/ui/FileCard'
import { FileTypeChip } from '@/components/ui/FileTypeChip'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { Reveal } from '@/components/ui/Reveal'
import { Toast, useToast } from '@/components/ui/Toast'
import { PageHero } from '@/components/layout/PageHero'
import { useAuth } from '@/lib/auth'
import { useFiles, categoryChips, downloadFile } from '@/lib/data'
import type { FileItem } from '@/data/content'

function FileListRow({ file, locked, onOpen, onDownload }: { file: FileItem; locked: boolean; onOpen: (f: FileItem) => void; onDownload: (f: FileItem) => void }) {
  const { t } = useTranslation()
  return (
    <div className="group relative flex items-center gap-4 p-3.5 rounded-[var(--radius-md)] bg-surface border border-line hover:border-accentSoft transition">
      {!locked && (
        <button
          type="button"
          onClick={() => onOpen(file)}
          aria-label={file.title}
          className="absolute inset-0 z-0"
        />
      )}
      <span className="grid place-items-center w-10 h-10 rounded-[var(--radius-sm)] bg-tint text-accentStrong shrink-0">
        <Icon name="file" size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-strong truncate">{file.title}</p>
        <p className="font-mono text-xs text-muted mt-0.5">
          <span className="tnum">{file.size}</span> · <span className="tnum" dir="ltr">{file.date}</span>
        </p>
      </div>
      <FileTypeChip type={file.type} size="sm" />
      {locked ? (
        <Badge tone="neutral" icon="lock">{t('common.locked')}</Badge>
      ) : (
        <span className="relative z-10">
          <IconButton
            name="download"
            label={t('common.download')}
            variant="outline"
            size={40}
            onClick={(e) => {
              e.stopPropagation()
              onDownload(file)
            }}
          />
        </span>
      )}
    </div>
  )
}

export function DownloadCenter() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, isActiveMember } = useAuth()
  const { files, categories, loading } = useFiles()

  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const { toast, showToast } = useToast()

  const query = q.trim()
  const list = files.filter(
    (f) => (cat === 'all' || f.cat === cat) && (query === '' || f.title.includes(query) || f.cat.includes(query)),
  )

  const openFile = (f: FileItem) => navigate('/file/' + f.id)
  const download = async (f: FileItem) => {
    const outcome = await downloadFile(f, user?.id ?? null)
    if (outcome === 'ok') showToast(t('file.downloadStarted', { title: f.title }))
    else if (outcome === 'no-binary') showToast(t('file.noBinary'))
    else if (outcome === 'denied') showToast(t('file.denied'))
    else showToast(t('file.downloadError'))
  }

  return (
    <div>
      <PageHero
        eyebrow={t('download.heroEyebrow')}
        icon="download"
        title={t('download.heroTitle')}
        desc={t('download.heroDesc')}
      />

      <div className="max-w-[1240px] mx-auto px-6 md:px-8 py-10">
        {!user && (
          <Reveal>
            <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-[var(--radius-lg)] border bg-tint" style={{ borderColor: 'var(--accent-soft)' }}>
              <Icon name="lock" size={20} style={{ color: 'var(--accent-strong)' }} />
              <span className="text-sm text-body flex-1 min-w-[200px]">{t('download.guestBanner')}</span>
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

        {/* category filters */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categoryChips(files, categories, t('library.filterAll')).map((c) => (
            <CategoryChip key={c.key} active={cat === c.key} count={c.count} onClick={() => setCat(c.key)}>
              {c.label}
            </CategoryChip>
          ))}
        </div>

        {/* toolbar: search + count + view toggle */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2 h-11 px-3.5 rounded-[var(--radius-sm)] bg-surface border border-line flex-1 min-w-[220px] focus-within:border-accent">
            <Icon name="search" size={18} style={{ color: 'var(--text-muted)' }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('download.searchPlaceholder')}
              aria-label={t('a11y.searchFiles')}
              className="flex-1 bg-transparent outline-none text-strong placeholder:text-faint"
            />
            {q && (
              <button onClick={() => setQ('')} className="text-muted hover:text-strong" aria-label={t('a11y.clearSearch')}>
                <Icon name="x" size={16} />
              </button>
            )}
          </div>
          <span className="text-sm text-muted hidden sm:inline tnum" aria-live="polite">{t('download.fileCount', { count: list.length })}</span>
          <div className="flex items-center gap-1 p-1 rounded-[var(--radius-sm)] bg-inset">
            <IconButton name="grid" label={t('a11y.gridView')} size={40} active={view === 'grid'} onClick={() => setView('grid')} />
            <IconButton name="list" label={t('a11y.listView')} size={40} active={view === 'list'} onClick={() => setView('list')} />
          </div>
        </div>

        {/* results */}
        {loading ? (
          <SkeletonGrid count={6} />
        ) : list.length === 0 ? (
          <EmptyState
            icon="search"
            title={t('empty.noResults.title')}
            note={t('empty.noResults.note')}
            actionLabel={t('empty.noResults.action')}
            onAction={() => {
              setQ('')
              setCat('all')
            }}
          />
        ) : view === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((f, i) => (
              <Reveal key={f.id} delay={i * 50}>
                <FileCard file={f} locked={!isActiveMember} onOpen={openFile} onDownload={download} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {list.map((f) => (
              <FileListRow key={f.id} file={f} locked={!isActiveMember} onOpen={openFile} onDownload={download} />
            ))}
          </div>
        )}
      </div>

      {/* transient toast */}
      <Toast message={toast} />
    </div>
  )
}

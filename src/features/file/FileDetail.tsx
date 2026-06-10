import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { FileTypeChip } from '@/components/ui/FileTypeChip'
import { FileCard } from '@/components/ui/FileCard'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { Reveal } from '@/components/ui/Reveal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Toast, useToast } from '@/components/ui/Toast'
import { useAuth } from '@/lib/auth'
import { useFiles, downloadFile } from '@/lib/data'
import { useFileGate } from '@/features/file/FileGate'
import type { FileItem } from '@/data/content'

const FILE_COLOR = {
  pdf: 'var(--file-pdf)',
  xlsx: 'var(--file-xlsx)',
  pptx: 'var(--file-pptx)',
} as const

function MetaRow({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-strong tnum" dir={ltr ? 'ltr' : undefined}>
        {value}
      </span>
    </div>
  )
}

export function FileDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isActiveMember, loading: authLoading } = useAuth()
  const { files, loading } = useFiles()
  const { toast, showToast } = useToast()
  const gate = useFileGate()

  // Reading a file is gated: a guest landing here gets the login popup and no content.
  useEffect(() => {
    if (!authLoading && !user) gate.open()
  }, [authLoading, user, gate])

  const file = files.find((f) => String(f.id) === id)

  const back = (
    <button
      onClick={() => navigate('/library')}
      className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-strong transition mb-6"
    >
      <Icon name="arrowLeft" size={16} />
      {t('file.backToDownload')}
    </button>
  )

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

  if (authLoading || loading) {
    return (
      <div className="max-w-[1000px] mx-auto px-6 md:px-8 py-10">
        {back}
        <SkeletonGrid count={1} className="grid gap-4" />
      </div>
    )
  }

  // Guests can browse the catalog but not read a file — gate before any content.
  if (!user) {
    return (
      <div className="max-w-[1000px] mx-auto px-6 md:px-8 py-10">
        {back}
        <EmptyState
          icon="lock"
          title={t('file.gateModal.title')}
          note={t('file.gateModal.message')}
          actionLabel={t('common.login')}
          onAction={() => navigate('/login')}
        />
      </div>
    )
  }

  if (!file) {
    return (
      <div className="max-w-[1000px] mx-auto px-6 md:px-8 py-10">
        {back}
        <EmptyState
          icon="file"
          title={t('file.notFound.title')}
          note={t('file.notFound.note')}
          actionLabel={t('file.notFound.action')}
          onAction={() => navigate('/library')}
        />
      </div>
    )
  }

  const sameCat = files.filter((x) => x.id !== file.id && x.cat === file.cat).slice(0, 3)
  const related = sameCat.length ? sameCat : files.filter((x) => x.id !== file.id).slice(0, 3)
  const accent = FILE_COLOR[file.type]

  return (
    <div>
      <div className="max-w-[1000px] mx-auto px-6 md:px-8 py-8">
        {back}

        <div className="grid gap-8 md:grid-cols-[1fr_300px]">
          {/* main */}
          <Reveal>
            <div className="flex items-center gap-3">
              <span
                className="grid place-items-center w-12 h-12 rounded-[var(--radius-md)] shrink-0"
                style={{ background: `color-mix(in srgb, ${accent} 12%, transparent)`, color: accent }}
              >
                <Icon name="file" size={24} />
              </span>
              <FileTypeChip type={file.type} />
            </div>

            <h1 className="font-display font-bold text-strong text-3xl mt-4 leading-snug">{file.title}</h1>
            <p className="text-body leading-relaxed mt-4">{file.desc}</p>

            {/* preview placeholder */}
            <div className="mt-8 rounded-[var(--radius-lg)] border border-line bg-subtle aspect-[16/10] grid place-items-center text-faint overflow-hidden relative">
              <span
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.06]"
                style={{ background: `radial-gradient(circle at 30% 20%, ${accent}, transparent 60%)` }}
              />
              <span className="relative flex flex-col items-center gap-2">
                <span style={{ color: accent }}>
                  <Icon name="file" size={44} />
                </span>
                <span className="text-sm">{t('file.previewLabel')}</span>
                <span className="text-xs text-faint">{t('file.previewHint')}</span>
              </span>
            </div>
          </Reveal>

          {/* meta + actions */}
          <Reveal delay={80}>
            <aside className="md:sticky md:top-24 self-start space-y-4">
              <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 space-y-3">
                <MetaRow label={t('file.meta.category')} value={file.cat} />
                <MetaRow label={t('file.meta.format')} value={file.type.toUpperCase()} ltr />
                <MetaRow label={t('file.meta.size')} value={file.size} ltr />
                <MetaRow label={t('file.meta.lastUpdated')} value={file.date} ltr />
                <div className="pt-2 border-t border-line">
                  {isActiveMember ? (
                    <Button full icon="download" onClick={() => download(file)}>
                      {t('file.downloadButton')}
                    </Button>
                  ) : user ? (
                    <Button full icon="clock" variant="secondary" disabled>
                      {t('file.pendingButton')}
                    </Button>
                  ) : (
                    <Button full icon="lock" variant="secondary" onClick={() => navigate('/login')}>
                      {t('file.signInToDownload')}
                    </Button>
                  )}
                </div>
                {!isActiveMember && (
                  <p className="flex items-start gap-2 text-xs text-muted leading-relaxed">
                    <span className="mt-0.5 shrink-0 text-accentStrong">
                      <Icon name="lock" size={14} />
                    </span>
                    {user ? t('file.pendingNote') : t('file.accessNote')}
                  </p>
                )}
              </div>
            </aside>
          </Reveal>
        </div>

        {/* related */}
        {related.length > 0 && (
          <div className="mt-14">
            <Reveal>
              <h2 className="font-display font-bold text-strong text-2xl mb-5">{t('file.relatedTitle')}</h2>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((x, i) => (
                <Reveal key={x.id} delay={i * 60}>
                  <FileCard file={x} locked={false} onOpen={openFile} onDownload={download} />
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>

      <Toast message={toast} />
    </div>
  )
}

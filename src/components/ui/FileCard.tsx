import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/ui/Icon'
import { FileTypeChip } from '@/components/ui/FileTypeChip'
import type { FileItem } from '@/data/content'

interface FileCardProps {
  file: FileItem
  locked?: boolean
  onOpen?: (f: FileItem) => void
  onDownload?: (f: FileItem) => void
}

/* Downloadable document tile. Elevates + reveals a download affordance on hover.
   When `locked`, content blurs behind a "log in to download" overlay
   (the visual analogue of the Supabase RLS gate). */
export function FileCard({ file, locked = false, onOpen, onDownload }: FileCardProps) {
  const { t } = useTranslation()

  return (
    <div
      aria-label={locked ? t('a11y.fileLocked', { title: file.title }) : file.title}
      className="group relative flex flex-col gap-3 p-5 rounded-[var(--radius-lg)] bg-surface border border-line overflow-hidden shadow-[var(--shadow-sm)] hover:-translate-y-[3px] hover:shadow-[var(--glow-teal)] focus-within:-translate-y-[3px] focus-within:shadow-[var(--glow-teal)] transition-[transform,box-shadow] duration-200"
      style={{ minHeight: 176 }}
    >
      {!locked && (
        <button
          type="button"
          onClick={() => onOpen?.(file)}
          aria-label={file.title}
          className="absolute inset-0 z-0"
        />
      )}

      <div className="flex items-center justify-between">
        <span className="grid place-items-center w-11 h-11 rounded-[var(--radius-sm)] bg-tint text-accentStrong">
          <Icon name="file" size={22} />
        </span>
        <FileTypeChip type={file.type} />
      </div>

      <h3 className="font-display font-bold text-strong leading-snug" style={{ fontSize: 19, filter: locked ? 'blur(4px)' : 'none' }}>
        {file.title}
      </h3>

      <div
        className="flex items-center gap-2.5 mt-auto font-mono text-xs text-muted tnum"
        style={{ filter: locked ? 'blur(3px)' : 'none' }}
      >
        <span>{file.cat}</span>
        <span aria-hidden="true">·</span>
        <span>{file.size}</span>
        <span aria-hidden="true">·</span>
        <span dir="ltr">{file.date}</span>
      </div>

      {!locked && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDownload?.(file)
          }}
          className="relative z-10 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[var(--radius-sm)] bg-accent text-onAccent text-sm font-semibold w-fit opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-[opacity,transform] duration-200"
        >
          <Icon name="download" size={16} />
          {t('common.download')}
        </button>
      )}

      {locked && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-5"
          style={{ background: 'color-mix(in srgb, var(--brand) 32%, transparent)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}
        >
          <Icon name="lock" size={26} style={{ color: '#fff' }} />
          <span className="text-white font-semibold text-sm">{t('file.lockedOverlay')}</span>
        </div>
      )}
    </div>
  )
}

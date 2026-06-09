import { useState } from 'react'
import type { KeyboardEvent } from 'react'
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
  const [hover, setHover] = useState(false)
  const open = () => {
    if (!locked) onOpen?.(file)
  }
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (locked) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpen?.(file)
    }
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={open}
      onKeyDown={onKey}
      role={locked ? undefined : 'button'}
      tabIndex={locked ? -1 : 0}
      aria-label={locked ? t('a11y.fileLocked', { title: file.title }) : file.title}
      className="relative flex flex-col gap-3 p-5 rounded-[var(--radius-lg)] bg-surface border border-line overflow-hidden"
      style={{
        minHeight: 176,
        cursor: locked ? 'default' : 'pointer',
        boxShadow: hover && !locked ? 'var(--glow-teal)' : 'var(--shadow-sm)',
        transform: hover && !locked ? 'translateY(-3px)' : 'none',
        transition: 'transform .24s var(--ease-out), box-shadow .24s var(--ease-out)',
      }}
    >
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
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[var(--radius-sm)] bg-accent text-onAccent text-sm font-semibold w-fit"
          style={{
            opacity: hover ? 1 : 0,
            transform: hover ? 'none' : 'translateY(6px)',
            transition: 'opacity .24s var(--ease-out), transform .24s var(--ease-out)',
          }}
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

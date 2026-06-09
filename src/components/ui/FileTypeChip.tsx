import { Icon } from '@/components/ui/Icon'
import type { FileType } from '@/data/content'

const COLOR: Record<FileType, string> = {
  pdf: 'var(--file-pdf)',
  xlsx: 'var(--file-xlsx)',
  pptx: 'var(--file-pptx)',
}
const LABEL: Record<FileType, string> = { pdf: 'PDF', xlsx: 'XLSX', pptx: 'PPTX' }

interface FileTypeChipProps {
  type: FileType
  size?: 'sm' | 'md'
}

/* Type is conveyed by glyph + label + color (colorblind-safe — never color alone). */
export function FileTypeChip({ type, size = 'md' }: FileTypeChipProps) {
  const sm = size === 'sm'
  return (
    <span
      className={`latin inline-flex items-center gap-1 rounded-[var(--radius-sm)] font-semibold shrink-0 ${sm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-[11px]'}`}
      style={{ color: COLOR[type], background: `color-mix(in srgb, ${COLOR[type]} 12%, transparent)` }}
    >
      <Icon name="file" size={sm ? 11 : 13} />
      {LABEL[type]}
    </span>
  )
}

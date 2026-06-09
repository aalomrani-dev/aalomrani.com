import { Icon, type IconName } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'

interface EmptyStateProps {
  icon?: IconName
  title: string
  note?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon = 'search', title, note, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <span className="grid place-items-center w-16 h-16 rounded-full mb-4" style={{ background: 'var(--surface-tint)', color: 'var(--accent-strong)' }}>
        <Icon name={icon} size={30} />
      </span>
      <h3 className="font-display font-bold text-strong text-xl">{title}</h3>
      {note && <p className="text-muted mt-2 max-w-[40ch]">{note}</p>}
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="secondary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  )
}

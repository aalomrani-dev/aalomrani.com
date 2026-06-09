import { Icon, type IconName } from '@/components/ui/Icon'
import { Reveal } from '@/components/ui/Reveal'

interface PageHeroProps {
  eyebrow: string
  title: string
  desc?: string
  icon?: IconName
}

/* Compact page header for app/content screens. */
export function PageHero({ eyebrow, title, desc, icon }: PageHeroProps) {
  return (
    <div className="relative overflow-hidden border-b border-line bg-subtle">
      <div className="max-w-[1240px] mx-auto px-6 md:px-8 py-12">
        <Reveal>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-accentStrong">
            {icon && <Icon name={icon} size={16} />}
            {eyebrow}
          </span>
          <h1 className="font-display font-bold text-strong text-4xl mt-3">{title}</h1>
          {desc && <p className="text-muted mt-2 max-w-2xl leading-relaxed">{desc}</p>}
        </Reveal>
      </div>
    </div>
  )
}

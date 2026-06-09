import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Toggle } from '@/components/ui/Toggle'
import { CountUp } from '@/components/ui/CountUp'
import { FileTypeChip } from '@/components/ui/FileTypeChip'
import { Toast, useToast } from '@/components/ui/Toast'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import { mapFileRow } from '@/lib/data'
import { DEFAULT_CATEGORY, type AccessUser, type FileItem, type FileType } from '@/data/content'

type AdminTab = 'files' | 'categories' | 'access' | 'analytics'

const NAV: { key: AdminTab; icon: IconName; soon?: boolean }[] = [
  { key: 'files', icon: 'file' },
  { key: 'categories', icon: 'folder' },
  { key: 'access', icon: 'shield' },
  { key: 'analytics', icon: 'target', soon: true },
]

const FILE_TYPES: FileType[] = ['pdf', 'xlsx', 'pptx']

interface CatRow { id: number; label: string }
interface DomainRow { id: number; domain: string; enabled: boolean }

/* What the file modal hands back; the parent does the storage upload + DB write. */
interface FileDraft {
  id?: number
  title: string
  type: FileType
  cat: string
  desc: string
}

/* -------------------------------------------------------------- not authorized */
function NotAuthorized({ signedIn }: { signedIn: boolean }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  return (
    <div className="min-h-svh grid place-items-center bg-app px-6">
      <div className="text-center max-w-md">
        <span className="inline-grid place-items-center w-16 h-16 rounded-full mb-5" style={{ background: 'var(--error-100)', color: 'var(--error-600)' }}>
          <Icon name="lock" size={30} />
        </span>
        <h1 className="font-display font-bold text-strong text-3xl">{t('admin.notAuthorized.title')}</h1>
        <p className="text-body leading-relaxed mt-3">
          {t('admin.notAuthorized.body', { detail: signedIn ? t('admin.notAuthorized.detailNoPermission') : t('admin.notAuthorized.detailSignIn') })}
        </p>
        <div className="mt-7 flex justify-center gap-3">
          {signedIn ? (
            <Button icon="arrowLeft" onClick={() => navigate('/')}>
              {t('admin.notAuthorized.backHome')}
            </Button>
          ) : (
            <Button icon="userPlus" onClick={() => navigate('/login')}>
              {t('common.login')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- file upload / edit modal */
function FileModal({
  open,
  mode,
  initial,
  categories,
  busy,
  onSave,
  onClose,
}: {
  open: boolean
  mode: 'new' | 'edit'
  initial?: FileItem
  categories: string[]
  busy: boolean
  onSave: (draft: FileDraft, fileObj: File | null) => void
  onClose: () => void
}) {
  const [name, setName] = useState(initial?.title ?? '')
  const [type, setType] = useState<FileType>(initial?.type ?? 'pdf')
  const [cat, setCat] = useState(() => (initial && categories.includes(initial.cat) ? initial.cat : categories[0] ?? ''))
  const [fileObj, setFileObj] = useState<File | null>(null)
  const [over, setOver] = useState(false)
  const { t } = useTranslation()

  if (!open) return null

  const accept = (f: File) => {
    setFileObj(f)
    setName((n) => n || f.name.replace(/\.[^.]+$/, ''))
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (ext === 'pdf' || ext === 'xlsx' || ext === 'pptx') setType(ext)
  }

  const save = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || busy) return
    onSave({ id: initial?.id, title: name.trim(), type, cat: cat || categories[0] || DEFAULT_CATEGORY, desc: initial?.desc ?? '' }, fileObj)
  }

  const selectCls =
    'h-12 px-3.5 rounded-[var(--radius-sm)] bg-surface border-[1.5px] border-[var(--border-strong)] text-strong outline-none focus:border-accent appearance-none w-full'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'edit' ? t('admin.fileModal.editTitle') : t('admin.fileModal.newTitle')}
      titleIcon={mode === 'edit' ? 'edit' : 'upload'}
      footer={
        <>
          <Button icon="check" onClick={save} disabled={busy}>
            {mode === 'edit' ? t('admin.fileModal.saveEdit') : t('admin.fileModal.savePublish')}
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            {t('common.cancel')}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={save}>
        <label
          onDragOver={(e) => {
            e.preventDefault()
            setOver(true)
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setOver(false)
            const f = e.dataTransfer.files?.[0]
            if (f) accept(f)
          }}
          className="block rounded-[var(--radius-lg)] border-2 border-dashed p-8 text-center transition cursor-pointer"
          style={{
            borderColor: over ? 'var(--accent)' : 'var(--border-strong)',
            background: over ? 'var(--surface-tint)' : 'var(--bg-subtle)',
          }}
        >
          <input
            type="file"
            accept=".pdf,.xlsx,.pptx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) accept(f)
            }}
          />
          <span className="grid place-items-center w-14 h-14 rounded-full mx-auto mb-3 bg-tint text-accentStrong">
            <Icon name={fileObj ? 'check' : 'upload'} size={26} />
          </span>
          {fileObj ? (
            <p className="font-semibold text-strong truncate latin" dir="ltr">{fileObj.name}</p>
          ) : (
            <>
              <p className="font-semibold text-strong">{t('admin.fileModal.dropzone')}</p>
              <p className="text-sm text-muted mt-1 latin" dir="ltr">{t('admin.fileModal.dropzoneHint')}</p>
            </>
          )}
        </label>

        <Input label={t('admin.fileModal.nameLabel')} placeholder={t('admin.fileModal.namePlaceholder')} value={name} onChange={(e) => setName(e.target.value)} required />

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-strong">{t('admin.fileModal.typeLabel')}</span>
            <div className="relative">
              <select value={type} onChange={(e) => setType(e.target.value as FileType)} className={selectCls}>
                {FILE_TYPES.map((ft) => (
                  <option key={ft} value={ft}>
                    {ft.toUpperCase()}
                  </option>
                ))}
              </select>
              <span className="absolute top-1/2 -translate-y-1/2 pointer-events-none text-muted" style={{ insetInlineEnd: 12 }}>
                <Icon name="chevronDown" size={18} />
              </span>
            </div>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-strong">{t('admin.fileModal.catLabel')}</span>
            <div className="relative">
              <select value={cat} onChange={(e) => setCat(e.target.value)} className={selectCls}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <span className="absolute top-1/2 -translate-y-1/2 pointer-events-none text-muted" style={{ insetInlineEnd: 12 }}>
                <Icon name="chevronDown" size={18} />
              </span>
            </div>
          </label>
        </div>
      </form>
    </Modal>
  )
}

/* -------------------------------------------------------------- stat card */
function StatCard({ icon, label, value, suffix }: { icon: IconName; label: string; value: number; suffix?: string }) {
  return (
    <div className="p-5 rounded-[var(--radius-lg)] bg-surface border border-line">
      <span className="grid place-items-center w-10 h-10 rounded-[var(--radius-md)] bg-tint text-accentStrong mb-3">
        <Icon name={icon} size={20} />
      </span>
      <div className="font-display font-black text-strong text-3xl tnum">
        <CountUp to={value} suffix={suffix || ''} />
      </div>
      <div className="text-sm text-muted mt-1">{label}</div>
    </div>
  )
}

/* -------------------------------------------------------------- files view */
function AdminFiles({
  rows,
  catCount,
  downloads,
  onUpload,
  onEdit,
  onDelete,
}: {
  rows: FileItem[]
  catCount: number
  downloads: number
  onUpload: () => void
  onEdit: (f: FileItem) => void
  onDelete: (f: FileItem) => void
}) {
  const { t } = useTranslation()
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-strong text-3xl">{t('admin.nav.files')}</h1>
          <p className="text-muted mt-1">{t('admin.files.subtitle')}</p>
        </div>
        <div className="ms-auto">
          <Button icon="plus" onClick={onUpload}>
            {t('admin.files.upload')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <StatCard icon="file" label={t('admin.files.statTotal')} value={rows.length} />
        <StatCard icon="folder" label={t('admin.nav.categories')} value={catCount} />
        <StatCard icon="download" label={t('admin.files.statMonthlyDownloads')} value={downloads} />
      </div>

      <div className="rounded-[var(--radius-lg)] border border-line bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ minWidth: 620 }}>
            <div className="grid grid-cols-[1fr_90px_130px_120px_92px] gap-3 px-5 py-3 border-b border-line bg-subtle text-xs font-semibold text-muted">
              <span>{t('admin.files.colName')}</span>
              <span>{t('admin.files.colType')}</span>
              <span>{t('admin.files.colCat')}</span>
              <span>{t('admin.files.colDate')}</span>
              <span className="text-center">{t('admin.files.colActions')}</span>
            </div>
            {rows.map((f) => (
              <div
                key={f.id}
                className="grid grid-cols-[1fr_90px_130px_120px_92px] gap-3 px-5 py-3.5 border-b border-line last:border-0 items-center hover:bg-subtle transition"
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Icon name="file" size={18} style={{ color: 'var(--text-muted)' }} />
                  <span className="truncate font-medium text-strong">{f.title}</span>
                </span>
                <FileTypeChip type={f.type} size="sm" />
                <span className="text-sm text-body truncate">{f.cat}</span>
                <span className="text-sm text-muted font-mono tnum" dir="ltr">
                  {f.date}
                </span>
                <span className="flex items-center justify-center gap-1">
                  <IconButton name="edit" label={t('common.edit')} size={34} onClick={() => onEdit(f)} />
                  <IconButton name="trash" label={t('common.delete')} size={34} onClick={() => onDelete(f)} />
                </span>
              </div>
            ))}
            {rows.length === 0 && (
              <div className="px-5 py-12 text-center text-muted">{t('admin.files.empty')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- categories view */
function AdminCategories({
  cats,
  onAdd,
  onDelete,
}: {
  cats: { id: number; label: string; count: number }[]
  onAdd: () => void
  onDelete: (id: number, label: string) => void
}) {
  const { t } = useTranslation()
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-strong text-3xl">{t('admin.nav.categories')}</h1>
          <p className="text-muted mt-1">{t('admin.categories.subtitle')}</p>
        </div>
        <div className="ms-auto">
          <Button icon="plus" variant="secondary" onClick={onAdd}>
            {t('admin.categories.addNew')}
          </Button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {cats.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-4 rounded-[var(--radius-md)] bg-surface border border-line">
            <span className="grid place-items-center w-10 h-10 rounded-[var(--radius-sm)] bg-tint text-accentStrong shrink-0">
              <Icon name="folder" size={20} />
            </span>
            <span className="font-medium text-strong flex-1 min-w-0 truncate">{c.label}</span>
            <Badge tone="neutral">
              <span className="tnum">{t('admin.categories.fileCount', { count: c.count })}</span>
            </Badge>
            <IconButton name="trash" label={t('admin.categories.deleteAria')} size={34} onClick={() => onDelete(c.id, c.label)} />
          </div>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- access view */
function AccessRow({ u, onApprove, onRemove }: { u: AccessUser; onApprove: (id: string) => void; onRemove: (id: string) => void }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-line last:border-0">
      <Avatar name={u.name} size={40} />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-strong truncate">{u.name}</p>
        <p className="text-xs text-muted font-mono truncate latin" dir="ltr" style={{ textAlign: 'start' }}>
          {u.email}
        </p>
      </div>
      {u.status === 'active' && <Badge tone="success" icon="check">{t('admin.access.statusActive')}</Badge>}
      {u.status === 'owner' && <Badge tone="accent" icon="shield">{t('admin.access.statusOwner')}</Badge>}
      {u.status === 'pending' && <Badge tone="warning" dot>{t('admin.access.statusPending')}</Badge>}
      {u.status === 'pending' && <IconButton name="check" label={t('admin.access.approveAria')} size={34} onClick={() => onApprove(u.id)} />}
      {u.status !== 'owner' && <IconButton name="trash" label={t('admin.access.removeAria')} size={34} onClick={() => onRemove(u.id)} />}
    </div>
  )
}

function AdminAccess({
  users,
  domains,
  onToggleDomain,
  onAddDomain,
  onApprove,
  onRemove,
}: {
  users: AccessUser[]
  domains: DomainRow[]
  onToggleDomain: (d: DomainRow) => void
  onAddDomain: () => void
  onApprove: (id: string) => void
  onRemove: (id: string) => void
}) {
  const { t } = useTranslation()
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-strong text-3xl">{t('admin.nav.access')}</h1>
          <p className="text-muted mt-1">{t('admin.access.subtitle')}</p>
        </div>
        <div className="ms-auto">
          <Button icon="plus" onClick={onAddDomain}>
            {t('admin.access.addDomain')}
          </Button>
        </div>
      </div>

      {/* allowed domains */}
      <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 mb-6">
        <p className="flex items-center gap-2 text-sm font-semibold text-strong mb-4">
          <Icon name="shield" size={16} style={{ color: 'var(--accent-strong)' }} />
          {t('admin.access.allowedDomains')}
        </p>
        {domains.length === 0 ? (
          <p className="text-sm text-muted leading-relaxed">{t('admin.access.noDomains')}</p>
        ) : (
          <div className="space-y-3">
            {domains.map((d) => (
              <div key={d.id} className="flex items-center gap-3">
                <span className="font-mono text-sm text-body flex-1 latin" dir="ltr" style={{ textAlign: 'start' }}>
                  @{d.domain}
                </span>
                <Toggle checked={d.enabled} onChange={() => onToggleDomain(d)} ariaLabel={t('admin.access.toggleDomainAria', { domain: d.domain })} />
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted mt-4 leading-relaxed">{t('admin.access.domainsNote')}</p>
      </div>

      {/* users */}
      <div className="rounded-[var(--radius-lg)] border border-line bg-surface overflow-hidden">
        {users.length === 0 ? (
          <div className="px-5 py-12 text-center text-muted">{t('admin.access.noUsers')}</div>
        ) : (
          users.map((u) => <AccessRow key={u.id} u={u} onApprove={onApprove} onRemove={onRemove} />)
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- analytics (placeholder) */
function AdminAnalytics() {
  const { t } = useTranslation()
  return (
    <div>
      <h1 className="font-display font-bold text-strong text-3xl mb-1">{t('admin.nav.analytics')}</h1>
      <p className="text-muted mb-6">{t('admin.analytics.subtitle')}</p>
      <div className="relative rounded-[var(--radius-xl)] border-2 border-dashed border-line bg-subtle p-10 md:p-12 text-center overflow-hidden">
        <span className="inline-flex items-center gap-1.5 px-3 h-7 rounded-full text-xs font-semibold bg-inset text-faint mb-4">
          <Icon name="clock" size={13} />
          {t('admin.analytics.soonBadge')}
        </span>
        <h3 className="font-display font-bold text-strong text-2xl">{t('admin.analytics.placeholderTitle')}</h3>
        <p className="text-muted mt-2 max-w-md mx-auto leading-relaxed">
          {t('admin.analytics.placeholderBody')}
        </p>
        <div className="grid sm:grid-cols-3 gap-4 mt-8 opacity-50 pointer-events-none select-none">
          {([['user', t('admin.analytics.statVisitors')], ['download', t('admin.analytics.statDownloads')], ['clock', t('admin.analytics.statSessions')]] as [IconName, string][]).map(([ic, l]) => (
            <div key={l} className="p-5 rounded-[var(--radius-lg)] bg-surface border border-line">
              <span className="grid place-items-center w-10 h-10 rounded-[var(--radius-md)] bg-tint text-accentStrong mb-3">
                <Icon name={ic} size={20} />
              </span>
              <div className="font-display font-black text-faint text-3xl">—</div>
              <div className="text-sm text-muted mt-1">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- shell */
export function Admin() {
  const navigate = useNavigate()
  const { user, isOwner, loading: authLoading } = useAuth()
  const { toast, showToast } = useToast()
  const { t } = useTranslation()

  const [tab, setTab] = useState<AdminTab>('files')
  const [dataLoading, setDataLoading] = useState(true)
  const [rows, setRows] = useState<FileItem[]>([])
  const [cats, setCats] = useState<CatRow[]>([])
  const [users, setUsers] = useState<AccessUser[]>([])
  const [domains, setDomains] = useState<DomainRow[]>([])
  const [downloads, setDownloads] = useState(0)

  const [fileModal, setFileModal] = useState<{ mode: 'new' | 'edit'; file?: FileItem } | null>(null)
  const [savingFile, setSavingFile] = useState(false)
  const [catModal, setCatModal] = useState(false)
  const [catName, setCatName] = useState('')
  const [domainModal, setDomainModal] = useState(false)
  const [domainName, setDomainName] = useState('')
  const [domainError, setDomainError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setDataLoading(true)
    const [catRes, fileRes, profRes, domRes, dlRes] = await Promise.all([
      supabase.from('categories').select('id,label,sort_order').order('sort_order'),
      supabase.from('files').select('id,title,type,category_id,description,storage_path,size_bytes,file_date').order('file_date', { ascending: false }).order('id', { ascending: false }),
      supabase.from('profiles').select('id,email,full_name,role,status').order('created_at'),
      supabase.from('allowed_domains').select('id,domain,enabled').order('domain'),
      supabase.from('download_events').select('id', { count: 'exact', head: true }),
    ])
    const catList = (catRes.data as CatRow[] | null) ?? []
    const labelById = new Map(catList.map((c) => [c.id, c.label]))
    setCats(catList)
    setRows(((fileRes.data as Parameters<typeof mapFileRow>[0][] | null) ?? []).map((r) => mapFileRow(r, labelById)))
    setUsers(
      ((profRes.data as { id: string; email: string; full_name: string | null; role: 'owner' | 'member'; status: 'pending' | 'active' }[] | null) ?? []).map((p) => ({
        id: p.id,
        name: p.full_name?.trim() || p.email.split('@')[0],
        email: p.email,
        status: p.role === 'owner' ? 'owner' : p.status,
      })),
    )
    setDomains((domRes.data as DomainRow[] | null) ?? [])
    setDownloads(dlRes.count ?? 0)
    setDataLoading(false)
  }, [])

  useEffect(() => {
    if (isOwner) void load()
  }, [isOwner, load])

  if (authLoading) {
    return (
      <div className="min-h-svh grid place-items-center bg-app">
        <span className="kp-sk block w-40 h-5 rounded" />
      </div>
    )
  }
  if (!isOwner) return <NotAuthorized signedIn={!!user} />

  const catLabels = cats.map((c) => c.label)
  const catRows = cats.map((c) => ({ id: c.id, label: c.label, count: rows.filter((r) => r.cat === c.label).length }))

  const saveFile = async (draft: FileDraft, fileObj: File | null) => {
    if (savingFile) return
    setSavingFile(true)
    const category_id = cats.find((c) => c.label === draft.cat)?.id ?? null
    let storage_path: string | null = null
    let size_bytes: number | null = null

    if (fileObj) {
      const ext = (fileObj.name.split('.').pop() || draft.type).toLowerCase()
      const path = `${crypto.randomUUID()}.${ext}`
      const up = await supabase.storage.from('documents').upload(path, fileObj, { contentType: fileObj.type || undefined, upsert: false })
      if (up.error) {
        setSavingFile(false)
        showToast(t('admin.toast.fileError'))
        return
      }
      storage_path = up.data.path
      size_bytes = fileObj.size
    }

    const patch: Record<string, unknown> = { title: draft.title, type: draft.type, category_id }
    if (storage_path) {
      patch.storage_path = storage_path
      patch.size_bytes = size_bytes
    }
    const res =
      draft.id != null
        ? await supabase.from('files').update(patch).eq('id', draft.id)
        : await supabase.from('files').insert({
            title: draft.title,
            type: draft.type,
            category_id,
            description: draft.desc,
            storage_path,
            size_bytes,
            uploaded_by: user?.id ?? null,
          })
    setSavingFile(false)
    if (res.error) {
      showToast(t('admin.toast.fileError'))
      return
    }
    showToast(draft.id != null ? t('admin.toast.fileSaved', { title: draft.title }) : t('admin.toast.filePublished', { title: draft.title }))
    setFileModal(null)
    await load()
  }

  const deleteFile = async (f: FileItem) => {
    if (f.storagePath) await supabase.storage.from('documents').remove([f.storagePath])
    const { error } = await supabase.from('files').delete().eq('id', f.id)
    if (error) {
      showToast(t('admin.toast.fileError'))
      return
    }
    showToast(t('admin.toast.fileDeleted', { title: f.title }))
    await load()
  }

  const closeCat = () => {
    setCatModal(false)
    setCatName('')
  }
  const addCat = async (e: FormEvent) => {
    e.preventDefault()
    const label = catName.trim()
    if (!label || cats.some((c) => c.label === label)) {
      closeCat()
      return
    }
    const sort_order = cats.length + 1
    const { error } = await supabase.from('categories').insert({ label, sort_order })
    closeCat()
    if (error) {
      showToast(t('admin.toast.fileError'))
      return
    }
    showToast(t('admin.toast.catAdded', { label }))
    await load()
  }
  const deleteCat = async (id: number, label: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) {
      showToast(t('admin.toast.fileError'))
      return
    }
    showToast(t('admin.toast.catDeleted', { label }))
    await load()
  }

  const closeDomain = () => {
    setDomainModal(false)
    setDomainName('')
    setDomainError(null)
  }
  const addDomain = async (e: FormEvent) => {
    e.preventDefault()
    const domain = domainName.trim().toLowerCase()
    if (!domain || domain.includes('@') || !domain.includes('.')) {
      setDomainError(t('admin.access.domainInvalid'))
      return
    }
    if (domains.some((d) => d.domain.toLowerCase() === domain)) {
      setDomainError(t('admin.access.domainExists'))
      return
    }
    const { error } = await supabase.from('allowed_domains').insert({ domain, enabled: true })
    if (error) {
      setDomainError(t('admin.access.domainExists'))
      return
    }
    showToast(t('admin.toast.domainAdded', { domain }))
    closeDomain()
    await load()
  }
  const toggleDomain = async (d: DomainRow) => {
    const { error } = await supabase.from('allowed_domains').update({ enabled: !d.enabled }).eq('id', d.id)
    if (error) {
      showToast(t('admin.toast.fileError'))
      return
    }
    showToast(t('admin.toast.domainToggled'))
    await load()
  }

  const approveUser = async (id: string) => {
    const { error } = await supabase.from('profiles').update({ status: 'active' }).eq('id', id)
    if (error) {
      showToast(t('admin.toast.fileError'))
      return
    }
    showToast(t('admin.toast.userApproved'))
    await load()
  }
  const removeUser = async (id: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) {
      showToast(t('admin.toast.fileError'))
      return
    }
    showToast(t('admin.toast.userRemoved'))
    await load()
  }

  return (
    <div className="min-h-svh bg-app lg:grid lg:grid-cols-[260px_1fr]">
      {/* sidebar */}
      <aside className="lg:min-h-svh lg:border-l border-line bg-surface p-4 lg:p-5 flex flex-col">
        <div className="flex items-center gap-3 mb-6 lg:mb-8">
          <span className="grid place-items-center w-10 h-10 rounded-[var(--radius-md)] text-white shrink-0" style={{ background: 'linear-gradient(135deg, var(--navy-700), var(--teal-600))' }}>
            <Icon name="settings" size={20} />
          </span>
          <div className="leading-tight">
            <p className="font-display font-bold text-strong">{t('admin.shell.title')}</p>
            <p className="text-xs text-muted">{user?.name}</p>
          </div>
        </div>

        <nav className="flex lg:flex-col gap-1 overflow-x-auto -mx-1 px-1 pb-1 lg:pb-0">
          {NAV.map((n) => {
            const active = tab === n.key
            return (
              <button
                key={n.key}
                onClick={() => setTab(n.key)}
                aria-current={active || undefined}
                className={`flex items-center gap-3 px-3 h-11 rounded-[var(--radius-sm)] text-sm whitespace-nowrap transition shrink-0 ${
                  active ? 'bg-tint text-accentStrong font-semibold' : 'text-body hover:bg-tint'
                }`}
              >
                <Icon name={n.icon} size={18} />
                {t(`admin.nav.${n.key}`)}
                {n.soon && (
                  <span className="ms-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-inset text-faint">{t('common.soon')}</span>
                )}
              </button>
            )
          })}
        </nav>

        <button
          onClick={() => navigate('/')}
          className="mt-4 lg:mt-auto flex items-center gap-3 px-3 h-11 rounded-[var(--radius-sm)] text-sm text-body hover:bg-tint transition"
        >
          <Icon name="arrowLeft" size={18} />
          {t('admin.shell.backToPlatform')}
        </button>
      </aside>

      {/* main */}
      <main className="p-6 md:p-10 overflow-auto">
        {dataLoading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className="kp-sk block h-28 rounded-[var(--radius-lg)]" />
            ))}
          </div>
        ) : (
          <>
            {tab === 'files' && (
              <AdminFiles
                rows={rows}
                catCount={cats.length}
                downloads={downloads}
                onUpload={() => setFileModal({ mode: 'new' })}
                onEdit={(f) => setFileModal({ mode: 'edit', file: f })}
                onDelete={deleteFile}
              />
            )}
            {tab === 'categories' && <AdminCategories cats={catRows} onAdd={() => setCatModal(true)} onDelete={deleteCat} />}
            {tab === 'access' && (
              <AdminAccess users={users} domains={domains} onToggleDomain={toggleDomain} onAddDomain={() => setDomainModal(true)} onApprove={approveUser} onRemove={removeUser} />
            )}
            {tab === 'analytics' && <AdminAnalytics />}
          </>
        )}
      </main>

      {/* file modal — keyed so each open/edit remounts with fresh, prop-derived state */}
      <FileModal
        key={fileModal ? `${fileModal.mode}:${fileModal.file?.id ?? 'new'}` : 'closed'}
        open={!!fileModal}
        mode={fileModal?.mode ?? 'new'}
        initial={fileModal?.file}
        categories={catLabels}
        busy={savingFile}
        onSave={saveFile}
        onClose={() => setFileModal(null)}
      />

      {/* add-category modal */}
      <Modal
        open={catModal}
        onClose={closeCat}
        title={t('admin.categories.addNew')}
        titleIcon="folder"
        footer={
          <>
            <Button icon="check" onClick={addCat}>
              {t('common.add')}
            </Button>
            <Button variant="secondary" onClick={closeCat}>
              {t('common.cancel')}
            </Button>
          </>
        }
      >
        <form onSubmit={addCat}>
          <Input label={t('admin.categories.nameLabel')} placeholder={t('admin.categories.namePlaceholder')} value={catName} onChange={(e) => setCatName(e.target.value)} required />
        </form>
      </Modal>

      {/* add-domain modal */}
      <Modal
        open={domainModal}
        onClose={closeDomain}
        title={t('admin.access.addDomain')}
        titleIcon="shield"
        footer={
          <>
            <Button icon="check" onClick={addDomain}>
              {t('common.add')}
            </Button>
            <Button variant="secondary" onClick={closeDomain}>
              {t('common.cancel')}
            </Button>
          </>
        }
      >
        <form onSubmit={addDomain}>
          <Input
            label={t('admin.access.domainLabel')}
            dir="ltr"
            placeholder={t('admin.access.domainPlaceholder')}
            error={domainError || undefined}
            value={domainName}
            onChange={(e) => {
              setDomainName(e.target.value)
              if (domainError) setDomainError(null)
            }}
            required
          />
        </form>
      </Modal>

      <Toast message={toast} icon="check" />
    </div>
  )
}

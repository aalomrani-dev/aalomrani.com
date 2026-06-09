import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { DEFAULT_CATEGORY } from '@/data/content'
import type { Category, CategoryFilter, FileItem, FileType } from '@/data/content'

/* The data/query layer: turns Supabase `files`/`categories` rows into the
   FileItem/Category shapes the UI already consumes, plus the gated download. */

interface CategoryRow {
  id: number
  label: string
  sort_order: number
}
interface FileRow {
  id: number
  title: string
  type: FileType
  category_id: number | null
  description: string | null
  storage_path: string | null
  size_bytes: number | null
  file_date: string | null
}

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null) return '—'
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

/* Postgres `date` arrives as 'YYYY-MM-DD'; the UI shows Western digits, ltr. */
export function formatDate(d: string | null | undefined): string {
  if (!d) return '—'
  return d.slice(0, 10).replaceAll('-', '/')
}

export function mapFileRow(row: FileRow, labelById: Map<number, string>): FileItem {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    cat: row.category_id != null ? labelById.get(row.category_id) ?? DEFAULT_CATEGORY : DEFAULT_CATEGORY,
    desc: row.description ?? '',
    size: formatBytes(row.size_bytes),
    date: formatDate(row.file_date),
    storagePath: row.storage_path,
    categoryId: row.category_id,
  }
}

export interface FilesData {
  files: FileItem[]
  categories: Category[]
  loading: boolean
  error: string | null
  reload: () => void
}

/* Loads categories + files (public-read under RLS) and maps them. Each page that
   shows documents calls this; the brief loading state drives the skeleton. */
export function useFiles(): FilesData {
  const [files, setFiles] = useState<FileItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const reload = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    let active = true
    setLoading(true)
    void (async () => {
      const [catRes, fileRes] = await Promise.all([
        supabase.from('categories').select('id,label,sort_order').order('sort_order'),
        supabase
          .from('files')
          .select('id,title,type,category_id,description,storage_path,size_bytes,file_date')
          .order('file_date', { ascending: false })
          .order('id', { ascending: false }),
      ])
      if (!active) return
      if (catRes.error || fileRes.error) {
        setError(catRes.error?.message ?? fileRes.error?.message ?? 'load error')
        setFiles([])
        setCategories([])
        setLoading(false)
        return
      }
      const cats = (catRes.data as CategoryRow[] | null) ?? []
      const labelById = new Map(cats.map((c) => [c.id, c.label]))
      setCategories(cats.map((c) => ({ key: c.label, label: c.label })))
      setFiles(((fileRes.data as FileRow[] | null) ?? []).map((r) => mapFileRow(r, labelById)))
      setError(null)
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [tick])

  return { files, categories, loading, error, reload }
}

/* The synthetic 'all' chip + each category with a LIVE count from the files
   currently loaded — never a stored number. */
export function categoryChips(files: FileItem[], categories: Category[], allLabel: string): CategoryFilter[] {
  return [
    { key: 'all', label: allLabel, count: files.length },
    ...categories.map((c) => ({ key: c.key, label: c.label, count: files.filter((f) => f.cat === c.key).length })),
  ]
}

export type DownloadOutcome = 'ok' | 'no-binary' | 'denied' | 'error'

/* The real FileCard gate: mint a short-lived signed URL for the private object
   (storage RLS only grants this to the owner / active members), log the event,
   then trigger the browser download. Returns a coarse outcome for the toast. */
export async function downloadFile(file: FileItem, userId: string | null): Promise<DownloadOutcome> {
  if (!file.storagePath) return 'no-binary'
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(file.storagePath, 60, { download: true })
  if (error || !data?.signedUrl) return 'denied'

  if (userId) {
    // Best-effort analytics; RLS enforces user_id === auth.uid() && active member.
    await supabase.from('download_events').insert({ file_id: file.id, user_id: userId })
  }

  const a = document.createElement('a')
  a.href = data.signedUrl
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  return 'ok'
}

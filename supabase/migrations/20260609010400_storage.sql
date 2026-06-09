-- Knowledge Platform — Storage
-- Private 'documents' bucket + object policies. This is the REAL FileCard.locked
-- gate: only the owner or an active member can read (download) an object.
-- Guests and pending members are denied -> the blurred "sign in to download".

-- ----------------------------------------------------------------------------
-- Bucket : private, 25 MB cap, pdf/xlsx/pptx only.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  26214400,  -- 25 MB
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ----------------------------------------------------------------------------
-- Object policies (RLS on storage.objects is already enabled by Supabase).
-- Every policy is scoped to bucket_id = 'documents' so other buckets are
-- unaffected.
-- ----------------------------------------------------------------------------
drop policy if exists documents_read_members on storage.objects;
create policy documents_read_members on storage.objects
  for select to authenticated
  using (
    bucket_id = 'documents'
    and (public.is_owner() or public.is_active_member())
  );

drop policy if exists documents_insert_owner on storage.objects;
create policy documents_insert_owner on storage.objects
  for insert to authenticated
  with check (bucket_id = 'documents' and public.is_owner());

drop policy if exists documents_update_owner on storage.objects;
create policy documents_update_owner on storage.objects
  for update to authenticated
  using (bucket_id = 'documents' and public.is_owner())
  with check (bucket_id = 'documents' and public.is_owner());

drop policy if exists documents_delete_owner on storage.objects;
create policy documents_delete_owner on storage.objects
  for delete to authenticated
  using (bucket_id = 'documents' and public.is_owner());

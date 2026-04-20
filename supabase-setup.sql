-- =============================================
-- PBN in the Room AGM 2025 — Supabase Database Setup
-- Run this in your Supabase SQL editor
-- =============================================

-- Create attendees table
create table if not exists public.attendees (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  business    text not null,
  sector      text not null,
  link        text,
  photo_url   text,
  created_at  timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.attendees enable row level security;

-- Policy: anyone can read attendees (public directory)
create policy "Anyone can view attendees"
  on public.attendees
  for select
  using (true);

-- Policy: anyone can insert (self-registration, no login required)
create policy "Anyone can register"
  on public.attendees
  for insert
  with check (true);

-- Policy: anyone can update (for adding photo_url after insert)
create policy "Anyone can update their record"
  on public.attendees
  for update
  using (true);

-- Policy: anyone can delete (admin panel uses this; protected by server-side PIN check)
create policy "Anyone can delete"
  on public.attendees
  for delete
  using (true);

-- Enable real-time for this table
-- Go to Supabase → Database → Replication and enable 'attendees'

-- =============================================
-- Storage bucket for avatars
-- =============================================
-- Run this separately or use the Supabase dashboard:
-- 1. Go to Storage → New bucket
-- 2. Name: avatars
-- 3. Public: YES (tick the box)
-- 4. Add this policy for the bucket:

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Public avatar access"
  on storage.objects
  for select
  using (bucket_id = 'avatars');

create policy "Anyone can upload avatar"
  on storage.objects
  for insert
  with check (bucket_id = 'avatars');

create policy "Anyone can update avatar"
  on storage.objects
  for update
  using (bucket_id = 'avatars');

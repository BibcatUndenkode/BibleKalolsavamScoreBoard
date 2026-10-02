create table if not exists public.kalolsavam_state (
  id text primary key check (id = 'main'),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.kalolsavam_state enable row level security;

grant select on public.kalolsavam_state to anon, authenticated;
grant insert, update, delete on public.kalolsavam_state to authenticated;

drop policy if exists "Anyone can read scoreboard state" on public.kalolsavam_state;
create policy "Anyone can read scoreboard state"
  on public.kalolsavam_state
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can insert scoreboard state" on public.kalolsavam_state;
create policy "Admins can insert scoreboard state"
  on public.kalolsavam_state
  for insert
  to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can update scoreboard state" on public.kalolsavam_state;
create policy "Admins can update scoreboard state"
  on public.kalolsavam_state
  for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can delete scoreboard state" on public.kalolsavam_state;
create policy "Admins can delete scoreboard state"
  on public.kalolsavam_state
  for delete
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'kalolsavam_state'
  ) then
    execute 'alter publication supabase_realtime add table public.kalolsavam_state';
  end if;
end;
$$;

create table favorites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles (id) on delete cascade,
  listing_id  uuid not null references listings (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, listing_id)
);

alter table favorites enable row level security;

create policy "Users manage own favorites" on favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

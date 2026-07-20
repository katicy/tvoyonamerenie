-- Профили пользователей (никнеймы)
create table profiles (
  id uuid references auth.users primary key,
  nickname text
);
alter table profiles enable row level security;
create policy "Профили видны всем" on profiles for select using (true);
create policy "Можно создать свой профиль" on profiles for insert with check (auth.uid() = id);
create policy "Можно менять свой профиль" on profiles for update using (auth.uid() = id);

-- Желания / намерения
create table wishes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  author_name text not null,
  text text not null,
  tag text not null,
  support_count int not null default 0,
  created_at timestamptz not null default now()
);
alter table wishes enable row level security;
create policy "Желания видны всем" on wishes for select using (true);
create policy "Можно публиковать свои желания" on wishes for insert with check (auth.uid() = user_id);
create policy "Можно обновлять счётчик поддержки" on wishes for update using (true);

-- Кто кого поддержал (чтобы нельзя было лайкнуть дважды)
create table wish_supports (
  wish_id uuid references wishes not null,
  user_id uuid references auth.users not null,
  primary key (wish_id, user_id)
);
alter table wish_supports enable row level security;
create policy "Поддержки видны всем" on wish_supports for select using (true);
create policy "Можно поддержать от своего имени" on wish_supports for insert with check (auth.uid() = user_id);

-- Темы форума
create table forum_topics (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  user_id uuid references auth.users not null,
  author_name text not null,
  created_at timestamptz not null default now()
);
alter table forum_topics enable row level security;
create policy "Темы видны всем" on forum_topics for select using (true);
create policy "Можно создавать темы от своего имени" on forum_topics for insert with check (auth.uid() = user_id);

-- Ответы в темах
create table forum_replies (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references forum_topics not null,
  user_id uuid references auth.users not null,
  author_name text not null,
  text text not null,
  created_at timestamptz not null default now()
);
alter table forum_replies enable row level security;
create policy "Ответы видны всем" on forum_replies for select using (true);
create policy "Можно отвечать от своего имени" on forum_replies for insert with check (auth.uid() = user_id);

-- Дневник (личный, виден только владельцу)
create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  entry_date date not null,
  text text not null,
  created_at timestamptz not null default now(),
  unique(user_id, entry_date)
);
alter table journal_entries enable row level security;
create policy "Записи видны только автору" on journal_entries for select using (auth.uid() = user_id);
create policy "Можно создавать свои записи" on journal_entries for insert with check (auth.uid() = user_id);
create policy "Можно менять свои записи" on journal_entries for update using (auth.uid() = user_id);

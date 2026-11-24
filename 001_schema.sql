-- Run this in Supabase SQL Editor.
create table if not exists public.profiles (
  telegram_id bigint primary key,
  display_name text not null default 'بازیکن',
  username text,
  points integer not null default 0 check (points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.score_events (
  id bigint generated always as identity primary key,
  telegram_id bigint not null references public.profiles(telegram_id) on delete cascade,
  points integer not null check (points > 0 and points <= 100),
  reason text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.missions (
  id text primary key,
  title text not null,
  description text not null,
  reward integer not null check (reward >= 0),
  active boolean not null default true
);
create table if not exists public.user_missions (
  telegram_id bigint not null references public.profiles(telegram_id) on delete cascade,
  mission_id text not null references public.missions(id) on delete cascade,
  completed_on date not null default current_date,
  primary key (telegram_id, mission_id, completed_on)
);

insert into public.missions(id,title,description,reward) values
('visit_app','به DOPAMINE سر بزن','امروز وارد مینی‌اپ شو',5),
('play_once','یک مسابقه انجام بده','حداقل یک مسابقه را کامل کن',20),
('three_correct','سه پاسخ درست بده','در مسابقه سه پاسخ درست بده',30)
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.score_events enable row level security;
alter table public.missions enable row level security;
alter table public.user_missions enable row level security;

-- No public write policies. All trusted writes happen through the Edge Function
-- using the service-role key, which must never be exposed to the browser.
create policy "read active missions" on public.missions for select using (active = true);

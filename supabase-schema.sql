-- =========================================================================
-- SQL SCHEMA AGENDA HARIAN MAN 1 NGANJUK
-- Jalankan skrip ini di Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =========================================================================

-- 1. TABEL AGENDA
create table if not exists public.agenda (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  judul text not null,
  tgl date not null,
  tgl_end date,
  mulai text not null,
  selesai text,
  kat text not null,
  lokasi text,
  peserta text,
  ket text,
  status text default 'Terjadwal' not null,
  hasil text,
  owner text not null
);

-- Index untuk mempercepat query kalender & pencarian
create index if not exists idx_agenda_tgl on public.agenda (tgl);
create index if not exists idx_agenda_owner on public.agenda (owner);
create index if not exists idx_agenda_kat on public.agenda (kat);
create index if not exists idx_agenda_status on public.agenda (status);

-- 2. TABEL ROLE_PINS (PROTEKSI PIN PER JABATAN)
create table if not exists public.role_pins (
  role_key text primary key,
  role_name text not null,
  pin text not null default '1234',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ROW LEVEL SECURITY (RLS)
alter table public.agenda enable row level security;
alter table public.role_pins enable row level security;

-- Policy untuk tabel agenda (Akses Publik via Anon Key)
drop policy if exists "Allow read all agenda" on public.agenda;
create policy "Allow read all agenda" on public.agenda for select using (true);

drop policy if exists "Allow insert agenda" on public.agenda;
create policy "Allow insert agenda" on public.agenda for insert with check (true);

drop policy if exists "Allow update agenda" on public.agenda;
create policy "Allow update agenda" on public.agenda for update using (true);

drop policy if exists "Allow delete agenda" on public.agenda;
create policy "Allow delete agenda" on public.agenda for delete using (true);

-- Policy untuk tabel role_pins
drop policy if exists "Allow read role_pins" on public.role_pins;
create policy "Allow read role_pins" on public.role_pins for select using (true);

drop policy if exists "Allow insert role_pins" on public.role_pins;
create policy "Allow insert role_pins" on public.role_pins for insert with check (true);

drop policy if exists "Allow update role_pins" on public.role_pins;
create policy "Allow update role_pins" on public.role_pins for update using (true);

-- 4. AKTIFKAN REALTIME REPLICATION (SUPABASE REALTIME)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'agenda'
  ) then
    alter publication supabase_realtime add table public.agenda;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'role_pins'
  ) then
    alter publication supabase_realtime add table public.role_pins;
  end if;
end $$;

-- 5. SEED DATA DEFAULT PIN (1234 UNTUK SEMUA JABATAN)
insert into public.role_pins (role_key, role_name, pin) values
('kamad0', 'Kepala Madrasah', '1234'),
('kamad1', 'Asisten Kepala Madrasah 1', '1234'),
('kamad2', 'Asisten Kepala Madrasah 2', '1234'),
('ktu0', 'KTU', '1234'),
('ktu1', 'Asisten KTU 1', '1234'),
('ktu2', 'Asisten KTU 2', '1234'),
('akd0', 'Waka Akademik', '1234'),
('akd1', 'Asisten Waka Akademik 1', '1234'),
('akd2', 'Asisten Waka Akademik 2', '1234'),
('sis0', 'Waka Kesiswaan', '1234'),
('sis1', 'Asisten Waka Kesiswaan 1', '1234'),
('sis2', 'Asisten Waka Kesiswaan 2', '1234'),
('sar0', 'Waka Sarana Prasarana', '1234'),
('sar1', 'Asisten Waka Sarana Prasarana 1', '1234'),
('sar2', 'Asisten Waka Sarana Prasarana 2', '1234'),
('hum0', 'Waka Kehumasan', '1234'),
('hum1', 'Asisten Waka Kehumasan 1', '1234'),
('hum2', 'Asisten Waka Kehumasan 2', '1234')
on conflict (role_key) do nothing;

-- =========================================================================
-- SQL SCHEMA AGENDA HARIAN MAN 1 NGANJUK (LENGKAP: TEMPLATE & NAMA PEJABAT)
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
  tautan text,
  status text default 'Terjadwal' not null,
  hasil text,
  owner text not null
);

-- Pastikan kolom tautan ada jika tabel agenda sudah pernah dibuat sebelumnya
alter table public.agenda add column if not exists tautan text;

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

-- 3. TABEL ROLE_PROFILES (NAMA PEJABAT & NIP PER JABATAN)
create table if not exists public.role_profiles (
  role_key text primary key,
  pejabat_name text not null default '',
  nip text default '',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TABEL AGENDA_TEMPLATES (MASTER TEMPLATE KEGIATAN RUTIN)
create table if not exists public.agenda_templates (
  id text primary key,
  nama text not null,
  judul text not null,
  kat text not null,
  mulai text not null,
  selesai text,
  lokasi text,
  peserta text,
  ket text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ROW LEVEL SECURITY (RLS)
alter table public.agenda enable row level security;
alter table public.role_pins enable row level security;
alter table public.role_profiles enable row level security;
alter table public.agenda_templates enable row level security;

-- Policies Agenda
drop policy if exists "Allow read all agenda" on public.agenda;
create policy "Allow read all agenda" on public.agenda for select using (true);

drop policy if exists "Allow insert agenda" on public.agenda;
create policy "Allow insert agenda" on public.agenda for insert with check (true);

drop policy if exists "Allow update agenda" on public.agenda;
create policy "Allow update agenda" on public.agenda for update using (true);

drop policy if exists "Allow delete agenda" on public.agenda;
create policy "Allow delete agenda" on public.agenda for delete using (true);

-- Policies Role Pins
drop policy if exists "Allow read role_pins" on public.role_pins;
create policy "Allow read role_pins" on public.role_pins for select using (true);

drop policy if exists "Allow insert role_pins" on public.role_pins;
create policy "Allow insert role_pins" on public.role_pins for insert with check (true);

drop policy if exists "Allow update role_pins" on public.role_pins;
create policy "Allow update role_pins" on public.role_pins for update using (true);

-- Policies Role Profiles
drop policy if exists "Allow read role_profiles" on public.role_profiles;
create policy "Allow read role_profiles" on public.role_profiles for select using (true);

drop policy if exists "Allow insert role_profiles" on public.role_profiles;
create policy "Allow insert role_profiles" on public.role_profiles for insert with check (true);

drop policy if exists "Allow update role_profiles" on public.role_profiles;
create policy "Allow update role_profiles" on public.role_profiles for update using (true);

-- Policies Agenda Templates
drop policy if exists "Allow read agenda_templates" on public.agenda_templates;
create policy "Allow read agenda_templates" on public.agenda_templates for select using (true);

drop policy if exists "Allow insert agenda_templates" on public.agenda_templates;
create policy "Allow insert agenda_templates" on public.agenda_templates for insert with check (true);

drop policy if exists "Allow update agenda_templates" on public.agenda_templates;
create policy "Allow update agenda_templates" on public.agenda_templates for update using (true);

drop policy if exists "Allow delete agenda_templates" on public.agenda_templates;
create policy "Allow delete agenda_templates" on public.agenda_templates for delete using (true);

-- 6. AKTIFKAN REALTIME SINKRONISASI UNTUK SEMUA TABEL
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'agenda') then
    alter publication supabase_realtime add table public.agenda;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'role_pins') then
    alter publication supabase_realtime add table public.role_pins;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'role_profiles') then
    alter publication supabase_realtime add table public.role_profiles;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'agenda_templates') then
    alter publication supabase_realtime add table public.agenda_templates;
  end if;
end $$;

-- 7. SEED DATA DEFAULT PIN (1234)
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

-- 8. SEED DATA DEFAULT TEMPLATES
insert into public.agenda_templates (id, nama, judul, kat, mulai, selesai, lokasi, peserta, ket) values
('tpl-1', 'Upacara Bendera Hari Senin', 'Upacara Bendera Hari Senin & Pengarahan Pembina', 'Kesiswaan', '07:00', '07:45', 'Lapangan Utama Madrasah', 'Seluruh Dewan Guru, Tenaga Kependidikan, dan Siswa', 'Pakaian PSH / Seragam Kemenag rapi lengkap.'),
('tpl-2', 'Rapat Koordinasi Pimpinan (Kamad & Waka)', 'Rapat Koordinasi Evaluasi Mingguan Pimpinan', 'Rapat', '08:30', '10:30', 'Ruang Kepala Madrasah', 'Kepala Madrasah, KTU, dan Seluruh Waka', 'Membahas evaluasi program kerja dan agenda kedinasan sepekan ke depan.'),
('tpl-3', 'Rapat Pleno Dewan Guru & Karyawan', 'Rapat Pleno Dewan Guru dan Tenaga Kependidikan', 'Rapat', '13:00', '15:30', 'Aula Utama MAN 1 Nganjuk', 'Seluruh Guru dan Karyawan', 'Membawa berkas administrasi dan perangkat ajar.'),
('tpl-4', 'Pembiasaan Pagi (Sholat Dhuha & Istighosah)', 'Pembiasaan Sholat Dhuha Berjamaah & Tadarus Al-Quran', 'Keagamaan', '06:45', '07:20', 'Masjid Madrasah', 'Seluruh Siswa dan Guru Pembina', 'Membawa mushaf Al-Quran dan perlengkapan sholat masing-masing.'),
('tpl-5', 'Supervisi Akademik & KBM Terjadwal', 'Supervisi Akademik Pembelajaran di Kelas', 'KBM/Ujian', '08:00', '11:00', 'Ruang Kelas Pembelajaran', 'Guru Mata Pelajaran dan Tim Penilai Supervisi', 'Menyiapkan RPP / Modul Ajar dan instrumen asesmen.'),
('tpl-6', 'Senam Sehat & Gerakan Kebersihan Lingkungan', 'Jumat Bersih & Senam Kesegaran Jasmani', 'Kesiswaan', '06:30', '08:00', 'Lapangan & Lingkungan Madrasah', 'Seluruh Warga Madrasah', 'Pakaian olahraga madrasah dan membawa perlengkapan kebersihan kelas.')
on conflict (id) do nothing;

-- =====================================================================
-- Nahki – backend minimal (Supabase / PostgreSQL)
-- À coller dans Supabase : SQL Editor > New query > Run.
-- Le script peut être relancé sans erreur.
-- =====================================================================

-- ---------- 1. Profils : un par compte, avec son rôle ----------
create table if not exists public.profils (
  id      uuid primary key references auth.users (id) on delete cascade,
  prenom  text not null default '',
  role    text not null default 'parent' check (role in ('parent', 'pro')),
  cree_le timestamptz not null default now()
);

-- Crée automatiquement le profil à l'inscription (rôle « parent »).
-- Les comptes orthophonistes sont passés en « pro » par l'équipe (voir la fin du fichier).
create or replace function public.creer_profil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profils (id, prenom)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'prenom', ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists a_l_inscription on auth.users;
create trigger a_l_inscription
  after insert on auth.users
  for each row execute function public.creer_profil();

-- Vrai si l'utilisateur connecté est orthophoniste
create or replace function public.est_pro()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profils where id = auth.uid() and role = 'pro');
$$;

-- ---------- 2. Pictos partagés : la bibliothèque ----------
create table if not exists public.pictos_partages (
  id          uuid primary key default gen_random_uuid(),
  auteur      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  mot         text not null check (char_length(mot) between 1 and 24),
  mot_ar      text,
  categorie   text not null check (categorie in ('manger','boire','besoins','emotions','actions','lieux','personnes','photos')),
  image_path  text not null,
  son_path    text,
  statut      text not null default 'en_attente' check (statut in ('en_attente','publie','refuse')),
  motif       text,
  decide_par  uuid references auth.users (id),
  decide_le   timestamptz,
  cree_le     timestamptz not null default now()
);

create index if not exists pictos_partages_statut on public.pictos_partages (statut, cree_le desc);

-- ---------- 3. Règles d'accès (Row Level Security) ----------
alter table public.profils enable row level security;
alter table public.pictos_partages enable row level security;

drop policy if exists "lire son profil" on public.profils;
create policy "lire son profil" on public.profils
  for select to authenticated using (id = auth.uid());

-- Tout le monde (même sans compte) voit les pictos publiés
drop policy if exists "lire les publies" on public.pictos_partages;
create policy "lire les publies" on public.pictos_partages
  for select to anon, authenticated using (statut = 'publie');

-- Un parent voit aussi ses propres propositions, quel que soit leur statut
drop policy if exists "lire ses propositions" on public.pictos_partages;
create policy "lire ses propositions" on public.pictos_partages
  for select to authenticated using (auteur = auth.uid());

-- Un orthophoniste voit tout
drop policy if exists "pro lit tout" on public.pictos_partages;
create policy "pro lit tout" on public.pictos_partages
  for select to authenticated using (public.est_pro());

-- Un parent connecté propose un picto : toujours à son nom et « en attente »
drop policy if exists "proposer" on public.pictos_partages;
create policy "proposer" on public.pictos_partages
  for insert to authenticated with check (auteur = auth.uid() and statut = 'en_attente');

-- Seul un orthophoniste valide, refuse ou retire
drop policy if exists "pro decide" on public.pictos_partages;
create policy "pro decide" on public.pictos_partages
  for update to authenticated using (public.est_pro()) with check (public.est_pro());

-- ---------- 4. Stockage des images et des sons ----------
insert into storage.buckets (id, name, public)
values ('pictos', 'pictos', true)
on conflict (id) do nothing;

-- Un parent connecté dépose ses fichiers dans son propre dossier : pictos/<son id>/...
drop policy if exists "deposer ses fichiers" on storage.objects;
create policy "deposer ses fichiers" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'pictos' and (storage.foldername(name))[1] = auth.uid()::text);

-- =====================================================================
-- Après avoir créé le compte de l'orthophoniste dans le site, le passer en « pro » :
--   update public.profils set role = 'pro'
--   where id = (select id from auth.users where email = 'ortho@exemple.tn');
-- =====================================================================

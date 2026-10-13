-- Flozea — partage par sections entre les membres d'un foyer.
--
-- Principe : chaque ligne appartient à une personne (owner_id). Par défaut, les autres membres du
-- foyer NE VOIENT PAS ses données. Le propriétaire choisit, membre par membre et section par section
-- (courses, tâches, finance, notes), ce qu'il partage — en lecture seule ("view") ou avec modification
-- ("edit", jamais pour la finance). Un projet peut aussi être partagé seul.
--
-- ÉTAT : APPLIQUÉ le 2026-10-13 sur le projet Supabase de Flozea, en plusieurs migrations
-- (member_sharing_1 … member_sharing_4), après sauvegarde dans le schéma `backup_20261013`.
-- Ce fichier regroupe ce qui a été appliqué, dans l'ordre. Rien n'est supprimé : colonnes ajoutées et
-- remplies, anciennes colonnes / contraintes conservées, anciennes politiques RÉÉCRITES sur place
-- (ALTER POLICY) au lieu d'être supprimées.
--
-- Pas encore fait (à faire avec le déploiement du code correspondant) :
--   * changer les anciens jetons du foyer (households.ical_token / wallet_token), devenus inutiles :
--       update public.households set ical_token = gen_random_uuid(), wallet_token = gen_random_uuid() where id is not null;
--   * remplacer les contraintes d'unicité par foyer (balance_entries, forecast_snapshots, tax_profiles)
--     par les index par personne ci-dessous (qui existent déjà en parallèle).

-- ───────────── 1. Propriétaire de chaque ligne (member_sharing_1) ─────────────
create or replace function public.household_owner(h uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.profiles where household_id = h order by created_at, id limit 1;
$$;

create or replace function public._owner_tables() returns text[]
language sql immutable as $$
  select array['projects','tasks','routines','lists','recipes','menu_items','item_locations','notes','vocab_words',
    'balance_entries','bank_connections','finance_categories','forecast_snapshots','incomes','investments',
    'recurring_charges','tax_profiles','transactions','variable_budgets'];
$$;

do $$
declare t text;
begin
  foreach t in array public._owner_tables() loop
    execute format('alter table public.%I add column if not exists owner_id uuid', t);
  end loop;
end $$;

-- Remplissage : le créateur quand on le connaît, sinon le premier membre du foyer.
update public.projects           set owner_id = coalesce(created_by, public.household_owner(household_id)) where owner_id is null;
update public.tasks              set owner_id = coalesce(created_by, public.household_owner(household_id)) where owner_id is null;
update public.routines           set owner_id = coalesce(user_id,    public.household_owner(household_id)) where owner_id is null;
update public.lists              set owner_id = coalesce(created_by, public.household_owner(household_id)) where owner_id is null;
update public.recipes            set owner_id = coalesce(created_by, public.household_owner(household_id)) where owner_id is null;
update public.menu_items         set owner_id = coalesce(created_by, public.household_owner(household_id)) where owner_id is null;
update public.notes              set owner_id = coalesce(created_by, public.household_owner(household_id)) where owner_id is null;
update public.vocab_words        set owner_id = coalesce(created_by, public.household_owner(household_id)) where owner_id is null;
update public.incomes            set owner_id = coalesce(created_by, public.household_owner(household_id)) where owner_id is null;
update public.investments        set owner_id = coalesce(created_by, public.household_owner(household_id)) where owner_id is null;
update public.recurring_charges  set owner_id = coalesce(created_by, public.household_owner(household_id)) where owner_id is null;
update public.transactions       set owner_id = coalesce(created_by, public.household_owner(household_id)) where owner_id is null;
update public.item_locations     set owner_id = public.household_owner(household_id) where owner_id is null;
update public.balance_entries    set owner_id = public.household_owner(household_id) where owner_id is null;
update public.bank_connections   set owner_id = public.household_owner(household_id) where owner_id is null;
update public.finance_categories set owner_id = public.household_owner(household_id) where owner_id is null;
update public.forecast_snapshots set owner_id = public.household_owner(household_id) where owner_id is null;
update public.tax_profiles       set owner_id = public.household_owner(household_id) where owner_id is null;
update public.variable_budgets   set owner_id = public.household_owner(household_id) where owner_id is null;

do $$
declare t text;
begin
  foreach t in array public._owner_tables() loop
    execute format('alter table public.%I alter column owner_id set default auth.uid()', t);
    execute format('alter table public.%I alter column owner_id set not null', t);
    execute format('create index if not exists %I on public.%I (owner_id)', t || '_owner_id_idx', t);
  end loop;
end $$;

-- ───────────── 2. Tables de partage, jetons et réglages personnels (member_sharing_2) ─────────────
alter table public.profiles add column if not exists share_defaults jsonb not null default '{"courses":"edit"}'::jsonb;

create table if not exists public.member_shares (
  household_id uuid not null references public.households(id) on delete cascade,
  owner_id     uuid not null,
  member_id    uuid not null,
  section      text not null check (section in ('courses','tasks','finance','notes')),
  can_edit     boolean not null default false,
  created_at   timestamptz not null default now(),
  primary key (owner_id, member_id, section),
  check (owner_id <> member_id),
  check (not (section = 'finance' and can_edit))
);
create index if not exists member_shares_member_idx on public.member_shares (member_id);
alter table public.member_shares enable row level security;

create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  owner_id   uuid not null,
  member_id  uuid not null,
  can_edit   boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (project_id, member_id),
  check (owner_id <> member_id)
);
create index if not exists project_members_member_idx on public.project_members (member_id);
alter table public.project_members enable row level security;

-- Jetons personnels (flux iCal, Wallet) : jusqu'ici au niveau du foyer, donc lisibles par tous les membres.
create table if not exists public.user_tokens (
  user_id      uuid primary key,
  ical_token   uuid not null unique default gen_random_uuid(),
  wallet_token uuid not null unique default gen_random_uuid(),
  created_at   timestamptz not null default now()
);
alter table public.user_tokens enable row level security;

-- Réglages financiers personnels (solde de repli, objectifs) : jusqu'ici sur le foyer.
create table if not exists public.finance_settings (
  owner_id         uuid primary key,
  current_balance  numeric not null default 0,
  balance_ref_date date    not null default current_date,
  savings_goal     numeric not null default 0,
  investment_goal  numeric not null default 0,
  updated_at       timestamptz not null default now()
);
alter table public.finance_settings enable row level security;

-- Reprise des jetons et réglages existants : ils vont au premier membre du foyer (celui qui a créé les
-- données), ce qui garde valides les liens iCal / Wallet déjà configurés.
insert into public.user_tokens (user_id, ical_token, wallet_token)
select p.id,
       case when p.id = public.household_owner(p.household_id) then h.ical_token   else gen_random_uuid() end,
       case when p.id = public.household_owner(p.household_id) then h.wallet_token else gen_random_uuid() end
from public.profiles p left join public.households h on h.id = p.household_id
on conflict (user_id) do nothing;

insert into public.finance_settings (owner_id, current_balance, balance_ref_date, savings_goal, investment_goal)
select p.id,
       case when p.id = public.household_owner(p.household_id) then coalesce(h.current_balance, 0) else 0 end,
       case when p.id = public.household_owner(p.household_id) then coalesce(h.balance_ref_date, current_date) else current_date end,
       case when p.id = public.household_owner(p.household_id) then coalesce(h.savings_goal, 0) else 0 end,
       case when p.id = public.household_owner(p.household_id) then coalesce(h.investment_goal, 0) else 0 end
from public.profiles p left join public.households h on h.id = p.household_id
on conflict (owner_id) do nothing;

-- ───────────── 3. Fonctions d'accès et de partage (member_sharing_3a*) ─────────────
create or replace function public.can_see(p_owner uuid, p_section text) returns boolean
language sql stable security definer set search_path = public as $$
  select p_owner = auth.uid() or exists (
    select 1 from public.member_shares s
    join public.profiles po on po.id = s.owner_id
    join public.profiles pm on pm.id = s.member_id
    where s.owner_id = p_owner and s.member_id = auth.uid() and s.section = p_section
      and po.household_id is not null and po.household_id = pm.household_id);
$$;

create or replace function public.can_edit(p_owner uuid, p_section text) returns boolean
language sql stable security definer set search_path = public as $$
  select p_owner = auth.uid() or exists (
    select 1 from public.member_shares s
    join public.profiles po on po.id = s.owner_id
    join public.profiles pm on pm.id = s.member_id
    where s.owner_id = p_owner and s.member_id = auth.uid() and s.section = p_section and s.can_edit
      and po.household_id is not null and po.household_id = pm.household_id);
$$;

create or replace function public.project_access(p_project uuid, p_need_edit boolean) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.project_members pm
    join public.projects pr on pr.id = pm.project_id
    join public.profiles po on po.id = pm.owner_id
    join public.profiles pu on pu.id = pm.member_id
    where pm.project_id = p_project and pm.member_id = auth.uid()
      and pr.owner_id = pm.owner_id
      and po.household_id is not null and po.household_id = pu.household_id
      and (not p_need_edit or pm.can_edit));
$$;

-- Donne / retire / change l'accès d'un membre à une section. level : none | view | edit.
create or replace function public.set_member_share(p_member uuid, p_section text, p_level text) returns void
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); hh uuid;
begin
  if me is null then raise exception 'Non connecté'; end if;
  if p_section not in ('courses','tasks','finance','notes') then raise exception 'Section inconnue'; end if;
  if p_level not in ('none','view','edit') then raise exception 'Niveau inconnu'; end if;
  select household_id into hh from public.profiles where id = me;
  if hh is null or p_member = me or not exists (select 1 from public.profiles where id = p_member and household_id = hh) then
    raise exception 'Membre introuvable dans ton foyer';
  end if;
  if p_level = 'none' then
    delete from public.member_shares where owner_id = me and member_id = p_member and section = p_section;
  else
    insert into public.member_shares (household_id, owner_id, member_id, section, can_edit)
    values (hh, me, p_member, p_section, p_level = 'edit' and p_section <> 'finance')
    on conflict (owner_id, member_id, section) do update set can_edit = excluded.can_edit, household_id = excluded.household_id;
  end if;
end $$;

-- Partage (ou retire) un projet précis avec un membre. level : none | view | edit.
create or replace function public.set_project_member(p_project uuid, p_member uuid, p_level text) returns void
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); hh uuid;
begin
  if me is null then raise exception 'Non connecté'; end if;
  if p_level not in ('none','view','edit') then raise exception 'Niveau inconnu'; end if;
  select household_id into hh from public.profiles where id = me;
  if not exists (select 1 from public.projects where id = p_project and owner_id = me) then raise exception 'Ce projet n''est pas à toi'; end if;
  if p_member = me or not exists (select 1 from public.profiles where id = p_member and household_id = hh) then
    raise exception 'Membre introuvable dans ton foyer';
  end if;
  if p_level = 'none' then
    delete from public.project_members where project_id = p_project and member_id = p_member;
  else
    insert into public.project_members (project_id, owner_id, member_id, can_edit)
    values (p_project, me, p_member, p_level = 'edit')
    on conflict (project_id, member_id) do update set can_edit = excluded.can_edit;
  end if;
end $$;

-- Applique les réglages « à l'arrivée d'un nouveau membre » de p_owner (profiles.share_defaults) pour p_member.
create or replace function public._apply_default_shares(p_owner uuid, p_member uuid) returns void
language plpgsql security definer set search_path = public as $$
declare hh uuid; sec text; lvl text;
begin
  select household_id into hh from public.profiles where id = p_owner;
  if hh is null then return; end if;
  for sec, lvl in select key, value from jsonb_each_text((select share_defaults from public.profiles where id = p_owner)) loop
    if sec in ('courses','tasks','finance','notes') and lvl in ('view','edit') then
      insert into public.member_shares (household_id, owner_id, member_id, section, can_edit)
      values (hh, p_owner, p_member, sec, lvl = 'edit' and sec <> 'finance')
      on conflict (owner_id, member_id, section) do nothing;
    end if;
  end loop;
end $$;

-- Une tâche créée par un invité dans un projet partagé reste au propriétaire du projet.
create or replace function public.tasks_inherit_project_owner() returns trigger
language plpgsql security definer set search_path = public as $$
declare po uuid; ph uuid;
begin
  if new.project_id is not null then
    select owner_id, household_id into po, ph from public.projects where id = new.project_id;
    if po is not null and po <> new.owner_id
       and (public.can_edit(po, 'tasks') or public.project_access(new.project_id, true)) then
      new.owner_id := po;
      new.household_id := ph;
    end if;
  end if;
  return new;
end $$;
create trigger tasks_inherit_project_owner before insert on public.tasks
  for each row execute function public.tasks_inherit_project_owner();

-- Création de compte : un foyer personnel, plus ses jetons et ses réglages financiers.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  hh_id uuid;
  display text := coalesce(
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );
begin
  insert into public.households (name) values ('Espace de ' || display) returning id into hh_id;
  insert into public.profiles (id, household_id, display_name, avatar_url)
  values (new.id, hh_id, display, new.raw_user_meta_data->>'avatar_url');
  insert into public.user_tokens (user_id) values (new.id) on conflict do nothing;
  insert into public.finance_settings (owner_id) values (new.id) on conflict do nothing;
  return new;
end $$;

-- Rejoindre un foyer : les données de la personne la SUIVENT (privées par défaut) au lieu d'être supprimées.
-- L'ancien foyer, devenu vide, est laissé en place. Les anciens partages deviennent inactifs d'eux-mêmes
-- (can_see exige le même foyer).
create or replace function public.join_household(code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); target uuid; old uuid; others int; t text; m uuid;
begin
  if me is null then raise exception 'Non connecté'; end if;
  select id into target from public.households where invite_code = code;
  if target is null then raise exception 'Code invalide'; end if;
  select household_id into old from public.profiles where id = me;
  if old is not distinct from target then return target; end if;

  if old is not null then
    select count(*) into others from public.profiles where household_id = old and id <> me;
    foreach t in array public._owner_tables() loop
      execute format('update public.%I set household_id = $1 where household_id = $2 and owner_id = $3', t) using target, old, me;
    end loop;
    if others = 0 then
      update public.ingredients i set household_id = target
       where household_id = old and not exists (select 1 from public.ingredients j where j.household_id = target and lower(j.name) = lower(i.name));
      update public.ingredient_prices ip set household_id = target
       where household_id = old and exists (select 1 from public.ingredients j where j.id = ip.ingredient_id and j.household_id = target)
         and not exists (select 1 from public.ingredient_prices q where q.ingredient_id = ip.ingredient_id and q.store = ip.store and q.household_id = target);
    end if;
  end if;

  update public.profiles set household_id = target where id = me;

  for m in select id from public.profiles where household_id = target and id <> me loop
    perform public._apply_default_shares(m, me);
    perform public._apply_default_shares(me, m);
  end loop;
  return target;
end $$;

-- Flux iCal : les tâches de la personne et celles qu'on lui partage (et non plus celles de tout le foyer).
create or replace function public.calendar_feed(p_token uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  with u as (
    select ut.user_id, p.household_id from public.user_tokens ut
    join public.profiles p on p.id = ut.user_id where ut.ical_token = p_token
  )
  select case when u.user_id is null then null else jsonb_build_object(
    'name', h.name,
    'tasks', coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'title', t.title, 'due_date', t.due_date, 'due_time', t.due_time, 'status', t.status, 'description', t.description))
       from public.tasks t where t.household_id = u.household_id and t.due_date is not null
        and (t.owner_id = u.user_id
             or exists (select 1 from public.member_shares s where s.owner_id = t.owner_id and s.member_id = u.user_id and s.section = 'tasks')
             or (t.project_id is not null and exists (select 1 from public.project_members pm where pm.project_id = t.project_id and pm.member_id = u.user_id)))), '[]'::jsonb),
    'routines', coalesce((select jsonb_agg(jsonb_build_object('id', r.id, 'title', r.title, 'frequency', r.frequency, 'days_of_week', r.days_of_week, 'created_at', r.created_at))
       from public.routines r where r.household_id = u.household_id and r.active
        and (r.owner_id = u.user_id or exists (select 1 from public.member_shares s where s.owner_id = r.owner_id and s.member_id = u.user_id and s.section = 'tasks'))), '[]'::jsonb)
  ) end
  from (select 1) x left join u on true left join public.households h on h.id = u.household_id;
$$;

-- Paiements Wallet : rangés dans les finances de la personne propriétaire du jeton.
create or replace function public.ingest_wallet_txn(p_token uuid, p_merchant text, p_amount numeric, p_date date, p_time time without time zone, p_card text, p_category text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid; hh uuid; dup uuid; new_id uuid;
begin
  select ut.user_id, p.household_id into uid, hh from public.user_tokens ut join public.profiles p on p.id = ut.user_id where ut.wallet_token = p_token;
  if uid is null or hh is null then
    return jsonb_build_object('ok', false, 'error', 'invalid_token');
  end if;
  if p_amount is null or p_amount = 0 or abs(p_amount) > 100000 then
    return jsonb_build_object('ok', false, 'error', 'invalid_amount');
  end if;
  select id into dup from public.transactions
   where household_id = hh and owner_id = uid and source = 'wallet' and lower(coalesce(merchant, label)) = lower(coalesce(p_merchant, ''))
     and amount = abs(p_amount) and txn_date = p_date
     and (txn_time is null or p_time is null or abs(extract(epoch from (txn_time - p_time))) < 180)
   limit 1;
  if dup is not null then
    return jsonb_build_object('ok', true, 'duplicate', true, 'id', dup);
  end if;
  insert into public.transactions (household_id, owner_id, created_by, label, merchant, amount, kind, txn_date, txn_time, card, category, source)
  values (hh, uid, uid, left(coalesce(nullif(trim(p_merchant), ''), 'Paiement carte'), 120), left(nullif(trim(p_merchant), ''), 120), abs(p_amount),
          case when p_amount < 0 then 'income'::finance_kind else 'expense'::finance_kind end,
          p_date, p_time, left(nullif(trim(p_card), ''), 60), left(nullif(trim(p_category), ''), 60), 'wallet')
  returning id into new_id;
  return jsonb_build_object('ok', true, 'duplicate', false, 'id', new_id);
end $$;

revoke execute on function public.set_member_share(uuid, text, text) from public, anon;
revoke execute on function public.set_project_member(uuid, uuid, text) from public, anon;
revoke execute on function public._apply_default_shares(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.join_household(text) from public, anon;
grant execute on function public.set_member_share(uuid, text, text) to authenticated;
grant execute on function public.set_project_member(uuid, uuid, text) to authenticated;
grant execute on function public.join_household(text) to authenticated;

-- Les membres actuels d'un même foyer gardent leurs courses en commun (comme avant) ; le reste devient privé.
select public._apply_default_shares('e28765d7-1128-4441-a8ee-be08032ee585', 'c2198eb4-9ce0-4168-ad23-db7ec0c0a632');
select public._apply_default_shares('c2198eb4-9ce0-4168-ad23-db7ec0c0a632', 'e28765d7-1128-4441-a8ee-be08032ee585');

-- ───────────── 4. Règles d'accès par ligne (member_sharing_3b*) ─────────────
-- Pour chaque table : une règle de LECTURE (can_see) ajoutée, et l'ancienne règle « tout » du foyer
-- réécrite sur place pour ne plus autoriser l'écriture qu'avec can_edit.

-- Courses : listes, recettes, menu, emplacements (+ enfants qui suivent leur parent).
create policy "share select lists" on public.lists for select using (household_id = public.current_household_id() and public.can_see(owner_id, 'courses'));
create policy "share select recipes" on public.recipes for select using (household_id = public.current_household_id() and public.can_see(owner_id, 'courses'));
create policy "share select menu_items" on public.menu_items for select using (household_id = public.current_household_id() and public.can_see(owner_id, 'courses'));
create policy "share select item_locations" on public.item_locations for select using (household_id = public.current_household_id() and public.can_see(owner_id, 'courses'));
alter policy "hh all lists" on public.lists using (household_id = public.current_household_id() and public.can_edit(owner_id, 'courses')) with check (household_id = public.current_household_id() and public.can_edit(owner_id, 'courses'));
alter policy "hh all recipes" on public.recipes using (household_id = public.current_household_id() and public.can_edit(owner_id, 'courses')) with check (household_id = public.current_household_id() and public.can_edit(owner_id, 'courses'));
alter policy "hh all menu_items" on public.menu_items using (household_id = public.current_household_id() and public.can_edit(owner_id, 'courses')) with check (household_id = public.current_household_id() and public.can_edit(owner_id, 'courses'));
alter policy "hh all item_locations" on public.item_locations using (household_id = public.current_household_id() and public.can_edit(owner_id, 'courses')) with check (household_id = public.current_household_id() and public.can_edit(owner_id, 'courses'));
create policy "share select list_items" on public.list_items for select using (exists (select 1 from public.lists l where l.id = list_items.list_id));
create policy "share select list_recipes" on public.list_recipes for select using (exists (select 1 from public.lists l where l.id = list_recipes.list_id));
create policy "share select recipe_items" on public.recipe_items for select using (exists (select 1 from public.recipes r where r.id = recipe_items.recipe_id));
alter policy "hh all list_items" on public.list_items using (exists (select 1 from public.lists l where l.id = list_items.list_id and public.can_edit(l.owner_id, 'courses'))) with check (exists (select 1 from public.lists l where l.id = list_items.list_id and public.can_edit(l.owner_id, 'courses')));
alter policy "hh all list_recipes" on public.list_recipes using (exists (select 1 from public.lists l where l.id = list_recipes.list_id and public.can_edit(l.owner_id, 'courses'))) with check (exists (select 1 from public.lists l where l.id = list_recipes.list_id and public.can_edit(l.owner_id, 'courses')));
alter policy "hh all recipe_items" on public.recipe_items using (exists (select 1 from public.recipes r where r.id = recipe_items.recipe_id and public.can_edit(r.owner_id, 'courses'))) with check (exists (select 1 from public.recipes r where r.id = recipe_items.recipe_id and public.can_edit(r.owner_id, 'courses')));

-- Notes et vocabulaire.
create policy "share select notes" on public.notes for select using (household_id = public.current_household_id() and public.can_see(owner_id, 'notes'));
create policy "share select vocab_words" on public.vocab_words for select using (household_id = public.current_household_id() and public.can_see(owner_id, 'notes'));
alter policy "hh all notes" on public.notes using (household_id = public.current_household_id() and public.can_edit(owner_id, 'notes')) with check (household_id = public.current_household_id() and public.can_edit(owner_id, 'notes'));
alter policy "hh all vocab_words" on public.vocab_words using (household_id = public.current_household_id() and public.can_edit(owner_id, 'notes')) with check (household_id = public.current_household_id() and public.can_edit(owner_id, 'notes'));

-- Routines et leurs coches.
create policy "share select routines" on public.routines for select using (household_id = public.current_household_id() and public.can_see(owner_id, 'tasks'));
alter policy "hh all routines" on public.routines using (household_id = public.current_household_id() and public.can_edit(owner_id, 'tasks')) with check (household_id = public.current_household_id() and public.can_edit(owner_id, 'tasks'));
create policy "share select routine_logs" on public.routine_logs for select using (exists (select 1 from public.routines r where r.id = routine_logs.routine_id));
alter policy "hh all routine_logs" on public.routine_logs using (exists (select 1 from public.routines r where r.id = routine_logs.routine_id and public.can_edit(r.owner_id, 'tasks'))) with check (exists (select 1 from public.routines r where r.id = routine_logs.routine_id and public.can_edit(r.owner_id, 'tasks')));

-- Projets : section « tâches » OU partage du projet seul.
alter policy "hh select projects" on public.projects using (household_id = public.current_household_id() and (public.can_see(owner_id, 'tasks') or public.project_access(id, false)));
alter policy "hh write projects" on public.projects using (household_id = public.current_household_id() and public.can_edit(owner_id, 'tasks')) with check (household_id = public.current_household_id() and public.can_edit(owner_id, 'tasks'));
create policy "share update projects" on public.projects for update
  using (household_id = public.current_household_id() and public.project_access(id, true))
  with check (household_id = public.current_household_id() and public.project_access(id, true));

-- Tâches : section « tâches » OU partage du projet qui les contient.
create policy "share select tasks" on public.tasks for select
  using (household_id = public.current_household_id() and (public.can_see(owner_id, 'tasks') or (project_id is not null and public.project_access(project_id, false))));
create policy "share insert tasks" on public.tasks for insert
  with check (household_id = public.current_household_id() and project_id is not null and public.project_access(project_id, true));
create policy "share update tasks" on public.tasks for update
  using (household_id = public.current_household_id() and project_id is not null and public.project_access(project_id, true))
  with check (household_id = public.current_household_id() and project_id is not null and public.project_access(project_id, true));
create policy "share delete tasks" on public.tasks for delete
  using (household_id = public.current_household_id() and project_id is not null and public.project_access(project_id, true));
alter policy "hh all tasks" on public.tasks using (household_id = public.current_household_id() and public.can_edit(owner_id, 'tasks')) with check (household_id = public.current_household_id() and public.can_edit(owner_id, 'tasks'));

-- Finance (lecture partageable, jamais l'écriture).
create policy "share select balance_entries" on public.balance_entries for select using (household_id = public.current_household_id() and public.can_see(owner_id, 'finance'));
create policy "share select bank_connections" on public.bank_connections for select using (household_id = public.current_household_id() and public.can_see(owner_id, 'finance'));
create policy "share select finance_categories" on public.finance_categories for select using (household_id = public.current_household_id() and public.can_see(owner_id, 'finance'));
create policy "share select forecast_snapshots" on public.forecast_snapshots for select using (household_id = public.current_household_id() and public.can_see(owner_id, 'finance'));
create policy "share select incomes" on public.incomes for select using (household_id = public.current_household_id() and public.can_see(owner_id, 'finance'));
create policy "share select investments" on public.investments for select using (household_id = public.current_household_id() and public.can_see(owner_id, 'finance'));
create policy "share select recurring_charges" on public.recurring_charges for select using (household_id = public.current_household_id() and public.can_see(owner_id, 'finance'));
create policy "share select tax_profiles" on public.tax_profiles for select using (household_id = public.current_household_id() and public.can_see(owner_id, 'finance'));
create policy "share select transactions" on public.transactions for select using (household_id = public.current_household_id() and public.can_see(owner_id, 'finance'));
create policy "share select variable_budgets" on public.variable_budgets for select using (household_id = public.current_household_id() and public.can_see(owner_id, 'finance'));
alter policy "hh all balance_entries" on public.balance_entries using (household_id = public.current_household_id() and public.can_edit(owner_id, 'finance')) with check (household_id = public.current_household_id() and public.can_edit(owner_id, 'finance'));
alter policy "hh all bank_connections" on public.bank_connections using (household_id = public.current_household_id() and public.can_edit(owner_id, 'finance')) with check (household_id = public.current_household_id() and public.can_edit(owner_id, 'finance'));
alter policy "hh all finance_categories" on public.finance_categories using (household_id = public.current_household_id() and public.can_edit(owner_id, 'finance')) with check (household_id = public.current_household_id() and public.can_edit(owner_id, 'finance'));
alter policy "hh all forecast_snapshots" on public.forecast_snapshots using (household_id = public.current_household_id() and public.can_edit(owner_id, 'finance')) with check (household_id = public.current_household_id() and public.can_edit(owner_id, 'finance'));
alter policy "hh all incomes" on public.incomes using (household_id = public.current_household_id() and public.can_edit(owner_id, 'finance')) with check (household_id = public.current_household_id() and public.can_edit(owner_id, 'finance'));
alter policy "hh all investments" on public.investments using (household_id = public.current_household_id() and public.can_edit(owner_id, 'finance')) with check (household_id = public.current_household_id() and public.can_edit(owner_id, 'finance'));
alter policy "hh all recurring_charges" on public.recurring_charges using (household_id = public.current_household_id() and public.can_edit(owner_id, 'finance')) with check (household_id = public.current_household_id() and public.can_edit(owner_id, 'finance'));
alter policy "hh all tax_profiles" on public.tax_profiles using (household_id = public.current_household_id() and public.can_edit(owner_id, 'finance')) with check (household_id = public.current_household_id() and public.can_edit(owner_id, 'finance'));
alter policy "hh all transactions" on public.transactions using (household_id = public.current_household_id() and public.can_edit(owner_id, 'finance')) with check (household_id = public.current_household_id() and public.can_edit(owner_id, 'finance'));
alter policy "hh all variable_budgets" on public.variable_budgets using (household_id = public.current_household_id() and public.can_edit(owner_id, 'finance')) with check (household_id = public.current_household_id() and public.can_edit(owner_id, 'finance'));

-- Nouvelles tables : les écritures passent uniquement par set_member_share / set_project_member.
create policy "shares visible to both" on public.member_shares for select using (owner_id = auth.uid() or member_id = auth.uid());
create policy "project members visible to both" on public.project_members for select using (owner_id = auth.uid() or member_id = auth.uid());
create policy "own tokens" on public.user_tokens for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "finance settings select" on public.finance_settings for select using (public.can_see(owner_id, 'finance'));
create policy "finance settings insert" on public.finance_settings for insert with check (owner_id = auth.uid());
create policy "finance settings update" on public.finance_settings for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ───────────── 5. Durcissement et index (member_sharing_4) ─────────────
revoke execute on function public.household_owner(uuid) from public, anon, authenticated;
revoke execute on function public.tasks_inherit_project_owner() from public, anon, authenticated;
revoke execute on function public.can_see(uuid, text) from public, anon;
revoke execute on function public.can_edit(uuid, text) from public, anon;
revoke execute on function public.project_access(uuid, boolean) from public, anon;
alter function public._owner_tables() set search_path = public;

create unique index if not exists balance_entries_owner_date_account_key on public.balance_entries (owner_id, entry_date, account);
create unique index if not exists forecast_snapshots_owner_month_key on public.forecast_snapshots (owner_id, month);
create unique index if not exists tax_profiles_owner_year_key on public.tax_profiles (owner_id, year);

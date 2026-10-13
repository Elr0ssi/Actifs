-- Flozea — listes de courses, recettes et repas planifiés : chaque élément est « Perso » ou « Partagé ».
--
-- Avant : la section « courses » se partageait en bloc entre membres, ce qui mélangeait tout et laissait
-- supprimer sans le savoir ce qui était à l'autre. Maintenant :
--   * Perso (shared = false)  : visible par son propriétaire seulement ;
--   * Partagé (shared = true) : visible par tout le foyer ; seul le propriétaire le modifie ou le supprime ;
--   * les articles d'une liste de courses PARTAGÉE se gèrent à plusieurs (ajouter, cocher) ;
--   * les ingrédients d'une recette ne se modifient que par son propriétaire.
--
-- ÉTAT : APPLIQUÉ le 2026-10-13 (migrations shared_items_1 à shared_items_3). Rien n'est supprimé ;
-- l'existant a été marqué « partagé » pour que rien ne disparaisse pour personne.

alter table public.lists add column if not exists shared boolean not null default false;
alter table public.recipes add column if not exists shared boolean not null default false;
alter table public.menu_items add column if not exists shared boolean not null default false;

update public.lists set shared = true where shared = false;
update public.recipes set shared = true where shared = false;
update public.menu_items set shared = true where shared = false;

-- Lecture : ce qui est à moi, ou partagé avec le foyer. Écriture : le propriétaire seulement.
alter policy "share select lists" on public.lists using (household_id = public.current_household_id() and (owner_id = auth.uid() or shared));
alter policy "hh all lists" on public.lists using (household_id = public.current_household_id() and owner_id = auth.uid()) with check (household_id = public.current_household_id() and owner_id = auth.uid());

alter policy "share select recipes" on public.recipes using (household_id = public.current_household_id() and (owner_id = auth.uid() or shared));
alter policy "hh all recipes" on public.recipes using (household_id = public.current_household_id() and owner_id = auth.uid()) with check (household_id = public.current_household_id() and owner_id = auth.uid());

alter policy "share select menu_items" on public.menu_items using (household_id = public.current_household_id() and (owner_id = auth.uid() or shared));
alter policy "hh all menu_items" on public.menu_items using (household_id = public.current_household_id() and owner_id = auth.uid()) with check (household_id = public.current_household_id() and owner_id = auth.uid());

-- Emplacements des articles en magasin : un réglage du foyer.
alter policy "share select item_locations" on public.item_locations using (household_id = public.current_household_id());
alter policy "hh all item_locations" on public.item_locations using (household_id = public.current_household_id()) with check (household_id = public.current_household_id());

-- Articles et recettes d'une liste : tout le monde dans une liste partagée, le propriétaire seul dans une liste perso.
alter policy "hh all list_items" on public.list_items
  using (exists (select 1 from public.lists l where l.id = list_items.list_id and (l.owner_id = auth.uid() or (l.shared and l.household_id = public.current_household_id()))))
  with check (exists (select 1 from public.lists l where l.id = list_items.list_id and (l.owner_id = auth.uid() or (l.shared and l.household_id = public.current_household_id()))));
alter policy "hh all list_recipes" on public.list_recipes
  using (exists (select 1 from public.lists l where l.id = list_recipes.list_id and (l.owner_id = auth.uid() or (l.shared and l.household_id = public.current_household_id()))))
  with check (exists (select 1 from public.lists l where l.id = list_recipes.list_id and (l.owner_id = auth.uid() or (l.shared and l.household_id = public.current_household_id()))));

-- Ingrédients d'une recette : seul le propriétaire de la recette les modifie.
alter policy "hh all recipe_items" on public.recipe_items
  using (exists (select 1 from public.recipes r where r.id = recipe_items.recipe_id and r.owner_id = auth.uid()))
  with check (exists (select 1 from public.recipes r where r.id = recipe_items.recipe_id and r.owner_id = auth.uid()));

-- Les courses ne se partagent plus par section : on n'applique plus ce réglage par défaut à l'arrivée d'un membre.
create or replace function public._apply_default_shares(p_owner uuid, p_member uuid) returns void
language plpgsql security definer set search_path = public as $$
declare hh uuid; sec text; lvl text;
begin
  select household_id into hh from public.profiles where id = p_owner;
  if hh is null then return; end if;
  for sec, lvl in select key, value from jsonb_each_text((select share_defaults from public.profiles where id = p_owner)) loop
    if sec in ('tasks','finance','notes') and lvl in ('view','edit') then
      insert into public.member_shares (household_id, owner_id, member_id, section, can_edit)
      values (hh, p_owner, p_member, sec, lvl = 'edit' and sec <> 'finance')
      on conflict (owner_id, member_id, section) do nothing;
    end if;
  end loop;
end $$;

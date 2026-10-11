-- ============================================================================
--  PROPOSITIONS DE MIGRATIONS — NON APPLIQUÉES
--  Rien dans ce fichier n'a été exécuté sur le projet Supabase kqmckpauxlujowqmheso.
--  À relire, tester sur une branche Supabase, puis appliquer seulement après votre accord.
-- ============================================================================

-- 1) Realtime : mise à jour instantanée site <-> iPhone (optionnel).
--    Aujourd'hui la publication supabase_realtime est vide. L'app se synchronise sans cela
--    (relecture à l'ouverture, toutes les 90 s, au retour du réseau).
--    Les politiques RLS s'appliquent aussi à Realtime : un utilisateur ne reçoit que son foyer.
-- alter publication supabase_realtime add table
--   public.tasks, public.routines, public.routine_logs, public.lists, public.list_items,
--   public.menu_items, public.recurring_charges, public.incomes, public.balance_entries, public.transactions;

-- 2) Durcissement RLS : tax_profiles et vocab_words n'ont pas de WITH CHECK
--    (un membre pourrait insérer/modifier une ligne pointant vers un autre foyer s'il en connaissait l'UUID).
--    À adapter au nom exact des politiques existantes (voir pg_policies).
-- drop policy if exists "<politique existante tax_profiles>" on public.tax_profiles;
-- create policy "tax_profiles_household" on public.tax_profiles
--   for all using (household_id = public.current_household_id())
--   with check (household_id = public.current_household_id());
-- (idem pour public.vocab_words)

-- 3) Suppression de compte (exigée par l'App Store, guideline 5.1.1(v), pour toute app qui crée des comptes).
--    Impossible depuis l'app avec la clé anon : il faut une fonction côté serveur. Deux options :
--    a) Edge Function Supabase `delete-account` (vérifie le JWT, appelle auth.admin.deleteUser avec la clé service_role
--       stockée côté serveur uniquement) ; b) RPC SECURITY DEFINER limitée à auth.uid().
--    Les données du foyer partagé ne doivent PAS être supprimées si d'autres membres existent.
--    Non écrit ici : choix de conception à valider (que devient le foyer ? anonymisation ?).

-- Flozea — budget partagé : une ligne de budget / d'opération peut être « partagée » (dépense commune).
--
-- ÉTAT : APPLIQUÉ le 2026-10-13 (migration shared_budget_1_column_and_policy).
-- Une ligne partagée est visible par tout le foyer ; seul son propriétaire la modifie ou la supprime (règles d'écriture inchangées).
-- Elle ne compte dans les calculs (solde, prévu / réel) que chez son propriétaire, qui est celui qui paie.
-- Par défaut tout reste perso : aucune donnée existante n'est exposée.

alter table public.recurring_charges add column if not exists shared boolean not null default false;

create policy "shared charges visible to household" on public.recurring_charges for select
  using (household_id = public.current_household_id() and shared);

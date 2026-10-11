import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { getDailyBalances, getUpcomingOperations, monthBounds } from "@/lib/finance-engine";
import { ACCOUNTS, type AccountName } from "@/lib/finance-load";
import { financeFrom, monthBudget, monthEnvelopes, summarize } from "~/core/finance";
import { dateFromISO } from "~/core/dates";
import { setBalance } from "~/core/mutations";
import { Button, Card, Chip, Empty, Field, H2, Icon, IconButton, Label, Progress, Row, Screen, Sheet, SyncBanner, T } from "~/ui/kit";
import { DateField } from "~/ui/forms";
import { eur0, fmtMonth, fmtShort, formatEUR } from "~/ui/format";
import { Ready, type ReadyValue } from "~/ui/ready";
import { useTheme } from "~/ui/theme";
import { parseAmount } from "@/lib/wallet";

export default function Finance() {
  return <Ready>{(v) => <FinanceInner {...v} />}</Ready>;
}

function FinanceInner({ data, today, run, mutCtx, refresh, settings }: ReadyValue) {
  const t = useTheme();
  const router = useRouter();
  const now = dateFromISO(today);
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [balanceFor, setBalanceFor] = useState<AccountName | null>(null);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<string | null>(today);

  const state = useMemo(() => financeFrom(data, today), [data, today]);
  const empty = state.ops.length === 0 && data.tables.balance_entries.length === 0;
  const isCurrent = ym.y === now.getFullYear() && ym.m === now.getMonth();
  const bounds = monthBounds(ym.y, ym.m);
  const refDate = isCurrent ? today : bounds.end;
  const sum = useMemo(() => summarize(state, refDate), [state, refDate]);
  const budget = useMemo(() => monthBudget(state, ym.y, ym.m), [state, ym]);
  const envelopes = useMemo(() => monthEnvelopes(state, ym.y, ym.m), [state, ym]);
  const upcoming = useMemo(() => getUpcomingOperations(state.ops, today, 6), [state, today]);
  const curve = useMemo(() => getDailyBalances(state.ops, state.anchor, bounds.start, bounds.end), [state, bounds.start, bounds.end]);
  const maxAbs = Math.max(1, ...curve.map((c) => Math.abs(c.balance)));
  const shift = (d: number) => setYm((c) => { const x = new Date(c.y, c.m + d, 1); return { y: x.getFullYear(), m: x.getMonth() }; });

  if (empty) {
    return (
      <Screen onRefresh={refresh}>
        <SyncBanner />
        <Empty icon="eurosign.circle" title="Pas encore de données financières" hint="Saisis un solde et tes revenus / charges récurrents : ils se synchronisent avec le site." />
        <Button title="Saisir un solde" onPress={() => setBalanceFor("Courant")} />
        <Button title="Ajouter une opération" kind="secondary" onPress={() => router.push("/finance/operations")} />
        {BalanceSheet()}
      </Screen>
    );
  }

  const hide = settings.hideWidgetAmounts; // la confidentialité des widgets n'affecte pas l'écran de l'app
  void hide;

  function BalanceSheet() {
    return (
      <Sheet visible={balanceFor !== null} onClose={() => setBalanceFor(null)} title={`Solde · ${balanceFor ?? ""}`}>
        <Field label="Solde réel (€)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0,00" autoFocus />
        <DateField label="À la date du" value={date} onChange={setDate} />
        <T size={12} color="muted">Le solde saisi devient le nouveau point de départ des prévisions de ce compte. L'historique des autres dates est conservé.</T>
        <Button title="Enregistrer" disabled={!amount.trim() || !date} onPress={() => {
          const n = parseAmount(amount);
          if (balanceFor && date && n !== null && Number.isFinite(n)) run(setBalance(mutCtx, data, balanceFor, date, n));
          setAmount(""); setBalanceFor(null);
        }} />
      </Sheet>
    );
  }

  return (
    <Screen onRefresh={refresh}>
      <SyncBanner />
      <Row style={{ justifyContent: "space-between" }}>
        <IconButton name="chevron.left" label="Mois précédent" onPress={() => shift(-1)} />
        <T size={18} weight="700">{fmtMonth(ym.y, ym.m)}</T>
        <IconButton name="chevron.right" label="Mois suivant" onPress={() => shift(1)} />
      </Row>

      <Card tone="brand">
        <T size={12} weight="600" color="brand">Reste à vivre {isCurrent ? "(fin de mois)" : `au ${fmtShort(refDate)}`}</T>
        <T size={38} weight="800" color={sum.resteAVivre >= 0 ? "ink" : "bad"}>{formatEUR(sum.resteAVivre)}</T>
        <Row style={{ gap: 20, flexWrap: "wrap" }}>
          <View><T size={12} color="muted">Solde au {fmtShort(refDate)}</T><T weight="700">{eur0(sum.balance)}</T></View>
          <View><T size={12} color="muted">Par jour</T><T weight="700">{eur0(sum.perDay)}</T></View>
          <View><T size={12} color="muted">Encore prévu</T><T weight="700">{eur0(sum.monthPlanned)}</T></View>
        </Row>
      </Card>

      <Card>
        <H2>Le mois en un coup d'œil</H2>
        <Row style={{ justifyContent: "space-between" }}><T color="sub">Revenus</T><T weight="700" color="ok">+ {eur0(budget.income)}</T></Row>
        <Row style={{ justifyContent: "space-between" }}><T color="sub">Charges fixes</T><T weight="700">− {eur0(budget.fixed)}</T></Row>
        <Row style={{ justifyContent: "space-between" }}><T color="sub">Dépenses estimées restantes</T><T weight="700">− {eur0(budget.variable)}</T></Row>
        <Row style={{ justifyContent: "space-between" }}><T color="sub">Consommation quotidienne (cartes)</T><T weight="700">− {eur0(budget.daily)}</T></Row>
        <Row style={{ justifyContent: "space-between" }}><T color="sub">Épargne / investissement</T><T weight="700">− {eur0(budget.savings)}</T></Row>
      </Card>

      <Card>
        <H2>Évolution du solde</H2>
        <View style={{ flexDirection: "row", alignItems: "flex-end", height: 70, gap: 1 }}>
          {curve.map((c) => (
            <View key={c.date} style={{ flex: 1, height: Math.max(2, (Math.abs(c.balance) / maxAbs) * 70), backgroundColor: c.balance >= 0 ? (c.date === today ? t.brandStrong : t.brand) : t.bad, opacity: c.date < today ? 0.45 : 1, borderRadius: 1 }} />
          ))}
        </View>
        <Row style={{ justifyContent: "space-between" }}><T size={11} color="muted">{fmtShort(bounds.start)}</T><T size={11} color="muted">{fmtShort(bounds.end)}</T></Row>
      </Card>

      <Card>
        <H2>Budgets : prévu et réel</H2>
        {envelopes.length === 0 ? <T color="muted">Aucune dépense variable ce mois-ci.</T> : null}
        {envelopes.map((e) => {
          const over = e.left < 0;
          return (
            <View key={e.category} style={{ gap: 5 }}>
              <Row style={{ justifyContent: "space-between" }}>
                <T weight="600">{e.category}</T>
                <T size={13} color={over ? "bad" : "sub"}>{eur0(e.real)} / {eur0(e.planned)}</T>
              </Row>
              <Progress value={e.planned > 0 ? e.real / e.planned : e.real > 0 ? 1 : 0} color={over ? t.bad : t.money} />
              <T size={12} color={over ? "bad" : "muted"}>{over ? `Dépassé de ${eur0(-e.left)}` : `Reste ${eur0(e.left)}`}</T>
            </View>
          );
        })}
      </Card>

      <Card>
        <H2>Comptes</H2>
        {ACCOUNTS.map((a) => {
          const last = state.accounts[a].last;
          return (
            <Row key={a} style={{ justifyContent: "space-between", paddingVertical: 4 }} onPress={() => { setAmount(last ? String(last.balance).replace(".", ",") : ""); setDate(today); setBalanceFor(a); }}>
              <View><T weight="600">{a}</T><T size={12} color="muted">{last ? `au ${fmtShort(last.date)}` : "Aucun solde saisi"}</T></View>
              <Row><T weight="700">{last ? eur0(last.balance) : "—"}</T><Icon name="pencil" size={14} /></Row>
            </Row>
          );
        })}
        {state.goals.savings > 0 ? (
          <View style={{ gap: 5, marginTop: 6 }}>
            <Row style={{ justifyContent: "space-between" }}><T size={13} color="sub">Objectif d'épargne</T><T size={13} color="sub">{eur0(state.accounts["Épargne"].last?.balance ?? 0)} / {eur0(state.goals.savings)}</T></Row>
            <Progress value={(state.accounts["Épargne"].last?.balance ?? 0) / state.goals.savings} color={t.ok} />
          </View>
        ) : null}
      </Card>

      <Card>
        <H2>À venir</H2>
        {upcoming.length === 0 ? <T color="muted">Aucune opération planifiée.</T> : null}
        {upcoming.map((o) => (
          <Row key={`${o.op.id}${o.date}`} style={{ justifyContent: "space-between" }}>
            <View style={{ flex: 1 }}><T numberOfLines={1}>{o.op.name}</T><T size={12} color="muted">{fmtShort(o.date)} · {o.op.category}</T></View>
            <T weight="700" color={o.signed >= 0 ? "ok" : "ink"}>{o.signed >= 0 ? "+" : "−"} {eur0(Math.abs(o.signed))}</T>
          </Row>
        ))}
      </Card>

      <Button title="Toutes les opérations" kind="secondary" icon="list.bullet" onPress={() => router.push("/finance/operations")} />
      <Label>Les montants détaillés (cartes Wallet, impôts, connexion bancaire) restent gérés sur le site.</Label>
      {BalanceSheet()}
    </Screen>
  );
}

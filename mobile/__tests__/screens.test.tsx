import React from "react";
import { render, screen } from "@testing-library/react-native";
import { ctx, HOUSEHOLD, makeData, routine, task } from "./fixtures";
import type { DataValue } from "~/data/DataProvider";
import { DEFAULT_SETTINGS } from "~/core/settings";

// Date figée : lundi 15 juin 2026
const TODAY = "2026-06-15";

const data = makeData({
  profiles: [{ id: "u-1", household_id: HOUSEHOLD, display_name: "Alex" }],
  households: [{ id: HOUSEHOLD, name: "Foyer", invite_code: "ABC123", current_balance: 1500, balance_ref_date: "2026-06-10", default_servings: 2 }],
  routines: [routine({ id: "r1", title: "Méditer" }), routine({ id: "r2", title: "Sport", frequency: "weekly", days_of_week: [1] })],
  tasks: [task({ id: "t1", title: "Appeler le dentiste", due_time: "14:30:00" }), task({ id: "t2", title: "Payer la cantine", due_date: null })],
  projects: [{ id: "p1", name: "Maison", color: "#8b5cf6", icon: "🏠", archived: false }],
  lists: [{ id: "l1", name: "Courses de la semaine", type: "shopping", archived: false, created_at: "2026-06-14T10:00:00Z", store: null }],
  list_items: [{ id: "i1", list_id: "l1", label: "Lait", quantity: "2", checked: false, position: 0, price: null, count: 1 }],
  menu_items: [{ id: "m1", day: TODAY, name: "Pâtes", icon: "🍝", slot: "midi", servings: 2 }],
  recipes: [{ id: "rc1", name: "Gratin", category: "Plat", is_favorite: true, servings: 4, notes: "Cuire 40 min" }],
  recipe_items: [{ id: "ri1", recipe_id: "rc1", label: "Pommes de terre", quantity: "1 kg", position: 0 }],
  recurring_charges: [{ id: "c1", household_id: HOUSEHOLD, name: "Loyer", amount: 700, category: "Logement", kind: "fixed", frequency: "monthly", next_date: "2026-06-05", active: true, interval_count: 1, weekdays: [], month_days: [], end_date: null, skipped_dates: [], moved_dates: {}, weekend_rule: "none", note: null, account: null }],
  incomes: [{ id: "i1", household_id: HOUSEHOLD, name: "Salaire", amount: 2000, expected_date: "2026-06-28", recurring: true, frequency: "monthly", active: true, interval_count: 1, weekdays: [], month_days: [], end_date: null, skipped_dates: [], moved_dates: {}, weekend_rule: "none", note: null, account: null, category: "Revenu" }],
  balance_entries: [{ household_id: HOUSEHOLD, entry_date: "2026-06-10", account: "Courant", balance: 1500 }],
});

const mockValue: DataValue = {
  data, ready: true, syncing: false, online: true, pending: 0, lastSync: "2026-06-15T08:00:00Z", error: null, rejected: [], settings: DEFAULT_SETTINGS, today: TODAY,
  mutCtx: ctx(), refresh: async () => undefined, run: jest.fn(), updateSettings: jest.fn(),
};

jest.mock("~/data/DataProvider", () => ({ useData: () => mockValue }));
jest.mock("~/auth/AuthProvider", () => ({ useAuth: () => ({ session: { user: { email: "alex@example.com", user_metadata: {} } }, signOut: jest.fn(), status: "signedIn" }) }));
jest.mock("expo-router", () => {
  const React = require("react");
  const Stack = { Screen: () => null };
  return { useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }), useLocalSearchParams: () => ({ id: "l1" }), Stack, Tabs: () => null };
});
jest.mock("expo-symbols", () => ({ SymbolView: () => null }));
jest.mock("expo-haptics", () => ({ selectionAsync: jest.fn(() => Promise.resolve()) }));
jest.mock("expo-constants", () => ({ __esModule: true, default: { expoConfig: { version: "1.0.0", extra: {} } } }));
jest.mock("@react-native-community/datetimepicker", () => () => null);
jest.mock("~/native/notifications", () => ({ permissionState: () => Promise.resolve("granted"), requestPermission: () => Promise.resolve("granted") }));
jest.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }), SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children }));

import Today from "../app/(tabs)/index";
import Tasks from "../app/(tabs)/tasks";
import Finance from "../app/(tabs)/finance";
import Courses from "../app/(tabs)/courses";
import More from "../app/(tabs)/more";
import ListScreen from "../app/lists/[id]";
import Routines from "../app/routines";
import Agenda from "../app/agenda";
import Meals from "../app/meals";
import Recipes from "../app/recipes";
import Settings from "../app/settings";
import Operations from "../app/finance/operations";

describe("écrans : rendu sans erreur avec des données réelles de test", () => {
  beforeAll(() => {
    jest.useFakeTimers({ now: new Date(2026, 5, 15, 9, 0) });
  });
  afterAll(() => jest.useRealTimers());

  const cases: [string, () => React.JSX.Element, RegExp][] = [
    ["Aujourd'hui", () => <Today />, /Bonjour, Alex/],
    ["Tâches", () => <Tasks />, /Appeler le dentiste/],
    ["Finances", () => <Finance />, /Reste à vivre/],
    ["Courses", () => <Courses />, /Courses de la semaine/],
    ["Plus", () => <More />, /Routines/],
    ["Liste", () => <ListScreen />, /Lait/],
    ["Routines", () => <Routines />, /Méditer/],
    ["Agenda", () => <Agenda />, /Appeler le dentiste/],
    ["Menu", () => <Meals />, /Pâtes/],
    ["Recettes", () => <Recipes />, /Gratin/],
    ["Réglages", () => <Settings />, /alex@example.com/],
    ["Opérations", () => <Operations />, /Loyer/],
  ];

  it.each(cases)("%s", (_name, el, text) => {
    render(el());
    expect(screen.getAllByText(text).length).toBeGreaterThan(0);
  });

  it("Aujourd'hui affiche le reste à vivre calculé comme sur le site (3 500 €)", () => {
    render(<Today />);
    expect(screen.getAllByText(/3\s?500\s?€/).length).toBeGreaterThan(0);
  });
});

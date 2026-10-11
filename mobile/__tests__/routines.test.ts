import { localISO } from "~/core/dates";
import { routinesFor, streakOf, tasksFor, overdueTasks } from "~/core/today";
import { makeData, routine, task } from "./fixtures";

// 2026-06-15 = lundi
describe("routines récurrentes", () => {
  it("quotidienne : tous les jours ; hebdomadaire : seulement les jours choisis (0 = dimanche)", () => {
    const d = makeData({ routines: [routine({ id: "a" }), routine({ id: "b", frequency: "weekly", days_of_week: [1, 3] }), routine({ id: "c", active: false })] });
    expect(routinesFor(d, "2026-06-15").list.map((x) => x.routine.id)).toEqual(["a", "b"]); // lundi
    expect(routinesFor(d, "2026-06-16").list.map((x) => x.routine.id)).toEqual(["a"]); // mardi
    expect(routinesFor(d, "2026-06-17").list.map((x) => x.routine.id)).toEqual(["a", "b"]); // mercredi
  });

  it("ne compte que les coches de l'utilisateur courant", () => {
    const logs = [{ routine_id: "a", log_date: "2026-06-15", user_id: "autre", done: true }];
    expect(routinesFor(makeData({ routines: [routine({ id: "a" })], routine_logs: logs }), "2026-06-15").done).toBe(0);
    expect(routinesFor(makeData({ routines: [routine({ id: "a" })], routine_logs: [{ ...logs[0], user_id: "u-1" }] }), "2026-06-15").done).toBe(1);
  });

  it("série : jours consécutifs complets, la journée en cours ne casse pas la série", () => {
    const logs = ["2026-06-13", "2026-06-14"].map((log_date) => ({ routine_id: "a", log_date, user_id: "u-1", done: true }));
    const d = makeData({ routines: [routine({ id: "a", created_at: "2026-01-01T00:00:00Z" })], routine_logs: logs });
    expect(streakOf(d, "2026-06-15")).toBe(2);
    expect(streakOf(d, "2026-06-16")).toBe(0);
  });
});

describe("tâches du jour", () => {
  it("trie par heure puis priorité, sépare faites et en retard", () => {
    const d = makeData({ tasks: [
      task({ id: "1", title: "B", due_time: "10:00" }),
      task({ id: "2", title: "A", due_time: null, priority: "high" }),
      task({ id: "3", title: "C", due_time: "09:00" }),
      task({ id: "4", status: "done" }),
      task({ id: "5", due_date: "2026-06-10" }),
    ] });
    const t = tasksFor(d, "2026-06-15");
    expect(t.open.map((x) => x.id)).toEqual(["3", "1", "2"]);
    expect(t.done).toHaveLength(1);
    expect(overdueTasks(d, "2026-06-15").map((x) => x.id)).toEqual(["5"]);
  });
});

describe("fuseau horaire", () => {
  it("la date du jour est la date LOCALE (pas l'UTC) juste après minuit", () => {
    expect(localISO(new Date(2026, 0, 1, 0, 30))).toBe("2026-01-01");
    expect(localISO(new Date(2026, 5, 30, 23, 59))).toBe("2026-06-30");
  });
});

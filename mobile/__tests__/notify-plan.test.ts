import { applyQuietHours, MAX_PENDING, planNotifications } from "~/core/notify-plan";
import { DEFAULT_SETTINGS, mergeSettings } from "~/core/settings";
import { makeData, routine, task } from "./fixtures";

const S = DEFAULT_SETTINGS.notifications;
const NOW = new Date(2026, 5, 15, 7, 30); // lundi 07:30 local

describe("planification des notifications locales", () => {
  it("rappel de tâche à heure fixe : X minutes avant, identifiant stable", () => {
    const d = makeData({ tasks: [task({ id: "t1", title: "Dentiste", due_time: "14:30:00" })] });
    const [n] = planNotifications(d, S, NOW);
    expect(n).toMatchObject({ id: "task:t1", title: "Dentiste", kind: "task" });
    expect(n.fireAt.getHours()).toBe(14);
    expect(n.fireAt.getMinutes()).toBe(15);
  });

  it("ignore les tâches terminées, passées, et respecte les interrupteurs", () => {
    const d = makeData({ tasks: [task({ id: "a", status: "done", due_time: "14:00" }), task({ id: "b", due_time: "06:00" })] });
    expect(planNotifications(d, S, NOW)).toEqual([]);
    const d2 = makeData({ tasks: [task({ id: "c", due_time: "14:00" })] });
    expect(planNotifications(d2, { ...S, tasks: false }, NOW)).toEqual([]);
    expect(planNotifications(d2, { ...S, enabled: false }, NOW)).toEqual([]);
  });

  it("tâche du jour sans heure : rappel matinal à l'heure réglée", () => {
    const d = makeData({ tasks: [task({ id: "x", due_time: null })] });
    const [n] = planNotifications(d, S, NOW);
    expect(n).toMatchObject({ id: "due:x", kind: "due" });
    expect(n.fireAt.getHours()).toBe(9);
  });

  it("routines : une notification par jour avec routines restantes, pas pour les routines déjà faites", () => {
    const d = makeData({ routines: [routine({ id: "a" })], routine_logs: [{ routine_id: "a", log_date: "2026-06-15", user_id: "u-1", done: true }] });
    const ids = planNotifications(d, S, new Date(2026, 5, 15, 6, 0)).map((n) => n.id);
    expect(ids).not.toContain("routines:2026-06-15");
    expect(ids).toContain("routines:2026-06-16");
  });

  it("heures calmes : une alerte de nuit est repoussée à la fin de la plage", () => {
    const night = new Date(2026, 5, 15, 23, 30);
    const shifted = applyQuietHours(night, S);
    expect(shifted.getDate()).toBe(16);
    expect(shifted.getHours()).toBe(7);
    const early = applyQuietHours(new Date(2026, 5, 15, 5, 0), S);
    expect(early.getDate()).toBe(15);
    expect(early.getHours()).toBe(7);
    expect(applyQuietHours(night, { ...S, quietEnabled: false })).toEqual(night);
    expect(applyQuietHours(new Date(2026, 5, 15, 12, 0), S).getHours()).toBe(12);
  });

  it("ne dépasse jamais la limite iOS de notifications planifiées", () => {
    const tasks = Array.from({ length: 200 }, (_, i) => task({ id: `t${i}`, due_time: `${String(8 + (i % 12)).padStart(2, "0")}:00`, due_date: "2026-06-16" }));
    expect(planNotifications(makeData({ tasks }), S, NOW).length).toBeLessThanOrEqual(MAX_PENDING);
  });

  it("réglages corrompus ou anciens : retour aux valeurs par défaut", () => {
    expect(mergeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(mergeSettings({ notifications: { routineTime: "99:99", taskLeadMin: -5, tasks: "oui" } }).notifications).toMatchObject({ routineTime: "08:00", taskLeadMin: 15, tasks: true });
  });
});

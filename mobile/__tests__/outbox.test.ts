import { applyOp, applyOps, compact, type Op } from "~/core/outbox";
import { addTask, deleteTask, setRoutineLog, toggleTask } from "~/core/mutations";
import { sel } from "~/core/model";
import { ctx, makeData, routine, task } from "./fixtures";

describe("file d'attente / application locale", () => {
  it("un upsert rejoué ne crée pas de doublon", () => {
    const c = ctx();
    const [op] = addTask(c, { title: "Acheter du pain" });
    const once = applyOp(makeData(), op);
    const twice = applyOp(once, op);
    expect(sel.tasks(once)).toHaveLength(1);
    expect(sel.tasks(twice)).toHaveLength(1);
  });

  it("une coche de routine est unique par routine/jour/utilisateur", () => {
    const c = ctx();
    let d = makeData({ routines: [routine()] });
    d = applyOps(d, setRoutineLog(c, "r1", "2026-06-15", true));
    d = applyOps(d, setRoutineLog(c, "r1", "2026-06-15", true));
    expect(sel.logs(d)).toHaveLength(1);
    d = applyOps(d, setRoutineLog(c, "r1", "2026-06-15", false));
    expect(sel.logs(d)).toHaveLength(0);
  });

  it("décocher ne touche que les coches de l'utilisateur courant", () => {
    const c = ctx();
    const d0 = makeData({ routine_logs: [{ routine_id: "r1", log_date: "2026-06-15", user_id: "autre", done: true }, { routine_id: "r1", log_date: "2026-06-15", user_id: "u-1", done: true }] });
    const d1 = applyOps(d0, setRoutineLog(c, "r1", "2026-06-15", false));
    expect(sel.logs(d1)).toEqual([{ routine_id: "r1", log_date: "2026-06-15", user_id: "autre", done: true }]);
  });

  it("patch champ par champ et suppression en cascade d'une liste", () => {
    const c = ctx();
    let d = makeData({ tasks: [task()], lists: [{ id: "l1" }], list_items: [{ id: "i1", list_id: "l1" }, { id: "i2", list_id: "l2" }] });
    d = applyOps(d, toggleTask(c, "t1", true));
    expect(sel.tasks(d)[0]).toMatchObject({ status: "done", title: "Appeler" });
    d = applyOp(d, { id: "x", at: 0, kind: "delete", table: "lists", match: { id: "l1" } });
    expect(sel.items(d).map((i) => i.id)).toEqual(["i2"]);
  });

  it("compact fusionne les patchs et supprime le travail inutile avant une suppression", () => {
    const c = ctx();
    const ops: Op[] = [
      ...addTask(c, { title: "x" }),
      { id: "p1", at: 1, kind: "patch", table: "tasks", match: { id: "t1" }, patch: { title: "a" } },
      { id: "p2", at: 2, kind: "patch", table: "tasks", match: { id: "t1" }, patch: { priority: "high" } },
    ];
    const merged = compact(ops);
    expect(merged.filter((o) => o.kind === "patch")).toHaveLength(1);
    expect(merged.find((o) => o.kind === "patch")).toMatchObject({ patch: { title: "a", priority: "high" } });

    const created = addTask(c, { title: "tmp" });
    const id = (created[0] as Extract<Op, { kind: "upsert" }>).row.id as string;
    const after = compact([...created, ...deleteTask(c, id)]);
    expect(after).toHaveLength(1);
    expect(after[0].kind).toBe("delete");
  });
});

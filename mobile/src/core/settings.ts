/** Réglages locaux de l'app (stockés sur l'appareil). */
export interface NotificationSettings {
  enabled: boolean;
  tasks: boolean; // rappel à l'heure d'une tâche
  taskLeadMin: number; // minutes avant l'heure de la tâche
  due: boolean; // tâches du jour sans heure : rappel matinal
  dueTime: string; // HH:MM
  routines: boolean;
  routineTime: string; // HH:MM
  quietEnabled: boolean;
  quietStart: string; // HH:MM
  quietEnd: string; // HH:MM
}

export interface AppSettings {
  notifications: NotificationSettings;
  /** Masque les montants dans les widgets finances (rien n'est écrit dans le conteneur partagé). */
  hideWidgetAmounts: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  notifications: {
    enabled: true,
    tasks: true,
    taskLeadMin: 15,
    due: true,
    dueTime: "09:00",
    routines: true,
    routineTime: "08:00",
    quietEnabled: true,
    quietStart: "22:00",
    quietEnd: "07:00",
  },
  hideWidgetAmounts: false,
};

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
export const isHHMM = (v: unknown): v is string => typeof v === "string" && TIME.test(v);

/** Fusionne des réglages lus sur disque (éventuellement anciens ou corrompus) avec les valeurs par défaut. */
export function mergeSettings(raw: unknown): AppSettings {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<AppSettings>;
  const n = (r.notifications && typeof r.notifications === "object" ? r.notifications : {}) as Partial<NotificationSettings>;
  const d = DEFAULT_SETTINGS.notifications;
  const bool = (v: unknown, def: boolean) => (typeof v === "boolean" ? v : def);
  return {
    hideWidgetAmounts: bool(r.hideWidgetAmounts, false),
    notifications: {
      enabled: bool(n.enabled, d.enabled),
      tasks: bool(n.tasks, d.tasks),
      taskLeadMin: typeof n.taskLeadMin === "number" && n.taskLeadMin >= 0 && n.taskLeadMin <= 1440 ? n.taskLeadMin : d.taskLeadMin,
      due: bool(n.due, d.due),
      dueTime: isHHMM(n.dueTime) ? n.dueTime : d.dueTime,
      routines: bool(n.routines, d.routines),
      routineTime: isHHMM(n.routineTime) ? n.routineTime : d.routineTime,
      quietEnabled: bool(n.quietEnabled, d.quietEnabled),
      quietStart: isHHMM(n.quietStart) ? n.quietStart : d.quietStart,
      quietEnd: isHHMM(n.quietEnd) ? n.quietEnd : d.quietEnd,
    },
  };
}

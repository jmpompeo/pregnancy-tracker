import { useEffect, useMemo, useState } from "react";
import type {
  Appointment,
  DueDateInfo,
  MoodEntry,
  PregnancySnapshot,
  SupplementLog,
} from "../types";

const STORAGE_KEY = "pregnancy-tracker:snapshot";

/**
 * <summary>Provides a clean default snapshot when no data has been saved yet.</summary>
 */
const buildDefaultSnapshot = (): PregnancySnapshot => ({
  dueDate: { estimatedDate: "" },
  moodEntries: [],
  appointments: [],
  supplements: [],
});

/**
 * <summary>Creates a very small persistence layer backed by localStorage.</summary>
 */
export const usePregnancyData = () => {
  const [snapshot, setSnapshot] = useState<PregnancySnapshot>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as PregnancySnapshot;
      } catch {
        // fall back to default if parsing fails
      }
    }
    return buildDefaultSnapshot();
  });

  /**
   * <summary>Memoized helpers so components stay lean.</summary>
   */
  const helpers = useMemo(() => {
    const persist = (next: PregnancySnapshot) => {
      setSnapshot(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    };

    const addWithId = <T extends { id: string }>(items: T[], item: Omit<T, "id">) => [
      { ...item, id: `${Date.now()}-${Math.random().toString(16).slice(2)}` },
      ...items,
    ];

    return {
      updateDueDate: (dueDate: DueDateInfo) =>
        persist({
          ...snapshot,
          dueDate,
        }),
      addMoodEntry: (entry: Omit<MoodEntry, "id">) =>
        persist({
          ...snapshot,
          moodEntries: addWithId(snapshot.moodEntries, entry),
        }),
      addAppointment: (appointment: Omit<Appointment, "id">) =>
        persist({
          ...snapshot,
          appointments: addWithId(snapshot.appointments, appointment),
        }),
      addSupplement: (supplement: Omit<SupplementLog, "id">) =>
        persist({
          ...snapshot,
          supplements: addWithId(snapshot.supplements, supplement),
        }),
      resetAll: () => persist(buildDefaultSnapshot()),
    };
  }, [snapshot]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }, [snapshot]);

  return { snapshot, ...helpers };
};

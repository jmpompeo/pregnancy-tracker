import { useEffect, useMemo, useState } from "react";
import type {
  Appointment,
  DueDateInfo,
  MoodEntry,
  PregnancySnapshot,
  SupplementLog,
} from "../types";
import type { PregnancyRepository } from "../repositories/PregnancyRepository";
import { defaultPregnancyRepository } from "../repositories/PregnancyRepository";
import { buildDefaultSnapshot } from "../utils/defaultSnapshot";

type WithoutId<T extends { id: string }> = Omit<T, "id">;

/**
 * <summary>Creates a persistence-aware data hook.</summary>
 */
export const usePregnancyData = (
  repository: PregnancyRepository = defaultPregnancyRepository
) => {
  const [snapshot, setSnapshot] = useState<PregnancySnapshot>(buildDefaultSnapshot);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    repository
      .load()
      .then((data) => {
        if (!cancelled) {
          setSnapshot(data);
        }
      })
      .catch((error) => {
        console.error("Failed to load snapshot", error);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [repository]);

  /**
   * <summary>Memoized helpers so components stay lean.</summary>
   */
  const helpers = useMemo(() => {
    const persist = (next: PregnancySnapshot) => {
      setSnapshot(next);
      repository.save(next).catch((error) => {
        console.error("Failed to persist snapshot", error);
      });
    };

    const addWithId = <T extends { id: string }>(items: T[], item: WithoutId<T>) => [
      { ...item, id: `${Date.now()}-${Math.random().toString(16).slice(2)}` },
      ...items,
    ];

    const updateItem = <T extends { id: string }>(
      items: T[],
      id: string,
      data: WithoutId<T>
    ) => items.map((item) => (item.id === id ? { ...item, ...data } : item));

    return {
      updateDueDate: (dueDate: DueDateInfo) =>
        persist({
          ...snapshot,
          dueDate,
        }),
      addMoodEntry: (entry: WithoutId<MoodEntry>) =>
        persist({
          ...snapshot,
          moodEntries: addWithId(snapshot.moodEntries, entry),
        }),
      updateMoodEntry: (id: string, entry: WithoutId<MoodEntry>) =>
        persist({
          ...snapshot,
          moodEntries: updateItem(snapshot.moodEntries, id, entry),
        }),
      addAppointment: (appointment: WithoutId<Appointment>) =>
        persist({
          ...snapshot,
          appointments: addWithId(snapshot.appointments, appointment),
        }),
      updateAppointment: (id: string, appointment: WithoutId<Appointment>) =>
        persist({
          ...snapshot,
          appointments: updateItem(snapshot.appointments, id, appointment),
        }),
      addSupplement: (supplement: WithoutId<SupplementLog>) =>
        persist({
          ...snapshot,
          supplements: addWithId(snapshot.supplements, supplement),
        }),
      updateSupplement: (id: string, supplement: WithoutId<SupplementLog>) =>
        persist({
          ...snapshot,
          supplements: updateItem(snapshot.supplements, id, supplement),
        }),
      resetAll: () => persist(buildDefaultSnapshot()),
    };
  }, [repository, snapshot]);

  return { snapshot, loading, ...helpers };
};

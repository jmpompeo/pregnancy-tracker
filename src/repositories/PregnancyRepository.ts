import type { PregnancySnapshot } from "../types";
import { buildDefaultSnapshot } from "../utils/defaultSnapshot";

/**
 * <summary>
 * Contract for reading/writing pregnancy tracker data.
 * Keeping this async-friendly makes it trivial to plug in Supabase/Firebase later.
 * </summary>
 */
export interface PregnancyRepository {
  load(): Promise<PregnancySnapshot>;
  save(snapshot: PregnancySnapshot): Promise<void>;
}

const STORAGE_KEY = "pregnancy-tracker:snapshot";

/**
 * <summary>LocalStorage-backed repository for offline-first usage.</summary>
 */
class LocalPregnancyRepository implements PregnancyRepository {
  async load(): Promise<PregnancySnapshot> {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as PregnancySnapshot;
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    return buildDefaultSnapshot();
  }

  async save(snapshot: PregnancySnapshot): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }
}

export const defaultPregnancyRepository: PregnancyRepository =
  new LocalPregnancyRepository();

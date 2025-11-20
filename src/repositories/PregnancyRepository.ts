import type { PregnancySnapshot } from "../types";
import { buildDefaultSnapshot } from "../utils/defaultSnapshot";
import { supabase } from "../lib/supabaseClient";

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

const TABLE = "pregnancy_snapshots";

/**
 * <summary>Supabase-backed repository scoped to the authenticated user.</summary>
 */
export class SupabasePregnancyRepository implements PregnancyRepository {
  readonly userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async ensureRowExists(defaultSnapshot: PregnancySnapshot) {
    const { error } = await supabase.from(TABLE).insert({
      user_id: this.userId,
      data: defaultSnapshot,
    });
    if (error && error.code !== "23505") {
      throw error;
    }
  }

  async load(): Promise<PregnancySnapshot> {
    const { data, error } = await supabase
      .from(TABLE)
      .select("data")
      .eq("user_id", this.userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (!data) {
      const snapshot = buildDefaultSnapshot();
      await this.ensureRowExists(snapshot);
      return snapshot;
    }

    return data.data as PregnancySnapshot;
  }

  async save(snapshot: PregnancySnapshot): Promise<void> {
    const { error } = await supabase.from(TABLE).upsert(
      {
        user_id: this.userId,
        data: snapshot,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    if (error) {
      throw error;
    }
  }
}

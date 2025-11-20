import type { PregnancySnapshot } from "../types";

/**
 * <summary>Provides a clean default snapshot when no data has been saved yet.</summary>
 */
export const buildDefaultSnapshot = (): PregnancySnapshot => ({
  dueDate: { estimatedDate: "" },
  moodEntries: [],
  appointments: [],
  supplements: [],
});

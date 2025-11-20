/**
 * <summary>Represents the current estimated due date and supporting info.</summary>
 */
export interface DueDateInfo {
  /** <summary>Date string formatted as YYYY-MM-DD.</summary> */
  estimatedDate: string;
  /** <summary>Optional note for reminders or doctor's comments.</summary> */
  note?: string;
}

/**
 * <summary>Captures a quick check-in for mood and symptoms.</summary>
 */
export interface MoodEntry {
  /** <summary>ISO timestamp recording when the entry was saved.</summary> */
  id: string;
  /** <summary>Human-friendly day label.</summary> */
  date: string;
  /** <summary>Optional time-of-day when the entry was recorded (HH:MM).</summary> */
  time?: string;
  /** <summary>Simple mood score to keep the UI lightweight.</summary> */
  mood: "Great" | "Good" | "Okay" | "Tired" | "Nauseous";
  /** <summary>Free-form text for symptoms or thoughts.</summary> */
  symptoms: string;
}

/**
 * <summary>Notes an upcoming medical visit.</summary>
 */
export interface Appointment {
  /** <summary>ISO timestamp for uniqueness.</summary> */
  id: string;
  /** <summary>Date of the appointment.</summary> */
  date: string;
  /** <summary>Optional appointment time (HH:MM).</summary> */
  time?: string;
  /** <summary>Provider, clinic, or purpose of the visit.</summary> */
  provider: string;
  /** <summary>Optional prep details.</summary> */
  notes?: string;
}

/**
 * <summary>Tracks supplements taken during the pregnancy.</summary>
 */
export interface SupplementLog {
  /** <summary>ISO timestamp for uniqueness.</summary> */
  id: string;
  /** <summary>Date when the supplement was taken.</summary> */
  date: string;
  /** <summary>Name of the supplement.</summary> */
  name: string;
  /** <summary>Dosage or time of day.</summary> */
  details?: string;
}

/**
 * <summary>Single object bundling all tracker data for persistence.</summary>
 */
export interface PregnancySnapshot {
  dueDate: DueDateInfo;
  moodEntries: MoodEntry[];
  appointments: Appointment[];
  supplements: SupplementLog[];
}

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { TrackerCard } from "./components/TrackerCard";
import { usePregnancyData } from "./hooks/usePregnancyData";
import type {
  Appointment,
  MoodEntry,
  SupplementLog,
  DueDateInfo,
} from "./types";
import { BABY_SIZE_GUIDE } from "./data/babySizes";
import { useAuth } from "./context/AuthContext";
import {
  SupabasePregnancyRepository,
  type PregnancyRepository,
} from "./repositories/PregnancyRepository";

const moodOptions: MoodEntry["mood"][] = ["Great", "Good", "Okay", "Tired", "Nauseous"];
const primaryButtonClass =
  "w-full rounded-xl bg-sky-300/90 px-4 py-2 font-semibold text-slate-900 transition hover:bg-sky-300 sm:w-auto";
const editButtonClass =
  "text-xs font-semibold text-sky-200 underline underline-offset-4 transition hover:text-sky-50";
const deleteButtonClass =
  "text-xs font-semibold text-rose-200 underline underline-offset-4 transition hover:text-rose-100";

type AuthMode = "signIn" | "signUp";

interface TrackerViewProps {
  repository: PregnancyRepository;
  userEmail?: string;
  onSignOut: () => Promise<void>;
}

/**
 * <summary>Converts input-date strings into local Date objects to avoid timezone shifts.</summary>
 */
const parseLocalDate = (value: string) => {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if ([year, month, day].some((part) => Number.isNaN(part))) return undefined;
  return new Date(year, month - 1, day);
};

/**
 * <summary>Formats a YYYY-MM-DD date into a friendlier label.</summary>
 */
const formatDate = (date: string) => {
  const parsed = parseLocalDate(date);
  return parsed
    ? parsed.toLocaleDateString(undefined, { dateStyle: "medium" })
    : "";
};

const formatTime = (time?: string) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  if ([hours, minutes].some((part) => Number.isNaN(part))) return time;
  const reference = new Date();
  reference.setHours(hours ?? 0, minutes ?? 0, 0, 0);
  return reference.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const getCurrentTime = () => {
  const pad = (value: number) => value.toString().padStart(2, "0");
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

/**
 * <summary>Main screen that wires tracker cards with the data hook.</summary>
 */
const defaultMoodForm = () => ({
  date: new Date().toISOString().slice(0, 10),
  time: getCurrentTime(),
  mood: "Good" as MoodEntry["mood"],
  symptoms: "",
});

const defaultAppointmentForm = () => ({
  date: "",
  time: "",
  provider: "",
  notes: "",
});

const defaultSupplementForm = () => ({
  date: new Date().toISOString().slice(0, 10),
  name: "",
  details: "",
});

const TrackerView = ({ repository, userEmail, onSignOut }: TrackerViewProps) => {
  const {
    snapshot,
    loading,
    updateDueDate,
    addMoodEntry,
    updateMoodEntry,
    deleteMoodEntry,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addSupplement,
    updateSupplement,
    deleteSupplement,
    resetAll,
  } = usePregnancyData(repository);
  const [dueDateForm, setDueDateForm] = useState<DueDateInfo>(snapshot.dueDate);
  const [moodForm, setMoodForm] = useState(defaultMoodForm);
  const [appointmentForm, setAppointmentForm] = useState(defaultAppointmentForm);
  const [supplementForm, setSupplementForm] = useState(defaultSupplementForm);
  const [editingMoodId, setEditingMoodId] = useState<string | null>(null);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [editingSupplementId, setEditingSupplementId] = useState<string | null>(null);

  useEffect(() => setDueDateForm(snapshot.dueDate), [snapshot.dueDate]);

  const beginMoodEdit = (entry: MoodEntry) => {
    setEditingMoodId(entry.id);
    setMoodForm({
      date: entry.date,
      time: entry.time ?? "",
      mood: entry.mood,
      symptoms: entry.symptoms,
    });
  };
  const cancelMoodEdit = () => {
    setEditingMoodId(null);
    setMoodForm(defaultMoodForm());
  };

  const beginAppointmentEdit = (entry: Appointment) => {
    setEditingAppointmentId(entry.id);
    setAppointmentForm({
      date: entry.date,
      time: entry.time ?? "",
      provider: entry.provider,
      notes: entry.notes ?? "",
    });
  };
  const cancelAppointmentEdit = () => {
    setEditingAppointmentId(null);
    setAppointmentForm(defaultAppointmentForm());
  };

  const handleMoodDelete = (id: string) => {
    if (editingMoodId === id) {
      cancelMoodEdit();
    }
    deleteMoodEntry(id);
  };

  const handleAppointmentDelete = (id: string) => {
    if (editingAppointmentId === id) {
      cancelAppointmentEdit();
    }
    deleteAppointment(id);
  };

  const handleSupplementDelete = (id: string) => {
    if (editingSupplementId === id) {
      cancelSupplementEdit();
    }
    deleteSupplement(id);
  };

  const beginSupplementEdit = (entry: SupplementLog) => {
    setEditingSupplementId(entry.id);
    setSupplementForm({
      date: entry.date,
      name: entry.name,
      details: entry.details ?? "",
    });
  };
  const cancelSupplementEdit = () => {
    setEditingSupplementId(null);
    setSupplementForm(defaultSupplementForm());
  };

  /**
   * <summary>Derives current gestational week and finds the matching size entry.</summary>
   */
  const babySizeInfo = useMemo(() => {
    const dueDateValue = snapshot.dueDate.estimatedDate;
    if (!dueDateValue) return undefined;
    const due = parseLocalDate(dueDateValue);
    if (!due) return undefined;

    const normalize = (date: Date) => {
      const clone = new Date(date);
      clone.setHours(0, 0, 0, 0);
      return clone;
    };

    const dueMidnight = normalize(due);
    const todayMidnight = normalize(new Date());
    const daysUntilDue = Math.floor(
      (dueMidnight.getTime() - todayMidnight.getTime()) / MS_PER_DAY
    );
    const gestationalDays = 280 - daysUntilDue;
    const clampedDays = Math.max(0, Math.min(279, gestationalDays));
    const week = Math.max(1, Math.min(40, Math.floor(clampedDays / 7) + 1));
    const entry =
      BABY_SIZE_GUIDE.find((size) => size.week === week) ?? BABY_SIZE_GUIDE[0];
    return { week, entry };
  }, [snapshot.dueDate]);

  /**
   * <summary>Shared submit helper to keep handlers tidy.</summary>
   */
  const handleSubmit = (
    e: FormEvent,
    action: () => void,
    reset?: () => void
  ) => {
    e.preventDefault();
    action();
    reset?.();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Loading tracker...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 text-slate-50">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-slate-200/80">Pregnancy Tracker</p>
          <h1>Simple check-ins for the journey</h1>
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          {userEmail && (
            <p className="text-xs text-slate-200/80">Signed in as {userEmail}</p>
          )}
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              className="text-sm font-semibold text-sky-200 underline underline-offset-4 transition hover:text-sky-50"
              onClick={() => {
                if (window.confirm("Clear all saved pregnancy tracker data?")) {
                  resetAll();
                }
              }}
            >
              Clear everything
            </button>
            <button
              type="button"
              className="text-sm font-semibold text-rose-200 underline underline-offset-4 transition hover:text-rose-100"
              onClick={() => {
                void onSignOut();
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <TrackerCard
        title="Estimated Due Date"
        description="Quick reminder of where you are in the timeline."
      >
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => handleSubmit(e, () => updateDueDate(dueDateForm))}
        >
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-200">
            <span>Date</span>
            <input
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-base text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/30"
              type="date"
              required
              value={dueDateForm.estimatedDate}
              onChange={(e) =>
                setDueDateForm((prev) => ({
                  ...prev,
                  estimatedDate: e.target.value,
                }))
              }
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-200">
            <span>Note</span>
            <input
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-base text-white placeholder:text-slate-300 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/30"
              type="text"
              placeholder="Trimester, doctor, etc."
              value={dueDateForm.note ?? ""}
              onChange={(e) =>
                setDueDateForm((prev) => ({
                  ...prev,
                  note: e.target.value,
                }))
              }
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-xl bg-sky-300/90 px-4 py-2 font-semibold text-slate-900 transition hover:bg-sky-300 sm:w-auto"
          >
            Save due date
          </button>
        </form>
        {snapshot.dueDate.estimatedDate && (
          <p className="text-lg font-medium text-white">
            Next big day: <strong>{formatDate(snapshot.dueDate.estimatedDate)}</strong>{" "}
            {snapshot.dueDate.note && `— ${snapshot.dueDate.note}`}
          </p>
        )}
      </TrackerCard>

      <TrackerCard
        title="Baby's Size"
        description="Based on common fruit-and-veggie comparisons per week."
      >
        {!snapshot.dueDate.estimatedDate && (
          <p className="text-sm text-slate-200/75">
            Add an estimated due date above to see how big your baby is this week.
          </p>
        )}
        {snapshot.dueDate.estimatedDate && babySizeInfo && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-sm uppercase tracking-wide text-slate-200/75">
              Week {babySizeInfo.week}
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              As big as a {babySizeInfo.entry.size}
            </p>
            <p className="mt-1 text-sm text-slate-200/85">
              {babySizeInfo.entry.description}
            </p>
          </div>
        )}
      </TrackerCard>

      <TrackerCard
        title="Mood & Symptoms"
        description="Capture how the day felt so you can spot patterns."
      >
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) =>
            handleSubmit(
              e,
              () => {
                if (editingMoodId) {
                  updateMoodEntry(editingMoodId, moodForm);
                } else {
                  addMoodEntry(moodForm);
                }
              },
              () => {
                cancelMoodEdit();
              }
            )
          }
        >
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-200">
            <span>Date</span>
            <input
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-base text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/30"
              type="date"
              required
              value={moodForm.date}
              onChange={(e) =>
                setMoodForm((prev) => ({ ...prev, date: e.target.value }))
              }
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-200">
            <span>Time</span>
            <input
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-base text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/30"
              type="time"
              value={moodForm.time ?? ""}
              onChange={(e) =>
                setMoodForm((prev) => ({
                  ...prev,
                  time: e.target.value,
                }))
              }
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-200">
            <span>Mood</span>
            <select
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-base text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/30"
              value={moodForm.mood}
              onChange={(e) =>
                setMoodForm((prev) => ({
                  ...prev,
                  mood: e.target.value as MoodEntry["mood"],
                }))
              }
            >
              {moodOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2 flex flex-col gap-1 text-sm font-medium text-slate-200">
            <span>Symptoms / Notes</span>
            <textarea
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-base text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/30"
              rows={3}
              value={moodForm.symptoms}
              onChange={(e) =>
                setMoodForm((prev) => ({
                  ...prev,
                  symptoms: e.target.value,
                }))
              }
            />
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <button type="submit" className={primaryButtonClass}>
              {editingMoodId ? "Update check-in" : "Add check-in"}
            </button>
            {editingMoodId && (
              <button
                type="button"
                className="text-sm font-semibold text-rose-200 underline underline-offset-4 transition hover:text-rose-100"
                onClick={cancelMoodEdit}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>

        <ul className="space-y-3 text-sm text-slate-50">
          {snapshot.moodEntries.length === 0 && (
            <li className="text-slate-200/75">No check-ins yet.</li>
          )}
          {snapshot.moodEntries.map((entry) => (
            <li
              key={entry.id}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <strong>{formatDate(entry.date)}</strong>
                  {entry.time && (
                    <span className="text-slate-200/75"> at {formatTime(entry.time)}</span>
                  )}{" "}
                  — {entry.mood}
                  {entry.symptoms && (
                    <p className="mt-1 text-slate-200/80">{entry.symptoms}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 text-right">
                  <button
                    type="button"
                    className={editButtonClass}
                    onClick={() => beginMoodEdit(entry)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={deleteButtonClass}
                    onClick={() => {
                      if (window.confirm("Delete this check-in?")) {
                        handleMoodDelete(entry.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </TrackerCard>

      <TrackerCard
        title="Appointments"
        description="Keep upcoming visits organised."
      >
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) =>
            handleSubmit(
              e,
              () => {
                if (editingAppointmentId) {
                  updateAppointment(editingAppointmentId, appointmentForm);
                } else {
                  addAppointment(appointmentForm);
                }
              },
              () => {
                cancelAppointmentEdit();
              }
            )
          }
        >
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-200">
            <span>Date</span>
            <input
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-base text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/30"
              type="date"
              required
              value={appointmentForm.date}
              onChange={(e) =>
                setAppointmentForm((prev) => ({
                  ...prev,
                  date: e.target.value,
                }))
              }
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-200">
            <span>Time</span>
            <input
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-base text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/30"
              type="time"
              value={appointmentForm.time ?? ""}
              onChange={(e) =>
                setAppointmentForm((prev) => ({
                  ...prev,
                  time: e.target.value,
                }))
              }
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-200">
            <span>Provider</span>
            <input
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-base text-white placeholder:text-slate-300 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/30"
              type="text"
              required
              placeholder="Doctor / Clinic"
              value={appointmentForm.provider}
              onChange={(e) =>
                setAppointmentForm((prev) => ({
                  ...prev,
                  provider: e.target.value,
                }))
              }
            />
          </label>
          <label className="sm:col-span-2 flex flex-col gap-1 text-sm font-medium text-slate-200">
            <span>Notes</span>
            <textarea
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-base text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/30"
              rows={2}
              value={appointmentForm.notes}
              onChange={(e) =>
                setAppointmentForm((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
            />
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <button type="submit" className={primaryButtonClass}>
              {editingAppointmentId ? "Update appointment" : "Add appointment"}
            </button>
            {editingAppointmentId && (
              <button
                type="button"
                className="text-sm font-semibold text-rose-200 underline underline-offset-4 transition hover:text-rose-100"
                onClick={cancelAppointmentEdit}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>

        <ul className="space-y-3 text-sm text-slate-50">
          {snapshot.appointments.length === 0 && (
            <li className="text-slate-200/75">No appointments tracked.</li>
          )}
          {snapshot.appointments.map((appt: Appointment) => (
            <li
              key={appt.id}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <strong>{formatDate(appt.date)}</strong>
                  {appt.time && (
                    <span className="text-slate-200/75"> at {formatTime(appt.time)}</span>
                  )}{" "}
                  — {appt.provider}
                  {appt.notes && <p className="mt-1 text-slate-200/80">{appt.notes}</p>}
                </div>
                <div className="flex flex-col items-end gap-1 text-right">
                  <button
                    type="button"
                    className={editButtonClass}
                    onClick={() => beginAppointmentEdit(appt)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={deleteButtonClass}
                    onClick={() => {
                      if (window.confirm("Delete this appointment?")) {
                        handleAppointmentDelete(appt.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </TrackerCard>

      <TrackerCard
        title="Supplements"
        description="Log prenatal vitamins, iron, etc."
      >
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) =>
            handleSubmit(
              e,
              () => {
                if (editingSupplementId) {
                  updateSupplement(editingSupplementId, supplementForm);
                } else {
                  addSupplement(supplementForm);
                }
              },
              () => {
                cancelSupplementEdit();
              }
            )
          }
        >
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-200">
            <span>Date</span>
            <input
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-base text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/30"
              type="date"
              required
              value={supplementForm.date}
              onChange={(e) =>
                setSupplementForm((prev) => ({
                  ...prev,
                  date: e.target.value,
                }))
              }
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-200">
            <span>Name</span>
            <input
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-base text-white placeholder:text-slate-300 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/30"
              type="text"
              required
              placeholder="Prenatal, DHA..."
              value={supplementForm.name}
              onChange={(e) =>
                setSupplementForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </label>
          <label className="sm:col-span-2 flex flex-col gap-1 text-sm font-medium text-slate-200">
            <span>Details</span>
            <textarea
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-base text-white focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/30"
              rows={2}
              placeholder="Dose, reminder, time of day"
              value={supplementForm.details}
              onChange={(e) =>
                setSupplementForm((prev) => ({
                  ...prev,
                  details: e.target.value,
                }))
              }
            />
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <button type="submit" className={primaryButtonClass}>
              {editingSupplementId ? "Update supplement" : "Add supplement"}
            </button>
            {editingSupplementId && (
              <button
                type="button"
                className="text-sm font-semibold text-rose-200 underline underline-offset-4 transition hover:text-rose-100"
                onClick={cancelSupplementEdit}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>

        <ul className="space-y-3 text-sm text-slate-50">
          {snapshot.supplements.length === 0 && (
            <li className="text-slate-200/75">No supplements logged.</li>
          )}
          {snapshot.supplements.map((supp: SupplementLog) => (
            <li
              key={supp.id}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <strong>{formatDate(supp.date)}</strong> — {supp.name}
                  {supp.details && (
                    <p className="mt-1 text-slate-200/80">{supp.details}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 text-right">
                  <button
                    type="button"
                    className={editButtonClass}
                    onClick={() => beginSupplementEdit(supp)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={deleteButtonClass}
                    onClick={() => {
                      if (window.confirm("Delete this supplement log?")) {
                        handleSupplementDelete(supp.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </TrackerCard>
    </div>
  );
};
const AuthScreen = () => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoadingAuth(true);
    setError(null);
    try {
      if (mode === "signIn") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to authenticate");
    } finally {
      setLoadingAuth(false);
    }
  };

  const toggleMode = () => setMode((prev) => (prev === "signIn" ? "signUp" : "signIn"));

  const submitLabel = mode === "signIn" ? "Sign in" : "Create account";
  const helperLabel =
    mode === "signIn" ? "New here?" : "Already have an account?";
  const helperAction = mode === "signIn" ? "Create one" : "Sign in";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-50">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl">
        <header className="space-y-1 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-300">
            Pregnancy Tracker
          </p>
          <h1 className="text-2xl font-semibold">Sign in to continue</h1>
          <p className="text-sm text-slate-300">
            Use your email and a password to keep updates synced securely.
          </p>
        </header>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-200">
            <span>Email</span>
            <input
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-base text-white placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/30"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-200">
            <span>Password</span>
            <input
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-base text-white placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/30"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signIn" ? "current-password" : "new-password"}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="text-sm text-rose-200">{error}</p>}
          <button
            type="submit"
            disabled={loadingAuth}
            className="w-full rounded-xl bg-sky-300/90 px-4 py-2 font-semibold text-slate-900 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingAuth ? "Working..." : submitLabel}
          </button>
        </form>
        <p className="text-center text-sm text-slate-300">
          {helperLabel}{" "}
          <button
            type="button"
            className="font-semibold text-sky-200 underline underline-offset-4"
            onClick={toggleMode}
          >
            {helperAction}
          </button>
        </p>
      </div>
    </div>
  );
};

const App = () => {
  const { user, loading: authLoading, signOut } = useAuth();

  const repository = useMemo(() => {
    if (!user) return null;
    return new SupabasePregnancyRepository(user.id);
  }, [user?.id]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
          Checking session...
        </p>
      </div>
    );
  }

  if (!user || !repository) {
    return <AuthScreen />;
  }

  return (
    <TrackerView
      repository={repository}
      userEmail={user.email ?? undefined}
      onSignOut={signOut}
    />
  );
};

export default App;

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";
import { TrackerCard } from "./components/TrackerCard";
import { usePregnancyData } from "./hooks/usePregnancyData";
import type {
  Appointment,
  MoodEntry,
  SupplementLog,
  DueDateInfo,
} from "./types";

const moodOptions: MoodEntry["mood"][] = ["Great", "Good", "Okay", "Tired", "Nauseous"];

/**
 * <summary>Formats a YYYY-MM-DD date into a friendlier label.</summary>
 */
const formatDate = (date: string) =>
  date ? new Date(date).toLocaleDateString(undefined, { dateStyle: "medium" }) : "";

/**
 * <summary>Main screen that wires tracker cards with the data hook.</summary>
 */
const App = () => {
  const { snapshot, updateDueDate, addMoodEntry, addAppointment, addSupplement, resetAll } =
    usePregnancyData();
  const [dueDateForm, setDueDateForm] = useState<DueDateInfo>(snapshot.dueDate);
  const [moodForm, setMoodForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    mood: "Good" as MoodEntry["mood"],
    symptoms: "",
  });
  const [appointmentForm, setAppointmentForm] = useState({
    date: "",
    provider: "",
    notes: "",
  });
  const [supplementForm, setSupplementForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    name: "",
    details: "",
  });

  useEffect(() => setDueDateForm(snapshot.dueDate), [snapshot.dueDate]);

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

  return (
    <div className="app-shell">
      <header className="page-header">
        <div>
          <p className="muted">Pregnancy Tracker</p>
          <h1>Simple check-ins for the journey</h1>
        </div>
        <button
          type="button"
          className="link-button"
          onClick={() => {
            if (window.confirm("Clear all saved pregnancy tracker data?")) {
              resetAll();
            }
          }}
        >
          Clear everything
        </button>
      </header>

      <TrackerCard
        title="Estimated Due Date"
        description="Quick reminder of where you are in the timeline."
      >
        <form
          className="form-grid"
          onSubmit={(e) =>
            handleSubmit(e, () => updateDueDate(dueDateForm))
          }
        >
          <label>
            <span>Date</span>
            <input
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
          <label>
            <span>Note</span>
            <input
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
          <button type="submit">Save due date</button>
        </form>
        {snapshot.dueDate.estimatedDate && (
          <p className="highlight">
            Next big day: <strong>{formatDate(snapshot.dueDate.estimatedDate)}</strong>{" "}
            {snapshot.dueDate.note && `— ${snapshot.dueDate.note}`}
          </p>
        )}
      </TrackerCard>

      <TrackerCard
        title="Mood & Symptoms"
        description="Capture how the day felt so you can spot patterns."
      >
        <form
          className="form-grid"
          onSubmit={(e) =>
            handleSubmit(e, () => addMoodEntry(moodForm), () =>
              setMoodForm({
                date: new Date().toISOString().slice(0, 10),
                mood: "Good",
                symptoms: "",
              })
            )
          }
        >
          <label>
            <span>Date</span>
            <input
              type="date"
              required
              value={moodForm.date}
              onChange={(e) =>
                setMoodForm((prev) => ({ ...prev, date: e.target.value }))
              }
            />
          </label>
          <label>
            <span>Mood</span>
            <select
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
          <label className="full-width">
            <span>Symptoms / Notes</span>
            <textarea
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
          <button type="submit">Add check-in</button>
        </form>

        <ul className="list">
          {snapshot.moodEntries.length === 0 && (
            <li className="muted">No check-ins yet.</li>
          )}
          {snapshot.moodEntries.map((entry) => (
            <li key={entry.id}>
              <strong>{formatDate(entry.date)}</strong> — {entry.mood}
              {entry.symptoms && <p className="muted">{entry.symptoms}</p>}
            </li>
          ))}
        </ul>
      </TrackerCard>

      <TrackerCard
        title="Appointments"
        description="Keep upcoming visits organised."
      >
        <form
          className="form-grid"
          onSubmit={(e) =>
            handleSubmit(
              e,
              () => addAppointment(appointmentForm),
              () =>
                setAppointmentForm({
                  date: "",
                  provider: "",
                  notes: "",
                })
            )
          }
        >
          <label>
            <span>Date</span>
            <input
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
          <label>
            <span>Provider</span>
            <input
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
          <label className="full-width">
            <span>Notes</span>
            <textarea
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
          <button type="submit">Add appointment</button>
        </form>

        <ul className="list">
          {snapshot.appointments.length === 0 && (
            <li className="muted">No appointments tracked.</li>
          )}
          {snapshot.appointments.map((appt: Appointment) => (
            <li key={appt.id}>
              <strong>{formatDate(appt.date)}</strong> — {appt.provider}
              {appt.notes && <p className="muted">{appt.notes}</p>}
            </li>
          ))}
        </ul>
      </TrackerCard>

      <TrackerCard
        title="Supplements"
        description="Log prenatal vitamins, iron, etc."
      >
        <form
          className="form-grid"
          onSubmit={(e) =>
            handleSubmit(
              e,
              () => addSupplement(supplementForm),
              () =>
                setSupplementForm({
                  date: new Date().toISOString().slice(0, 10),
                  name: "",
                  details: "",
                })
            )
          }
        >
          <label>
            <span>Date</span>
            <input
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
          <label>
            <span>Name</span>
            <input
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
          <label className="full-width">
            <span>Details</span>
            <textarea
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
          <button type="submit">Add supplement</button>
        </form>

        <ul className="list">
          {snapshot.supplements.length === 0 && (
            <li className="muted">No supplements logged.</li>
          )}
          {snapshot.supplements.map((supp: SupplementLog) => (
            <li key={supp.id}>
              <strong>{formatDate(supp.date)}</strong> — {supp.name}
              {supp.details && <p className="muted">{supp.details}</p>}
            </li>
          ))}
        </ul>
      </TrackerCard>
    </div>
  );
};

export default App;

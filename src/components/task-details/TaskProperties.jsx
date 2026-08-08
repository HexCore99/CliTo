import DatePicker from "@/components/DatePicker";
import FlagPicker from "@/components/FlagPicker";

const STATUS_OPTIONS = [
  { value: "todo", label: "Todo" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];


function PropertyRow({ label, children }) {
  return (
    <label className="flex min-h-14 items-center justify-between gap-4 px-4 py-3">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="min-w-0 flex-1 text-right">{children}</div>
    </label>
  );
}

export default function TaskProperties({ taskId, draft, onChange }) {
  return (
    <section
      aria-label="Task properties"
      className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card"
    >
      <PropertyRow label="Status">
        <select
          value={draft.status}
          aria-label="Task status"
          className="max-w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-950"
          onChange={(event) => onChange("status", event.target.value)}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </PropertyRow>

      <PropertyRow label="Due date">
        <DatePicker
          taskId={taskId}
          dueDate={draft.due_date}
          onChange={(_taskId, dueDate) => onChange("due_date", dueDate)}
        />
      </PropertyRow>

      <PropertyRow label="Priority">
        <FlagPicker
          taskId={taskId}
          taskPriority={draft.priority}
          showLabel
          onChange={(priority) => onChange("priority", priority)}
        />
      </PropertyRow>
    </section>
  );
}

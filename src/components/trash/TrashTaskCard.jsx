import {
  CalendarDays,
  Clock3,
  Flag,
  LoaderCircle,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const RETENTION_DAYS = 30;

const statusStyles = {
  todo: {
    label: "Todo",
    className:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300",
  },
  "in-progress": {
    label: "In Progress",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",
  },
  completed: {
    label: "Completed",
    className:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300",
  },
};

const priorityStyles = {
  1: { label: "Priority 1", color: "text-red-600", fill: "fill-red-600" },
  2: {
    label: "Priority 2",
    color: "text-amber-500",
    fill: "fill-amber-500",
  },
  3: {
    label: "Priority 3",
    color: "text-blue-600",
    fill: "fill-blue-600",
  },
  4: { label: "Priority 4", color: "text-gray-500", fill: "fill-none" },
};

function formatDueDate(dueDate) {
  if (!dueDate) return "No due date";

  const normalizedDate = /^\d{4}-\d{2}-\d{2}$/.test(dueDate)
    ? `${dueDate}T00:00:00`
    : dueDate;
  const parsedDate = new Date(normalizedDate);

  if (Number.isNaN(parsedDate.getTime())) return "Invalid due date";

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function getDeletionSummary(trashedAt) {
  if (!trashedAt) return "Deletion date unavailable";

  const deletedDate = new Date(trashedAt);
  if (Number.isNaN(deletedDate.getTime())) return "Deletion date unavailable";

  const elapsedDays = Math.max(
    0,
    Math.floor((Date.now() - deletedDate.getTime()) / DAY_IN_MS),
  );
  const remainingDays = Math.max(0, RETENTION_DAYS - elapsedDays);
  const deletedLabel =
    elapsedDays === 0
      ? "Deleted today"
      : `Deleted ${elapsedDays} ${elapsedDays === 1 ? "day" : "days"} ago`;
  const remainingLabel =
    remainingDays === 0
      ? "Scheduled for permanent deletion"
      : `${remainingDays} ${remainingDays === 1 ? "day" : "days"} left`;

  return `${deletedLabel} · ${remainingLabel}`;
}

export default function TrashTaskCard({
  task,
  onRestore,
  onDelete,
  isRestoring = false,
  isDeleting = false,
  actionsDisabled = false,
}) {
  const status = statusStyles[task.status] ?? {
    label: task.status || "Unknown status",
    className: "border-border bg-muted text-muted-foreground",
  };
  const priority = priorityStyles[Number(task.priority)] ?? priorityStyles[4];
  const taskActionsDisabled = actionsDisabled || isRestoring || isDeleting;

  return (
    <article className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${status.className}`}
          >
            {status.label}
          </span>

          <h2 className="mt-3 break-words text-base leading-6 font-medium">
            {task.name || "Untitled task"}
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" />
              {formatDueDate(task.due_date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Flag
                className={`size-4 ${priority.color} ${priority.fill}`}
                aria-hidden="true"
              />
              {priority.label}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-4" aria-hidden="true" />
              {getDeletionSummary(task.trashed_at)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 border-t border-border pt-4 sm:border-t-0 sm:pt-0">
          <Button
            type="button"
            variant="outline"
            className="flex-1 sm:flex-none"
            disabled={taskActionsDisabled || !onRestore}
            onClick={() => onRestore?.(task)}
          >
            {isRestoring ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <RotateCcw aria-hidden="true" />
            )}
            {isRestoring ? "Restoring..." : "Restore"}
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                disabled={taskActionsDisabled || !onDelete}
                onClick={() => onDelete?.(task)}
              >
                {isDeleting ? (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 aria-hidden="true" />
                )}
                <span className="sr-only">Delete {task.name} forever</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6}>
              Delete forever
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </article>
  );
}

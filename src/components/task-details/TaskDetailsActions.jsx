import { Trash2Icon } from "lucide-react";

export default function TaskDetailsActions({
  isDeleting,
  isSaving,
  saveDisabled,
  onDelete,
  onCancel,
  onSave,
}) {
  return (
    <footer className="flex items-center gap-3 border-t border-border bg-card px-5 py-3">
      <button
        type="button"
        title="Move task to Trash"
        aria-label="Move task to Trash"
        disabled={isDeleting || isSaving}
        className="mr-auto flex size-10 items-center justify-center rounded-xl border border-red-200 text-red-500 transition-colors hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onDelete}
      >
        <Trash2Icon size={19} />
      </button>

      <button
        type="button"
        className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        disabled={isDeleting || isSaving}
        onClick={onCancel}
      >
        Cancel
      </button>

      <button
        type="button"
        disabled={saveDisabled || isDeleting || isSaving}
        className="rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onSave}
      >
        {isSaving ? "Saving..." : "Save"}
      </button>
    </footer>
  );
}

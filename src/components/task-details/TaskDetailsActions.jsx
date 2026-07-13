import { Trash2Icon } from "lucide-react";

export default function TaskDetailsActions({
  isDeleting,
  saveDisabled,
  onDelete,
  onCancel,
  onSave,
}) {
  return (
    <footer className="flex items-center gap-3 border-t border-slate-200 bg-white px-5 py-3">
      <button
        type="button"
        title="Move task to Trash"
        aria-label="Move task to Trash"
        disabled={isDeleting}
        className="mr-auto flex size-10 items-center justify-center rounded-xl border border-red-200 text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onDelete}
      >
        <Trash2Icon size={19} />
      </button>

      <button
        type="button"
        className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        onClick={onCancel}
      >
        Cancel
      </button>

      <button
        type="button"
        disabled={saveDisabled}
        className="rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onSave}
      >
        Save
      </button>
    </footer>
  );
}

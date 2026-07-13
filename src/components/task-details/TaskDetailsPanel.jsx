import { useEffect, useState } from "react";
import TaskDescription from "./TaskDescription";
import TaskDetailsActions from "./TaskDetailsActions";
import TaskDetailsHeader from "./TaskDetailsHeader";
import TaskNotes from "./TaskNotes";
import TaskProperties from "./TaskProperties";

function createDraft(task) {
  return {
    name: task.name ?? "",
    status: task.status ?? "todo",
    due_date: task.due_date ?? null,
    priority: Number(task.priority ?? 4),
    description: task.description ?? "",
    notes: Array.isArray(task.notes)
      ? task.notes.map((note) => ({ ...note }))
      : [],
  };
}

export default function TaskDetailsPanel({
  task,
  breadcrumb,
  onClose,
  onDelete,
  onSave,
}) {
  const [draft, setDraft] = useState(() => createDraft(task));
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setDraft(createDraft(task));
    setIsDeleting(false);
  }, [task.id]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  function updateDraft(field, value) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  }

  function handleSave() {
    const name = draft.name.trim();
    if (!name) return;

    onSave(task.id, {
      ...draft,
      name,
      notes: draft.notes
        .map((note) => ({ ...note, text: note.text.trim() }))
        .filter((note) => note.text),
    });
  }

  async function handleDelete() {
    setIsDeleting(true);

    try {
      await onDelete(task.id);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-label={"Task details for " + task.name}
      className="fixed right-2 top-16 bottom-2 z-50 flex w-[400px] max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl min-[1429px]:static min-[1429px]:z-auto min-[1429px]:h-[calc(100vh-3.5rem)] min-[1429px]:max-w-[42vw] min-[1429px]:shrink-0 min-[1429px]:rounded-none min-[1429px]:border-y-0 min-[1429px]:border-r-0 min-[1429px]:shadow-none"
    >
      <TaskDetailsHeader
        name={draft.name}
        breadcrumb={breadcrumb}
        onNameChange={(name) => updateDraft("name", name)}
        onClose={onClose}
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-4 px-5 py-4">
          <TaskProperties
            taskId={task.id}
            draft={draft}
            onChange={updateDraft}
          />

          <TaskDescription
            value={draft.description}
            onChange={(description) => updateDraft("description", description)}
          />

          <TaskNotes
            key={task.id}
            notes={draft.notes}
            onChange={(notes) => updateDraft("notes", notes)}
          />
        </div>

        <TaskDetailsActions
          isDeleting={isDeleting}
          saveDisabled={!draft.name.trim()}
          onDelete={handleDelete}
          onCancel={onClose}
          onSave={handleSave}
        />
      </div>
    </aside>
  );
}

import { useEffect, useState } from "react";
import TaskDescription from "./TaskDescription";
import TaskDetailsActions from "./TaskDetailsActions";
import TaskDetailsHeader from "./TaskDetailsHeader";
import TaskNotes from "./TaskNotes";
import TaskProperties from "./TaskProperties";
import { useTaskStore } from "@/stores/useTaskStore";
import { useSortingStore } from "@/stores/useSortingStore";

function createDraft(task) {
  return {
    name: task.name ?? "",
    status: task.status ?? "todo",
    due_date: task.due_date ?? null,
    priority: Number(task.priority ?? 4),
    description: task.description ?? "",
    notes: Array.isArray(task.notes)
      ? task.notes.map((note) => ({
          ...note,
          text: note.text ?? note.description ?? "",
          completed: Boolean(note.completed ?? note.is_completed),
        }))
      : [],
  };
}

export default function TaskDetailsPanel({
  task,
  breadcrumb,
  onClose,
}) {
  const [draft, setDraft] = useState(() => createDraft(task));
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const saveTaskDetails = useTaskStore((state) => state.saveTaskDetails);
  const moveToTrash = useTaskStore((state) => state.moveToTrash);
  const sortOptions = useSortingStore((state) => state.sortOptions);
  const sortColumn = useSortingStore((state) => state.sortColumn);

  useEffect(() => {
    setDraft(createDraft(task));
    setIsDeleting(false);
    setIsSaving(false);
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

  async function handleSave() {
    const name = draft.name.trim();
    if (!name) return;

    const changes = {
      ...draft,
      name,
      description: draft.description.trim() || null,
      notes: draft.notes
        .map((note) => ({ ...note, text: (note.text ?? "").trim() }))
        .filter((note) => note.text),
    };

    setIsSaving(true);

    try {
      await saveTaskDetails(task, changes);

      const affectedColumns = new Set([task.status, changes.status]);

      for (const columnStatus of affectedColumns) {
        const sortOption = sortOptions[columnStatus];

        if (sortOption && sortOption !== "default") {
          await sortColumn(columnStatus, sortOption);
        }
      }

      onClose();
    } catch (error) {
      console.error("Could not save task details:", error);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);

    try {
      await moveToTrash(task.id);
      onClose();
    } catch (error) {
      console.error("Could not move task to Trash:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-label={"Task details for " + task.name}
      className="fixed right-2 top-16 bottom-2 z-50 flex w-100 max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl min-[1429px]:static min-[1429px]:z-auto min-[1429px]:h-[calc(100vh-3.5rem)] min-[1429px]:max-w-[42vw] min-[1429px]:shrink-0 min-[1429px]:rounded-none min-[1429px]:border-y-0 min-[1429px]:border-r-0 min-[1429px]:shadow-none"
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
          isSaving={isSaving}
          saveDisabled={!draft.name.trim()}
          onDelete={handleDelete}
          onCancel={onClose}
          onSave={handleSave}
        />
      </div>
    </aside>
  );
}

import { useState } from "react";
import TrashConfirmDialog from "./trash/TrashConfirmDialog";
import TrashHeader from "./trash/TrashHeader";
import TrashTaskList from "./trash/TrashTaskList";

function TrashBoard({
  tasks = [],
  isLoading = false,
  onRestore,
  onDeleteForever,
  onEmptyTrash,
}) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busyAction, setBusyAction] = useState(null);
  const trashTasks = Array.isArray(tasks) ? tasks : [];

  async function handleRestore(task) {
    if (!onRestore || busyAction) return;

    setBusyAction({ type: "restore", id: String(task.id) });

    try {
      await onRestore(task);
    } catch (error) {
      console.error("Failed to restore task:", error);
    } finally {
      setBusyAction(null);
    }
  }

  function requestTaskDelete(task) {
    if (!onDeleteForever || busyAction) return;
    setPendingDelete({ type: "delete-one", task });
  }

  function requestEmptyTrash() {
    if (!onEmptyTrash || trashTasks.length === 0 || busyAction) return;
    setPendingDelete({ type: "empty-all" });
  }

  async function confirmDelete() {
    if (!pendingDelete || busyAction) return;

    const action = pendingDelete;
    const nextBusyAction =
      action.type === "delete-one"
        ? { type: "delete-one", id: String(action.task.id) }
        : { type: "empty-all" };

    setBusyAction(nextBusyAction);

    try {
      if (action.type === "delete-one") {
        await onDeleteForever(action.task);
      } else {
        await onEmptyTrash();
      }

      setPendingDelete(null);
    } catch (error) {
      console.error("Failed to permanently delete trashed task(s):", error);
    } finally {
      setBusyAction(null);
    }
  }

  const deletingOneTask = pendingDelete?.type === "delete-one";
  const dialogTitle = deletingOneTask
    ? "Delete this task forever?"
    : "Empty Trash?";
  const dialogDescription = deletingOneTask
    ? `“${pendingDelete.task.name || "Untitled task"}” will be permanently deleted. This action cannot be undone.`
    : `All ${trashTasks.length} ${trashTasks.length === 1 ? "item" : "items"} in Trash will be permanently deleted. This action cannot be undone.`;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <TrashHeader
        itemCount={trashTasks.length}
        onEmptyTrash={onEmptyTrash ? requestEmptyTrash : undefined}
        isEmptying={busyAction?.type === "empty-all"}
        actionsDisabled={isLoading || Boolean(busyAction)}
      />

      <section className="mt-6" aria-label="Trashed tasks">
        <TrashTaskList
          tasks={trashTasks}
          isLoading={isLoading}
          onRestore={onRestore ? handleRestore : undefined}
          onDelete={onDeleteForever ? requestTaskDelete : undefined}
          busyAction={busyAction}
        />
      </section>

      <TrashConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title={dialogTitle}
        description={dialogDescription}
        confirmLabel={deletingOneTask ? "Delete forever" : "Empty Trash"}
        onConfirm={confirmDelete}
        isConfirming={
          busyAction?.type === "delete-one" ||
          busyAction?.type === "empty-all"
        }
      />
    </div>
  );
}

export default TrashBoard;

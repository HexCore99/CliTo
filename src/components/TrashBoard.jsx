import { useEffect, useState } from "react";
import TrashConfirmDialog from "./trash/TrashConfirmDialog";
import TrashHeader from "./trash/TrashHeader";
import TrashTaskList from "./trash/TrashTaskList";
import { useTrashStore } from "@/stores/useTrashStore";

function TrashBoard() {
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const getTrashTasks = useTrashStore((state) => state.get_trash_tasks);
  const trashTasks = useTrashStore((state) => state.trashTasks);

  const restore_task = useTrashStore((state) => state.restore_task);
  const delete_task = useTrashStore((state) => state.delete_from_trash);
  const empty_trash = useTrashStore((state) => state.empty_trash);

  useEffect(() => {
    async function loadTrashTasks() {
    await  getTrashTasks();
   }
    loadTrashTasks();
  },[])

  async function handleRestore(task) {
    await restore_task(task.id);
  }

  async function requestTaskDelete(task) {
    setPendingDelete({
      type: "delete-one",
      task
    });
  }

 async function requestEmptyTrash() {
   setPendingDelete({ type: "empty-all", });
  }

  async function confirmDelete() {
    if (!pendingDelete) return;

    setIsConfirming(true);

    try {
      if(pendingDelete.type==="delete-one")
      {
        await delete_task(pendingDelete.task.id);
        }
      else {
        await empty_trash();
        }
      setPendingDelete(null);
    }
    catch (err) {
      console.log("Failed to delete from Trash", err);
    }
    finally {
      setIsConfirming(false);
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
        onEmptyTrash={requestEmptyTrash}
        isEmptying={false}
        actionsDisabled={false}
      />

      <section className="mt-6" aria-label="Trashed tasks">
        <TrashTaskList
          tasks={trashTasks}
          isLoading={false}
          onRestore={handleRestore}
          onDelete={requestTaskDelete}
          busyAction={null}
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
        isConfirming={isConfirming}
      />
    </div>
  );
}

export default TrashBoard;

import { useCallback, useState } from "react";
import { Check, Trash2, SquarePen, X } from "lucide-react";
import { useTaskStore } from "@/stores/useTaskStore";
import { useTaskDrag } from "@/hooks/useTaskDrag";
import DatePicker from "./DatePicker";
import Flag from "./Flag";
import TaskDragHandle from "./TaskDragHandle";
import { useSortingStore } from "@/stores/useSortingStore";

export default function Task({
  task,
  onDelete,
  isSelected = false,
  onOpenDetails,
}) {
  const changeTaskStatus = useTaskStore((state) => state.changeTaskStatus);

  const setNewDate = useTaskStore((state) => state.set_date);
  const updateTaskName = useTaskStore((state) => state.updateTaskName);
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(task.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    isDragging,
    style,
  } = useTaskDrag(task.id);

  async function handleStatusChange(nextStatus) {
    const previousStatus = task.status;

    await changeTaskStatus(task.id, nextStatus);

    const { sortOptions, sortColumn } = useSortingStore.getState();
    const columnsToReSort = new Set([previousStatus, nextStatus]);

    for (const columnStatus of columnsToReSort) {
      const sortOption = sortOptions[columnStatus];

      if (sortOption && sortOption !== "default") {
        await sortColumn(columnStatus, sortOption);
      }
    }
  }

  function startEditing() {
    setDraftName(task.name);
    setIsEditing(true);
  }

  function cancelEditing() {
    setDraftName(task.name);
    setIsEditing(false);
  }

  async function saveEditing() {
    const nextName = draftName.trim();

    if (nextName) {
      await updateTaskName(task.id, nextName);
    }

    setIsEditing(false);
  }

  const set_date = useCallback(
    async (taskId, newDate) => {
      await setNewDate(taskId, newDate);
      const { sortOptions, sortColumn } = useSortingStore.getState();
      const sortOption = sortOptions[task.status];
      if (sortOption !== "default") {
        await sortColumn(task.status, sortOption);
      }
    },
    [task.status, setNewDate],
  );

  function handleCardClick(event) {
    if (isDragging || isEditing) return;

    const interactiveTarget =
      event.target instanceof Element &&
      event.target.closest(
        "button, input, textarea, select, a, [role='menuitem'], [role='option']",
      );

    if (interactiveTarget) return;

    onOpenDetails?.(task.id);
  }

  function handleCardKeyDown(event) {
    if (event.target !== event.currentTarget) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpenDetails?.(task.id);
    }
  }

  const cardClassName = [
    taskColor[task.status ?? "todo"],
    "h-fit w-full min-w-[300px] cursor-pointer rounded-lg px-3 py-3 shadow-sm transition-shadow hover:shadow-lg",
    isSelected ? "ring-2 ring-orange-400 ring-offset-2" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={setNodeRef}
      style={style}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      className={cardClassName}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      <div className="flex items-center justify-between gap-3">
        <input
          type="checkbox"
          checked={task.status === "completed"}
          onPointerDown={(event) => event.stopPropagation()}
          onChange={(event) => {
            const nextStatus = event.target.checked ? "completed" : "todo";
            handleStatusChange(nextStatus);
          }}
        />
        {isEditing ? (
          <input
            className="min-w-0 flex-1 rounded border border-orange-300 bg-white px-2 py-1 text-sm outline-none"
            value={draftName}
            autoFocus
            onPointerDown={(event) => event.stopPropagation()}
            onChange={(event) => setDraftName(event.target.value)}
            onKeyDown={(event) => {
              event.stopPropagation();

              if (event.key === "Enter") {
                saveEditing();
              }

              if (event.key === "Escape") {
                cancelEditing();
              }
            }}
          />
        ) : (
          <p className="min-w-0 flex-1 break-words">{task.name}</p>
        )}

        {/* {isEditing ? (
          <>
            <button
              type="button"
              className="shrink-0 p-2 hover:text-green-600"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={saveEditing}
            >
              <Check size={20} />
            </button>
            <button
              type="button"
              className="shrink-0 p-2 hover:text-red-500"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={cancelEditing}
            >
              <X size={20} />
            </button>
          </>
        ) : (
          <button
            type="button"
            className="shrink-0 p-2 hover:text-blue-500"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={startEditing}
          >
            <SquarePen
              className="cursor-pointer hover:text-blue-500"
              size={20}
            />
          </button>
        )}*/}
        {/* <button
          type="button"
          className="shrink-0 p-2 hover:text-blue-500"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onDelete(task.id)}
        >
          <Trash2 size={20} strokeWidth={1.25} />
        </button>*/}


        <TaskDragHandle
          attributes={attributes}
          listeners={listeners}
          setActivatorNodeRef={setActivatorNodeRef}
        />
      </div>
      <div className="mt-2 flex items-center gap-1">
        <DatePicker taskId={task.id} onChange={set_date} />
        <Flag taskId={task.id} taskPriority={task.priority} />
      </div>
    </div>
  );
}

const taskColor = {
  todo: "bg-orange-100 border-orange-300",
  "in-progress": "bg-blue-100 border-blue-300",
  completed: "bg-green-100 border-green-300",
};

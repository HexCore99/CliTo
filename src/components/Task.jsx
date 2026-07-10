import React from "react";
import { useCallback } from "react";
import { useState } from "react";
import { Check, Trash2, SquarePen, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { useTaskStore } from "@/stores/useTaskStore";
import DatePicker from "./DatePicker";
import Flag from "./Flag";
import { useSortingStore } from "@/stores/useSortingStore";

export default function Task({ task, onDelete }) {
  const changeTaskStatus = useTaskStore((state) => state.changeTaskStatus);

  const setNewDate = useTaskStore((state) => state.set_date);
  const updateTaskName = useTaskStore((state) => state.updateTaskName);
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(task.name);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: String(task.id),
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px,0)`
      : undefined,
    transition,
  };

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
      // call the sorting function after updating the date
      const { sortOptions, sortColumn } = useSortingStore.getState();
      const sortOption = sortOptions[task.status];
      if (sortOption !== "default") {
        await sortColumn(task.status, sortOption);
      }
    },
    [task.status, setNewDate],
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${taskColor[task.status ?? "todo"]}  shadow-sm h-fit w-full px-3 py-3 rounded-lg hover:shadow-lg cursor-grab active:cursor-grabbing`}
    >
      <div className={`flex items-center justify-between gap-3 `}>
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
          <p className="min-w-0 flex-1 break-words ">{task.name}</p>
        )}

        {isEditing ? (
          <>
            <button
              className="shrink-0 p-2 hover:text-green-600"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={saveEditing}
            >
              <Check size={20} />
            </button>
            <button
              className="shrink-0 p-2 hover:text-red-500"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={cancelEditing}
            >
              <X size={20} />
            </button>
          </>
        ) : (
          <button
            className="shrink-0 p-2  hover:text-blue-500"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={startEditing}
          >
            <SquarePen
              className="cursor-pointer hover:text-blue-500"
              size={20}
            />
          </button>
        )}
        <button
          className="shrink-0 p-2  hover:text-blue-500"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onDelete(task.id)}
        >
          <Trash2 size={20} strokeWidth={1.25} />
        </button>
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

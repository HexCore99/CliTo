import React from "react";
import { Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { useTaskStore } from "@/stores/useTaskStore";
import Datee from "./Datee";
import Flag from "./Flag";

const taskColor = {
  todo: "bg-orange-100 border-orange-300",
  "in-progress": "bg-blue-100 border-blue-300",
  completed: "bg-green-100 border-green-300",
};

export default function Task({ task, onDelete }) {
  const changeTaskStatus = useTaskStore((state) => state.changeTaskStatus);

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
            event.target.checked
              ? changeTaskStatus(task.id, "completed")
              : changeTaskStatus(task.id, "todo");
          }}
        />
        <p className="min-w-0 flex-1 break-words ">{task.name}</p>
        {/* <SquarePen className="cursor-pointer hover:text-blue-500" size={20} />*/}
        <button
          className="shrink-0 p-2  hover:text-blue-500"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onDelete(task.id)}
        >
          <Trash2 size={20} strokeWidth={1.25} />
        </button>
      </div>
      <div className="mt-2 flex items-center gap-1">
        <Datee />
        <Flag />
      </div>
    </div>
  );
}

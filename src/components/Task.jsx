import React from "react";
import { SquarePen, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const taskColor = {
  todo: "bg-orange-100 border-orange-300",
  "in-progress": "bg-blue-100 border-blue-300",
  completed: "bg-green-100 border-green-300",
};

export default function Task({ task, onDelete }) {
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
      <div className={`flex justify-between gap-3 `}>
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
    </div>
  );
}

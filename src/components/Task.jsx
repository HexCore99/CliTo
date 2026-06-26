import React from "react";
import { SquarePen, Trash2 } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";

export default function Task({ task, onDelete }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: String(task.id),
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-blue-400/20 backdrop-blur-md border border-blue-200/30 shadow-sm h-fit w-full px-3 py-3 rounded-lg hover:shadow-lg"
    >
      <div className="flex justify-between gap-3">
        <p className="min-w-0 flex-1 break-words">{task.name}</p>
        {/* <SquarePen className="cursor-pointer hover:text-blue-500" size={20} />*/}
        <button
          className="shrink-0 p-2 cursor-pointer hover:text-blue-500"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 size={20} strokeWidth={1.25} />
        </button>
      </div>
    </div>
  );
}

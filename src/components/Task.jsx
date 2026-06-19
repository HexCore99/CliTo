import React from "react";
import { SquarePen, Trash2 } from "lucide-react";

export default function Task({ task, onDelete }) {
  return (
    <div className="bg-blue-400/20 backdrop-blur-md border border-blue-200/30 shadow-sm h-fit w-full px-5 py-3 rounded-lg hover:shadow-lg">
      <div className="flex justify-between">
        <p>{task.name}</p>
        <div className="flex gap-3.5">
          {/* <SquarePen className="cursor-pointer hover:text-blue-500" size={20} />*/}
          <Trash2
            className="cursor-pointer hover:text-blue-500"
            size={20}
            strokeWidth={1.25}
            onClick={() => onDelete(task.id)}
          />
        </div>
      </div>
    </div>
  );
}

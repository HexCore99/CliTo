import { GripVerticalIcon } from "lucide-react";

export default function TaskDragHandle({
  attributes,
  listeners,
  setActivatorNodeRef,
}) {
  return (
    <button
      ref={setActivatorNodeRef}
      type="button"
      title="Drag task"
      aria-label="Drag task"
      className="flex size-7 shrink-0 touch-none cursor-grab items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-black/5 hover:text-slate-700 active:cursor-grabbing"
      {...attributes}
      {...listeners}
      onClick={(event) => event.stopPropagation()}
    >
      <GripVerticalIcon size={18} />
    </button>
  );
}

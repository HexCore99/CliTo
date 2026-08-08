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
      className="flex size-7 shrink-0 touch-none cursor-grab items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing"
      {...attributes}
      {...listeners}
      onClick={(event) => event.stopPropagation()}
    >
      <GripVerticalIcon size={18} />
    </button>
  );
}

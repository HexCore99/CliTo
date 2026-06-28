import { useState } from "react";
import { Flag as FlagIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTaskStore } from "@/stores/useTaskStore";

const priorities = [
  { value: "1", label: "Priority 1", color: "#dc4c3e", filled: true },
  { value: "2", label: "Priority 2", color: "#f59e0b", filled: true },
  { value: "3", label: "Priority 3", color: "#2563eb", filled: true },
  { value: "4", label: "Priority 4", color: "#6b7280", filled: false },
];

function PriorityFlag({ priority, size = 16 }) {
  return (
    <FlagIcon
      size={size}
      strokeWidth={1.75}
      stroke={priority.color}
      fill={priority.filled ? priority.color : "none"}
    />
  );
}

export default function Flag({ taskId, taskPriority }) {
  const setPriorityInStore = useTaskStore((state) => state.set_priority);
  const selectedPriority = String(taskPriority ?? 4);
  const priority =
    priorities.find((item) => item.value === selectedPriority) ?? priorities[3];

  function setPriority(p) {
    setPriorityInStore(taskId, p);
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title={priority.label}
          aria-label={`Set priority. Current: ${priority.label}`}
          onPointerDown={(event) => event.stopPropagation()}
          className="inline-flex size-7 items-center justify-center rounded transition-colors hover:bg-black/5"
        >
          <PriorityFlag priority={priority} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        onPointerDown={(event) => event.stopPropagation()}
        className="w-36 min-w-36 bg-white p-1"
      >
        <DropdownMenuRadioGroup
          value={selectedPriority}
          onValueChange={setPriority}
        >
          {priorities.map((item) => (
            <DropdownMenuRadioItem
              key={item.value}
              value={item.value}
              className="cursor-pointer gap-2 px-2 py-2 text-sm"
            >
              <PriorityFlag priority={item} size={17} />
              <span>{item.label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

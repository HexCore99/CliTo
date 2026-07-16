import { useEffect, useRef, useState } from "react";
import { Circle, Plus } from "lucide-react";
import DatePicker from "./DatePicker";
import FlagPicker from "./FlagPicker";
import { Button } from "./ui/Button";
import Hr from "./ui/Hr";

const initialTask = {
  name: "",
  priority: 4,
  dueDate: null,
  description: "",
};

const addTaskColor = {
  todo: "text-orange-600",
  "in-progress": "text-blue-600",
  completed:"text-green-600",
}

export default function CreateTask({ colStatus = "todo", onAdd }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [task, setTask] = useState(initialTask);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateTask(field, value) {
    setTask((currentTask) => ({ ...currentTask, [field]: value }));
  }

  function collapse() {
    setTask(initialTask);
    setIsExpanded(false);
  }

  async function handleAdd(event) {
    event.preventDefault();

    const name = task.name.trim();
    if (!name || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await onAdd({
        id: Date.now(),
        name,
        status: colStatus ?? "todo",
        position: 0,
        priority: task.priority,
        due_date: task.dueDate,
        description: task.description.trim() || null,
      });
      collapse();
    } finally {
      setIsSubmitting(false);
    }
  }

  const formRef = useRef(null);

  useEffect(() => {
    if (!isExpanded) return;

    function handleOutsideClick(event) {
      if (formRef.current?.contains(event.target)) return;

      if (event.target instanceof Element &&
        event.target.closest("[data-radix-popper-content-wrapper]")
      ) {
        return;
      }

      collapse();
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        collapse();
        return;
      }

      if (event.ctrlKey && event.key === "Enter") {
        event.preventDefault();
        formRef.current?.requestSubmit();
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExpanded]);

  if (!isExpanded) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsExpanded(true)}
        className={`h-10 w-full justify-center border-[#E5E7EB] bg-[#F8FAFC] text-[#64748B] hover:border-[#FDBA74] hover:bg-[#FFF7ED] hover:text-[#1F2937] ${addTaskColor[colStatus]}`}
      >
        <Plus
          className={`size-4 text-${addTaskColor[colStatus]}`}
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <span
        >Add Task</span>
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleAdd}
      className="rounded-lg border border-slate-300 bg-white p-3 shadow-sm"
    >
      <div className="flex items-start gap-2">
        <Circle
          size={15}
          strokeWidth={1.75}
          className="mt-1 shrink-0 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="text"
          value={task.name}
          onChange={(event) => updateTask("name", event.target.value)}
          placeholder="What needs to be done?"
          aria-label="Task name"
          autoFocus
          className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-slate-500"
        />
      </div>
      <Hr size="full" className="my-2 border-slate-200" />
      <textarea
        value={task.description}
        onChange={(event) => updateTask("description", event.target.value)}
        placeholder="Add description..."
        aria-label="Task description"
        rows={2}
        className="mt-3 w-full resize-none bg-transparent text-sm leading-5 outline-none placeholder:text-slate-400"
      />

      <Hr size="full" className="my-2 border-slate-200" />

      <div >
        <div className="flex flex-wrap justify-center  items-center gap-1">
          <DatePicker
            dueDate={task.dueDate}
            onChange={(_, dueDate) => updateTask("dueDate", dueDate)}
          />
          <FlagPicker
            taskPriority={task.priority}
            onChange={(priority) => updateTask("priority", priority)}
            showLabel
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={collapse}
            className={`bg-slate-100`}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="ghost"
            disabled={!task.name.trim() || isSubmitting}
            className={`bg-slate-100 hover:${addTaskColor[colStatus]} ${addTaskColor[colStatus]}`}
          >
            <Plus size={15} strokeWidth={1.75} aria-hidden="true" />
            {isSubmitting ? "Adding..." : "Add Task"}
          </Button>
        </div>
      </div>
    </form>
  );
}

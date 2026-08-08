import { CircleCheck, CircleEllipsis, CirclePlus } from "lucide-react";

const emptyColumnContent = {
  todo: {
    icon: CirclePlus,
    title: "No tasks yet",
    description: "Add a new task to get started",
  },
  "in-progress": {
    icon: CircleEllipsis,
    title: "No tasks in progress",
    description: "Drag tasks here or add a new task",
  },
  completed: {
    icon: CircleCheck,
    title: "No completed tasks yet",
    description: "Finish some tasks and celebrate!",
  },
};

export default function EmptyColumnText({ status }) {
  const content = emptyColumnContent[status];

  if (!content) return null;

  const Icon = content.icon;

  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 text-center">
      <Icon
        className="mb-4 size-10 text-muted-foreground"
        strokeWidth={1.5}
        aria-hidden="true"
      />

      <h4 className="font-semibold text-foreground">{content.title}</h4>

      <p className="mt-2 text-sm text-muted-foreground">{content.description}</p>
    </div>
  );
}

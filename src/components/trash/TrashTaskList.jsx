import { Skeleton } from "@/components/ui/skeleton";
import TrashEmptyState from "./TrashEmptyState";
import TrashTaskCard from "./TrashTaskCard";

function TrashListSkeleton() {
  return (
    <div className="space-y-3" aria-label="Loading trashed tasks">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="rounded-xl border border-border bg-card p-4"
        >
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="mt-3 h-5 w-2/3" />
          <div className="mt-4 flex flex-wrap gap-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TrashTaskList({
  tasks,
  isLoading,
  onRestore,
  onDelete,
  busyAction,
}) {
  if (isLoading) return <TrashListSkeleton />;
  if (tasks.length === 0) return <TrashEmptyState />;

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const taskId = String(task.id);
        const isRestoring =
          busyAction?.type === "restore" && busyAction.id === taskId;
        const isDeleting =
          busyAction?.type === "delete-one" && busyAction.id === taskId;

        return (
          <TrashTaskCard
            key={task.id}
            task={task}
            onRestore={onRestore}
            onDelete={onDelete}
            isRestoring={isRestoring}
            isDeleting={isDeleting}
            actionsDisabled={Boolean(busyAction)}
          />
        );
      })}
    </div>
  );
}

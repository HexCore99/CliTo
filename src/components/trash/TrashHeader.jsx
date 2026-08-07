import { LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function TrashHeader({
  itemCount,
  onEmptyTrash,
  isEmptying = false,
  actionsDisabled = false,
}) {
  const itemLabel = `${itemCount} ${itemCount === 1 ? "item" : "items"}`;

  return (
    <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <Trash2 className="size-5" aria-hidden="true" />
          </span>
          <div>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">Trash</h1>
              <span className="text-sm text-muted-foreground">{itemLabel}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Items are permanently deleted after 30 days.
            </p>
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="destructive"
        className="w-full sm:w-auto"
        disabled={itemCount === 0 || actionsDisabled || !onEmptyTrash}
        onClick={onEmptyTrash}
      >
        {isEmptying ? (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        ) : (
          <Trash2 aria-hidden="true" />
        )}
        {isEmptying ? "Emptying..." : "Empty Trash"}
      </Button>
    </header>
  );
}

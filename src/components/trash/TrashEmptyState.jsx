import { Trash2 } from "lucide-react";

export default function TrashEmptyState() {
  return (
    <div className="flex min-h-[22rem] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Trash2 className="size-7" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-lg font-semibold">Trash is empty</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        Tasks you delete will appear here, where you can restore them before
        they are permanently removed.
      </p>
    </div>
  );
}

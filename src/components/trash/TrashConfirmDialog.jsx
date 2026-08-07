import { Dialog as DialogPrimitive } from "radix-ui";
import { AlertTriangle, LoaderCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function TrashConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete forever",
  onConfirm,
  isConfirming = false,
}) {
  function handleOpenChange(nextOpen) {
    if (!isConfirming) {
      onOpenChange(nextOpen);
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[1px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-background p-6 shadow-xl outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          onEscapeKeyDown={(event) => {
            if (isConfirming) event.preventDefault();
          }}
          onPointerDownOutside={(event) => {
            if (isConfirming) event.preventDefault();
          }}
        >
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <DialogPrimitive.Title className="text-lg font-semibold">
                {title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
              </DialogPrimitive.Description>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogPrimitive.Close asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isConfirming}
              >
                Cancel
              </Button>
            </DialogPrimitive.Close>
            <Button
              type="button"
              variant="destructive"
              disabled={isConfirming}
              onClick={onConfirm}
            >
              {isConfirming && (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              )}
              {isConfirming ? "Deleting..." : confirmLabel}
            </Button>
          </div>

          <DialogPrimitive.Close asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-3 right-3"
              disabled={isConfirming}
            >
              <X aria-hidden="true" />
              <span className="sr-only">Close confirmation</span>
            </Button>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

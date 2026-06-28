import { useEffect } from "react";
import {
  Tooltip as TooltipRoot,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Tooltip({
  children,
  message,
  open,
  onClose,
  duration = 2500,
}) {
  useEffect(() => {
    if (!open) return;

    const timeoutId = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timeoutId);
  }, [duration, onClose, open]);

  return (
    <TooltipProvider>
      <TooltipRoot open={open}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={6}
          className="bg-red-600 text-white"
        >
          {message}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
}

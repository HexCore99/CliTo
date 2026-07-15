import { cn } from "@/lib/utils";

const sizes = {
  short: "w-1/4",
  mid: "w-1/2",
  full: "w-full",
};

export default function Hr({ size = "mid", className, ...props }) {
  return (
    <hr
      className={cn(
        "mx-auto border-0 border-t border-border",
        sizes[size] ?? sizes.mid,
        className,
      )}
      {...props}
    />
  );
}

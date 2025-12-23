import { cn } from "@/lib/utils";

interface OnlineIndicatorProps {
  isOnline?: boolean;
  className?: string;
}

const OnlineIndicator = ({ isOnline = true, className }: OnlineIndicatorProps) => {
  return (
    <span
      className={cn(
        "w-3 h-3 rounded-full border-2 border-white shadow-sm",
        isOnline ? "bg-emerald-400" : "bg-muted-foreground/40",
        isOnline && "animate-pulse",
        className
      )}
    />
  );
};

export default OnlineIndicator;

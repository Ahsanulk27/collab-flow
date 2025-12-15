import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarGroupProps {
  avatars: { src?: string; fallback: string }[];
  max?: number;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
};

const AvatarGroup = ({ avatars = [], max = 4, size = "md" }: AvatarGroupProps) => {
  const visibleAvatars = avatars.slice(0, max);
  const remaining = Math.max(avatars.length - max, 0); 

  return (
    <div className="flex -space-x-2">
      {visibleAvatars.map((avatar, index) => (
        <Avatar key={avatar.fallback || index} className={`${sizeClasses[size]} border-2 border-background`}>
          <AvatarImage src={avatar.src} />
          <AvatarFallback className="bg-primary/20 text-primary">{avatar.fallback}</AvatarFallback>
        </Avatar>
      ))}
      {remaining > 0 && (
        <div
          className={`${sizeClasses[size]} rounded-full bg-muted flex items-center justify-center border-2 border-background font-medium text-muted-foreground`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};


export default AvatarGroup;

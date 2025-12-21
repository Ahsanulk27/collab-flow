import { Link } from "react-router-dom";
import { Plus, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AvatarGroup from "./AvatarGroup";

interface WorkspaceCardProps {
  id?: string;
  title?: string;
  description?: string;
  icon?: string;
  iconBg?: string;
  badges?: {
    label: string;
    variant: "success" | "warning" | "urgent" | "teal";
  }[];
  avatars?: { src?: string; fallback: string }[];
  isAddCard?: boolean;
  isJoinCard?: boolean;
  onJoinClick?: () => void;
  onLeaveClick?: () => void;
}

const WorkspaceCard = ({
  id,
  title,
  description,
  icon,
  iconBg,
  badges,
  avatars,
  isAddCard = false,
  isJoinCard = false,
  onJoinClick,
  onLeaveClick
}: WorkspaceCardProps) => {
  if (isAddCard) {
    return (
      <Card
        variant="glass-hover"
        className="h-full min-h-[180px] flex items-center justify-center group"
      >
        <Link
          to="/addWorkspace"
          className="flex flex-col items-center gap-3 p-6"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">Add Workspace</p>
            <p className="text-sm text-muted-foreground">
              Create a new collaboration space
            </p>
          </div>
        </Link>
      </Card>
    );
  }
  if (isJoinCard) {
    return (
      <Card
        variant="glass-hover"
        className="h-full min-h-[180px] flex items-center justify-center cursor-pointer group"
        onClick={onJoinClick}
      >
        <div className="flex flex-col items-center gap-3 p-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center group-hover:bg-teal-200 transition-colors">
            <ArrowRight className="w-6 h-6 text-teal-600" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">Join Workspace</p>
            <p className="text-sm text-muted-foreground">
              Enter a code to join an existing workspace
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      variant="glass-solid"
      className="h-full overflow-hidden hover:shadow-glass-lg hover:-translate-y-1 transition-all duration-300"
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0 text-2xl`}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-foreground truncate">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {badges?.map((badge, i) => (
            <Badge key={i} variant={badge.variant} className="text-xs">
              {badge.label}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/30">
          <AvatarGroup avatars={avatars} size="sm" max={4} />
          <Button variant="teal" size="sm" asChild>
            <Link to={`/workspaces/${id}`}>Open</Link>
          </Button>
          {onLeaveClick && (
            <Button variant="destructive" size="sm" onClick={onLeaveClick}>
              Leave
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkspaceCard;

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;

interface Member {
  id: string;
  role: "OWNER" | "MEMBER" | "ADMIN";
  user: {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
  };
}

interface TaskAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  workspaceId: string;
  currentAssignee?: {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
  } | null;
  onSuccess: () => void;
}

export default function TaskAssignmentDialog({
  open,
  onOpenChange,
  taskId,
  workspaceId,
  currentAssignee,
  onSuccess,
}: TaskAssignmentDialogProps) {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(
    currentAssignee?.id || null
  );

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  // Fetch workspace members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!open || !workspaceId) return;

      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/workspaces/${workspaceId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMembers(res.data.workspace.members || []);
      } catch (err) {
        console.error("Failed to load members", err);
        toast({
          title: "Error",
          description: "Failed to load workspace members",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [open, workspaceId, token, toast]);

  // Update selected member when currentAssignee changes
  useEffect(() => {
    setSelectedMemberId(currentAssignee?.id || null);
  }, [currentAssignee]);

  const handleAssign = async () => {
    if (!selectedMemberId) {
      toast({
        title: "No member selected",
        description: "Please select a member to assign the task to",
        variant: "destructive",
      });
      return;
    }

    const selectedMember = members.find(
      (m) => m.user.id === selectedMemberId
    );

    if (!selectedMember) {
      toast({
        title: "Error",
        description: "Selected member not found",
        variant: "destructive",
      });
      return;
    }

    try {
      setAssigning(true);
      await axios.patch(
        `${API_BASE}/tasks/${taskId}/assign`,
        { name: selectedMember.user.name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Task assigned! ✅",
        description: `Task assigned to ${selectedMember.user.name}`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || "Failed to assign task";
      toast({
        title: "Assignment failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async () => {
    try {
      setAssigning(true);
      // Update task without assignedToId (set to null)
      await axios.put(
        `${API_BASE}/tasks/${taskId}`,
        { assignedToId: null },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Task unassigned",
        description: "The task assignment has been removed",
      });

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || "Failed to unassign task";
      toast({
        title: "Unassignment failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Task</DialogTitle>
          <DialogDescription>
            Select a workspace member to assign this task to
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current Assignee */}
            {currentAssignee && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">
                  Currently assigned to:
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentAssignee.profileImage} />
                    <AvatarFallback>
                      {currentAssignee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{currentAssignee.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {currentAssignee.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Member Selection */}
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No members found
                </p>
              ) : (
                members.map((member) => (
                  <Card
                    key={member.user.id}
                    className={`cursor-pointer transition-all ${
                      selectedMemberId === member.user.id
                        ? "ring-2 ring-primary"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedMemberId(member.user.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.user.profileImage} />
                          <AvatarFallback>
                            {member.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {member.user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.user.email} • {member.role}
                          </p>
                        </div>
                        {selectedMemberId === member.user.id && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              {currentAssignee && (
                <Button
                  variant="outline"
                  onClick={handleUnassign}
                  disabled={assigning}
                  className="flex-1"
                >
                  {assigning ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Unassign
                </Button>
              )}
              <Button
                onClick={handleAssign}
                disabled={assigning || !selectedMemberId}
                className="flex-1"
              >
                {assigning ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {currentAssignee ? "Reassign" : "Assign"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
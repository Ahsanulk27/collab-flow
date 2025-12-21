import { useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function JoinWorkspaceDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const handleJoin = async () => {
    if (!code.trim()) return;

    try {
      setLoading(true);
      await axios.post(
        `${API_BASE}/workspaces/join`,
        { inviteCode: code },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Joined workspace 🎉",
        description: "You now have access to the workspace",
      });

      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast({
        title: "Invalid code",
        description: "Could not join workspace",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join a workspace</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Invite code</Label>
            <Input
              placeholder="e.g. A9X2KD"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </div>

          <Button onClick={handleJoin} disabled={loading} className="w-full">
            {loading ? "Joining..." : "Join workspace"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

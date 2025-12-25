import TaskAssignmentDialog from "@/components/TaskAssignmentDialog";
import { UserPlus } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageCircle,
  KanbanSquare,
  PenTool,
  BarChart3,
  Video,
  ArrowLeft,
  Check,
  Copy,
} from "lucide-react";
import { MessageSender, Message } from "@/types/message";
import { useSocket } from "@/hooks/use-socket";

interface Member {
  id: string;
  role: "OWNER" | "MEMBER";
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  assignedToId?: string | null;
  workspaceId: string;
  createdAt: string;
  updatedAt?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
  } | null;
}

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string;
  members: Member[];
  tasks: Task[];
  role: "OWNER" | "MEMBER";
}

const API_BASE = import.meta.env.VITE_API_BASE;

const WorkspaceOverview = () => {
  const { workspaceId } = useParams();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const socket = useSocket().socket;
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const handleAssignClick = (task: Task) => {
    setSelectedTask(task);
    setAssignmentDialogOpen(true);
  };

  const handleAssignmentSuccess = () => {
    // Refresh workspace data
    if (workspaceId) {
      const fetchWorkspace = async () => {
        try {
          const res = await axios.get(`${API_BASE}/workspaces/${workspaceId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setWorkspace(res.data.workspace);
        } catch (err) {
          console.error("Failed to load workspace", err);
        }
      };
      fetchWorkspace();
    }
  };

  const quickLinks = [
    {
      icon: MessageCircle,
      label: "Chat",
      path: `/workspaces/${workspaceId}/chat`,
      color: "bg-sky-100 text-sky-600",
    },
    {
      icon: KanbanSquare,
      label: "Task Board",
      path: `/workspaces/${workspaceId}/tasks`,
      color: "bg-amber-100 text-amber-600",
    },
    {
      icon: PenTool,
      label: "Whiteboard",
      path: "/whiteboard",
      color: "bg-violet-100 text-violet-600",
    },
    {
      icon: BarChart3,
      label: "Stats",
      path: "#",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      icon: Video,
      label: "Video Call",
      path: "#",
      color: "bg-rose-100 text-rose-600",
    },
  ];

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const res = await axios.get(`${API_BASE}/workspaces/${workspaceId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setWorkspace(res.data.workspace);
      } catch (err) {
        console.error("Failed to load workspace", err);
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) fetchWorkspace();
  }, [workspaceId]);

  useEffect(() => {
    const fetchRecentMessages = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/workspaces/${workspaceId}/messages?limit=5`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRecentMessages(res.data.messages);
      } catch (err) {
        console.error("Failed to load recent messages", err);
      }
    };

    if (workspaceId) fetchRecentMessages();
  }, [workspaceId]);
  useEffect(() => {
    if (!socket || !workspaceId) return;

    socket.emit("joinWorkspace", workspaceId);

    socket.on("newMessage", (message: Message) => {
      setRecentMessages((prev) => {
        const updated = [...prev, message];
        return updated.slice(-5);
      });
    });

    return () => {
      socket.off("newMessage");
    };
  }, [socket, workspaceId]);
  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground">Loading workspace...</p>
      </DashboardLayout>
    );
  }

  if (!workspace) {
    return (
      <DashboardLayout>
        <p className="text-destructive">Workspace not found</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workspaces
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-4xl">🗂️</span>
              <h1 className="font-display text-3xl font-bold text-foreground">
                {workspace.name}
              </h1>
            </div>
            <p className="text-muted-foreground mt-2 max-w-xl">
              {workspace.description || "No description provided"}
            </p>
          </div>
          <Badge variant="success" className="text-sm">
            Active
          </Badge>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
        {quickLinks.map((link) => (
          <Link key={link.label} to={link.path}>
            <Card variant="glass-hover" className="p-4 text-center h-full">
              <div
                className={`w-12 h-12 rounded-2xl ${link.color} flex items-center justify-center mx-auto mb-3`}
              >
                <link.icon className="w-6 h-6" />
              </div>
              <p className="font-medium text-sm">{link.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Team Members */}
        <Card variant="glass-solid" className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Team Members</CardTitle>
          </CardHeader>
          <Card variant="glass-solid" className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Invite Code</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Share this code to invite others
                </p>
                <p className="text-xl font-mono font-semibold tracking-wider">
                  {workspace.inviteCode}
                </p>
              </div>

              <Button
                variant="outline"
                className="gap-2 transition-all"
                onClick={() => {
                  navigator.clipboard.writeText(workspace.inviteCode);
                  setCopied(true);

                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600 animate-scale-in" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          <CardContent className="space-y-4">
            {workspace.members.map((member) => (
              <div key={member.user.id} className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.user.profileImage} />
                    <AvatarFallback>
                      {member.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <p className="text-sm font-medium">{member.user.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card variant="glass-solid" className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Recent Messages</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {recentMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">
                No messages yet
              </p>
            ) : (
              recentMessages.map((msg) => (
                <div key={msg.id} className="p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">
                      {msg.sender.name || "Unknown"}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {msg.content}
                  </p>
                </div>
              ))
            )}

            <Button variant="ghost" className="w-full" asChild>
              <Link to={`/workspaces/${workspaceId}/chat`}>
                View all messages
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card variant="glass-solid" className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {workspace.tasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-xl bg-muted/50 flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{task.title}</p>
                  {task.assignedTo && (
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={task.assignedTo.profileImage} />
                        <AvatarFallback className="text-xs">
                          {task.assignedTo.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-xs text-muted-foreground">
                        {task.assignedTo.name}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">{task.status}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAssignClick(task)}
                    className="h-8 w-8 p-0"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {workspace.tasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">
                No tasks yet
              </p>
            )}

            <Button variant="ghost" className="w-full" asChild>
              <Link to={`/workspaces/${workspace.id}/tasks`}>
                View task board
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {selectedTask && (
        <TaskAssignmentDialog
          open={assignmentDialogOpen}
          onOpenChange={setAssignmentDialogOpen}
          taskId={selectedTask.id}
          workspaceId={workspaceId || ""}
          currentAssignee={selectedTask.assignedTo || null}
          onSuccess={handleAssignmentSuccess}
        />
      )}
    </DashboardLayout>
  );
};

export default WorkspaceOverview;

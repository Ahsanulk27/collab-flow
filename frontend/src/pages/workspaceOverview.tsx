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
} from "lucide-react";

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
  status: string;
  createdAt: string;
}

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  members: Member[];
  tasks: Task[];
  role: "OWNER" | "MEMBER";
}

const API_BASE = import.meta.env.VITE_API_BASE;

const quickLinks = [
  {
    icon: MessageCircle,
    label: "Chat",
    path: "/chat",
    color: "bg-sky-100 text-sky-600",
  },
  {
    icon: KanbanSquare,
    label: "Task Board",
    path: "/tasks",
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

const WorkspaceOverview = () => {
  const { workspaceId } = useParams();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

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
                <div>
                  <p className="text-sm font-medium">{task.title}</p>
                  {/* <p className="text-xs text-muted-foreground">
                    Status: {task.status}
                  </p> */}
                </div>

                <Badge variant="default">{task.status}</Badge>
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
    </DashboardLayout>
  );
};

export default WorkspaceOverview;

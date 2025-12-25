import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TaskAssignmentDialog from "@/components/TaskAssignmentDialog";
import { ArrowLeft, UserPlus, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE;

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

const TaskBoard = () => {
  const { workspaceId } = useParams();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    const fetchTasks = async () => {
      if (!workspaceId) return;

      try {
        const res = await axios.get(
          `${API_BASE}/workspaces/${workspaceId}/tasks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTasks(res.data || []);
      } catch (err) {
        console.error("Failed to load tasks", err);
        toast({
          title: "Error",
          description: "Failed to load tasks",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [workspaceId, token, toast]);

  const handleAssignClick = (task: Task) => {
    setSelectedTask(task);
    setAssignmentDialogOpen(true);
  };

  const handleAssignmentSuccess = () => {
    // Refresh tasks
    if (workspaceId) {
      const fetchTasks = async () => {
        try {
          const res = await axios.get(
            `${API_BASE}/workspaces/${workspaceId}/tasks`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setTasks(res.data || []);
        } catch (err) {
          console.error("Failed to load tasks", err);
        }
      };
      fetchTasks();
    }
    setAssignmentDialogOpen(false);
  };

  // Group tasks by status
  const tasksByStatus = {
    TODO: tasks.filter((t) => t.status === "TODO"),
    "IN_PROGRESS": tasks.filter((t) => t.status === "IN_PROGRESS"),
    DONE: tasks.filter((t) => t.status === "DONE"),
  };

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground">Loading tasks...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to={`/workspaces/${workspaceId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workspace
          </Link>
        </Button>

        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Task Board
          </h1>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Task Board Columns */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* TODO Column */}
        <Card variant="glass-solid">
          <CardHeader>
            <CardTitle className="text-lg">
              To Do ({tasksByStatus.TODO.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasksByStatus.TODO.map((task) => (
              <Card
                key={task.id}
                className="p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-sm">{task.title}</h3>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {task.assignedTo && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
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

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAssignClick(task)}
                      className="h-8 text-xs"
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      {task.assignedTo ? "Reassign" : "Assign"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {tasksByStatus.TODO.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tasks
              </p>
            )}
          </CardContent>
        </Card>

        {/* IN_PROGRESS Column */}
        <Card variant="glass-solid">
          <CardHeader>
            <CardTitle className="text-lg">
              In Progress ({tasksByStatus.IN_PROGRESS.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasksByStatus.IN_PROGRESS.map((task) => (
              <Card
                key={task.id}
                className="p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-sm">{task.title}</h3>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {task.assignedTo && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
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

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAssignClick(task)}
                      className="h-8 text-xs"
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      {task.assignedTo ? "Reassign" : "Assign"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {tasksByStatus.IN_PROGRESS.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tasks
              </p>
            )}
          </CardContent>
        </Card>

        {/* DONE Column */}
        <Card variant="glass-solid">
          <CardHeader>
            <CardTitle className="text-lg">
              Done ({tasksByStatus.DONE.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasksByStatus.DONE.map((task) => (
              <Card
                key={task.id}
                className="p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-sm">{task.title}</h3>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {task.assignedTo && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
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

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAssignClick(task)}
                      className="h-8 text-xs"
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      {task.assignedTo ? "Reassign" : "Assign"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {tasksByStatus.DONE.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tasks
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assignment Dialog */}
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

export default TaskBoard;


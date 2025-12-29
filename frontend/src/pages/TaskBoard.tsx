import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  UserPlus,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE;

interface AssignedUser {
  id: string;
  name: string;
  email: string;
  profileImage: string | null;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  assignedToId: string | null;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  assignedTo: AssignedUser | null;
}

interface WorkspaceMember {
  id: string;
  role: "OWNER" | "MEMBER";
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
}

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  members: WorkspaceMember[];
}

const STATUS_COLUMNS = [
  { id: "TODO", label: "To Do", color: "bg-slate-100 text-slate-700" },
  {
    id: "IN_PROGRESS",
    label: "In Progress",
    color: "bg-blue-100 text-blue-700",
  },
  { id: "DONE", label: "Done", color: "bg-emerald-100 text-emerald-700" },
];

const TaskBoard = () => {
  const { workspaceId } = useParams();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState<Task | null>(null);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "TODO",
    assignedToId: "",
  });

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    if (workspaceId) {
      fetchWorkspace();
      fetchTasks();
    }
  }, [workspaceId]);

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
      toast.error("Failed to load workspace");
    }
  };

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
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to load tasks", err);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE}/workspaces/${workspaceId}/tasks`,
        {
          title: newTask.title,
          description: newTask.description || null,
          status: newTask.status,
          assignedToId: newTask.assignedToId || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTasks([...tasks, res.data]);
      setNewTask({ title: "", description: "", status: "TODO", assignedToId: "" });
      setCreateDialogOpen(false);
      toast.success("Task created successfully");
    } catch (err: any) {
      console.error("Failed to create task", err);
      toast.error(err.response?.data?.error || "Failed to create task");
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask || !newTask.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    try {
      const res = await axios.put(
        `${API_BASE}/tasks/${selectedTask.id}`,
        {
          title: newTask.title,
          description: newTask.description || null,
          status: newTask.status,
          assignedToId: newTask.assignedToId || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTasks(tasks.map((t) => (t.id === selectedTask.id ? res.data : t)));
      setEditDialogOpen(false);
      setSelectedTask(null);
      toast.success("Task updated successfully");
    } catch (err: any) {
      console.error("Failed to update task", err);
      toast.error(err.response?.data?.error || "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(tasks.filter((t) => t.id !== taskId));
      toast.success("Task deleted successfully");
    } catch (err: any) {
      console.error("Failed to delete task", err);
      toast.error(err.response?.data?.error || "Failed to delete task");
    }
  };

  const handleAssignTask = async (userName: string) => {
    if (!taskToAssign) return;

    try {
      const res = await axios.patch(
        `${API_BASE}/tasks/${taskToAssign.id}/assign`,
        { name: userName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTasks(
        tasks.map((t) => (t.id === taskToAssign.id ? res.data : t))
      );
      setAssignDialogOpen(false);
      setTaskToAssign(null);
      toast.success("Task assigned successfully");
    } catch (err: any) {
      console.error("Failed to assign task", err);
      toast.error(err.response?.data?.error || "Failed to assign task");
    }
  };

  const handleStatusChange = async (task: Task, newStatus: string) => {
    try {
      const res = await axios.put(
        `${API_BASE}/tasks/${task.id}`,
        {
          title: task.title,
          description: task.description,
          status: newStatus,
          assignedToId: task.assignedToId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTasks(tasks.map((t) => (t.id === task.id ? res.data : t)));
    } catch (err: any) {
      console.error("Failed to update task status", err);
      toast.error(err.response?.data?.error || "Failed to update task status");
    }
  };

  const openEditDialog = (task: Task) => {
    setSelectedTask(task);
    setNewTask({
      title: task.title,
      description: task.description || "",
      status: task.status,
      assignedToId: task.assignedToId || "",
    });
    setEditDialogOpen(true);
  };

  const openAssignDialog = (task: Task) => {
    setTaskToAssign(task);
    setAssignDialogOpen(true);
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground">Loading task board...</p>
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
          <Link to={`/workspaces/${workspaceId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workspace
          </Link>
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Task Board
            </h1>
            <p className="text-muted-foreground">{workspace.name}</p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Add a new task to your workspace
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                    placeholder="Enter task title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={newTask.status}
                    onChange={(e) =>
                      setNewTask({ ...newTask, status: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm"
                  >
                    {STATUS_COLUMNS.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="assignee">Assign To</Label>
                  <select
                    id="assignee"
                    value={newTask.assignedToId}
                    onChange={(e) =>
                      setNewTask({ ...newTask, assignedToId: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm"
                  >
                    <option value="">Unassigned</option>
                    {workspace.members.map((member) => (
                      <option key={member.user.id} value={member.user.id}>
                        {member.user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateTask}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATUS_COLUMNS.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          return (
            <div
              key={column.id}
              className="flex flex-col"
              data-column
              data-status={column.id}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("bg-muted/20");
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove("bg-muted/20");
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("bg-muted/20");
                const taskId = e.dataTransfer.getData("taskId");
                if (taskId) {
                  const task = tasks.find((t) => t.id === taskId);
                  if (task && task.status !== column.id) {
                    handleStatusChange(task, column.id);
                  }
                }
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={column.color}>
                    {column.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    ({columnTasks.length})
                  </span>
                </div>
              </div>

              <div className="space-y-4 min-h-[400px]">
                {columnTasks.map((task) => (
                  <Card
                    key={task.id}
                    variant="glass-solid"
                    className="hover:shadow-lg transition-all cursor-move"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("taskId", task.id);
                      e.currentTarget.style.opacity = "0.5";
                    }}
                    onDragEnd={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base font-semibold">
                          {task.title}
                        </CardTitle>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => openEditDialog(task)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        {task.assignedTo ? (
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
                            <span className="text-xs text-muted-foreground">
                              {task.assignedTo.name}
                            </span>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => openAssignDialog(task)}
                          >
                            <UserPlus className="w-3 h-3 mr-1" />
                            Assign
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {columnTasks.length === 0 && (
                  <div className="flex items-center justify-center h-40 text-sm text-muted-foreground border-2 border-dashed rounded-xl">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Task Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                placeholder="Enter task title"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                placeholder="Enter task description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                value={newTask.status}
                onChange={(e) =>
                  setNewTask({ ...newTask, status: e.target.value })
                }
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm"
              >
                {STATUS_COLUMNS.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="edit-assignee">Assign To</Label>
              <select
                id="edit-assignee"
                value={newTask.assignedToId}
                onChange={(e) =>
                  setNewTask({ ...newTask, assignedToId: e.target.value })
                }
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm"
              >
                <option value="">Unassigned</option>
                {workspace.members.map((member) => (
                  <option key={member.user.id} value={member.user.id}>
                    {member.user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setSelectedTask(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateTask}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Task Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Task</DialogTitle>
            <DialogDescription>
              Assign this task to a workspace member
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {taskToAssign && (
              <div>
                <p className="text-sm font-medium mb-2">Task:</p>
                <p className="text-sm text-muted-foreground">
                  {taskToAssign.title}
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="assign-user">Select Member</Label>
              <select
                id="assign-user"
                onChange={(e) => {
                  if (e.target.value) {
                    handleAssignTask(e.target.value);
                  }
                }}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm"
              >
                <option value="">Select a member...</option>
                {workspace.members.map((member) => (
                  <option key={member.user.id} value={member.user.name}>
                    {member.user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAssignDialogOpen(false);
                setTaskToAssign(null);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default TaskBoard;


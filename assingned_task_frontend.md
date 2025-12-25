# Frontend Task Assignment Implementation Guide

## Overview

This guide will help you build the frontend for the task assignment feature. We'll implement it step-by-step, starting with the basics and building up to a complete solution.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Implementation Plan](#implementation-plan)
3. [Step 1: Update TypeScript Interfaces](#step-1-update-typescript-interfaces)
4. [Step 2: Create Task Assignment Component](#step-2-create-task-assignment-component)
5. [Step 3: Update Workspace Overview](#step-3-update-workspace-overview)
6. [Step 4: Create Task Board Page](#step-4-create-task-board-page)
7. [Step 5: Add API Helper Functions](#step-5-add-api-helper-functions)
8. [Testing Your Implementation](#testing-your-implementation)
9. [Next Steps & Enhancements](#next-steps--enhancements)

---

## Prerequisites

Before starting, make sure you have:
- ✅ Backend API running and accessible
- ✅ Frontend development server running
- ✅ Understanding of React hooks (useState, useEffect)
- ✅ Basic knowledge of TypeScript
- ✅ Familiarity with axios for API calls

---

## Implementation Plan

We'll build this feature in phases:

1. **Phase 1**: Update data types to include assignment info
2. **Phase 2**: Create a reusable assignment component
3. **Phase 3**: Integrate into workspace overview
4. **Phase 4**: Build a full task board page
5. **Phase 5**: Add API helper functions

---

## Step 1: Update TypeScript Interfaces

First, we need to update the Task interface to include assignment information.

### File: `frontend/src/pages/workspaceOverview.tsx`

**Current Interface (lines 32-37):**
```typescript
interface Task {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}
```

**Updated Interface:**
```typescript
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
```

**Action:** Update the Task interface in `workspaceOverview.tsx` to match the backend response.

---

## Step 2: Create Task Assignment Component

Create a reusable component for assigning tasks to workspace members.

### File: `frontend/src/components/TaskAssignmentDialog.tsx`

Create this new file:

```typescript
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
```

**Note:** You'll need to install `lucide-react` if not already installed:
```bash
cd frontend
npm install lucide-react
```

---

## Step 3: Update Workspace Overview

Now let's update the workspace overview to show assigned users and allow assignment.

### File: `frontend/src/pages/workspaceOverview.tsx`

**Add these imports at the top:**
```typescript
import TaskAssignmentDialog from "@/components/TaskAssignmentDialog";
import { UserPlus } from "lucide-react";
```

**Update the Task interface (around line 32):**
```typescript
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
```

**Add state for assignment dialog (after line 57):**
```typescript
const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
const [selectedTask, setSelectedTask] = useState<Task | null>(null);
```

**Add handler function (after formatTime function, around line 100):**
```typescript
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
```

**Update the task display section (replace lines 327-338):**
```typescript
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
```

**Add the dialog component before the closing `</DashboardLayout>` tag (around line 354):**
```typescript
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
```

---

## Step 4: Create Task Board Page

Create a full task board page where users can manage all tasks.

### File: `frontend/src/pages/TaskBoard.tsx`

Create this new file:

```typescript
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
```

**Note:** Fix the DONE column - it should map over `tasksByStatus.DONE`, not `tasksByStatus.IN_PROGRESS`.

---

## Step 5: Add API Helper Functions (Optional)

Create a centralized API service for better code organization.

### File: `frontend/src/services/taskService.ts`

```typescript
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const taskService = {
  // Get all tasks for a workspace
  getTasksByWorkspace: async (workspaceId: string) => {
    const res = await axios.get(
      `${API_BASE}/workspaces/${workspaceId}/tasks`,
      {
        headers: getAuthHeaders(),
      }
    );
    return res.data;
  },

  // Assign a task to a user
  assignTask: async (taskId: string, userName: string) => {
    const res = await axios.patch(
      `${API_BASE}/tasks/${taskId}/assign`,
      { name: userName },
      {
        headers: getAuthHeaders(),
      }
    );
    return res.data;
  },

  // Update a task
  updateTask: async (taskId: string, updates: any) => {
    const res = await axios.put(`${API_BASE}/tasks/${taskId}`, updates, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // Create a task
  createTask: async (workspaceId: string, taskData: any) => {
    const res = await axios.post(
      `${API_BASE}/workspaces/${workspaceId}/tasks`,
      taskData,
      {
        headers: getAuthHeaders(),
      }
    );
    return res.data;
  },

  // Delete a task
  deleteTask: async (taskId: string) => {
    const res = await axios.delete(`${API_BASE}/tasks/${taskId}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },
};
```

---

## Step 6: Update App Routes

Uncomment and add the TaskBoard route.

### File: `frontend/src/App.tsx`

**Update the imports (around line 12):**
```typescript
import TaskBoard from "./pages/TaskBoard";
```

**Uncomment and update the route (around line 39):**
```typescript
<Route path="/workspaces/:workspaceId/tasks" element={<TaskBoard />} />
```

**Also update the quick link in workspaceOverview.tsx (line 71):**
```typescript
path: `/workspaces/${workspaceId}/tasks`,
```

---

## Testing Your Implementation

### 1. Test Task Assignment Dialog
- Navigate to a workspace
- Click the assignment icon on a task
- Verify members load correctly
- Select a member and assign
- Check that the task updates

### 2. Test Task Board
- Navigate to `/workspaces/{workspaceId}/tasks`
- Verify tasks are displayed in columns
- Test assignment from the task board
- Verify assigned users are shown

### 3. Test Error Handling
- Try assigning with invalid data
- Test with network errors
- Verify error messages display correctly

---

## Next Steps & Enhancements

### Immediate Improvements
1. **Add Loading States**: Show spinners during API calls
2. **Add Error Boundaries**: Catch and display errors gracefully
3. **Optimistic Updates**: Update UI immediately, rollback on error
4. **Toast Notifications**: Already implemented, but refine messages

### Future Enhancements
1. **Drag & Drop**: Allow dragging tasks between status columns
2. **Task Creation**: Add form to create new tasks
3. **Task Editing**: Allow editing task details
4. **Filtering**: Filter tasks by assignee
5. **Search**: Search tasks by title/description
6. **Notifications**: Notify users when assigned
7. **Activity Log**: Track assignment history
8. **Bulk Assignment**: Assign multiple tasks at once

### Code Quality
1. **Type Safety**: Ensure all types match backend
2. **Error Handling**: Comprehensive error handling
3. **Code Splitting**: Lazy load components
4. **Testing**: Add unit and integration tests
5. **Accessibility**: Add ARIA labels and keyboard navigation

---

## Troubleshooting

### Common Issues

**Issue:** "Cannot find module '@/components/TaskAssignmentDialog'"
- **Solution:** Check file path and ensure the file exists

**Issue:** "API call fails with 401"
- **Solution:** Verify token is being sent correctly

**Issue:** "Members not loading"
- **Solution:** Check workspace API endpoint and response structure

**Issue:** "Task assignment doesn't update UI"
- **Solution:** Ensure `onSuccess` callback refreshes data

**Issue:** "TypeScript errors"
- **Solution:** Update interfaces to match backend response exactly

---

## Summary

You've now implemented:
- ✅ Task assignment dialog component
- ✅ Updated workspace overview with assignment UI
- ✅ Full task board page
- ✅ API integration with backend
- ✅ Error handling and user feedback

The feature is now functional! Users can assign tasks to workspace members through a user-friendly interface.


import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "../generated/client";
import { authRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

// Create Task: POST /workspaces/:workspaceId/tasks
export const createTask = async (req: authRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { workspaceId } = req.params;
    const { title, description, status,  assignedToId } = req.body;
    if (!title || !status || !workspaceId) {
        return res.status(400).json({ error: "title, status, and workspaceId are required" });
    }
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        assignedToId,
        workspaceId,
      },
    });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

// Get Tasks in Workspace: GET /workspaces/:workspaceId/task
export const getTasksByWorkspace = async (req: authRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { workspaceId } = req.params;
    if (!workspaceId) {
        return res.status(400).json({ error: "workspaceId is required" });
    }
    const tasks = await prisma.task.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "asc" },
    });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};


export const updateTask = async (req: authRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { taskId } = req.params;
    if (!taskId) {
        return res.status(400).json({ error: "taskId is required" });
    }
    const { title, description, status, assignedToId } = req.body;
    const existingTask = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existingTask) return res.status(404).json({ error: "Task not found" });
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { title, description, status, assignedToId },
    });
    res.json(task);
  } catch (err) {
    next(err);
  }
};


export const deleteTask = async (req: authRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { taskId } = req.params;
    if (!taskId) {
        return res.status(400).json({ error: "taskId is required" });
    }
    const task = await prisma.task.delete({ where: { id: taskId } });
    res.json({ message: "Task deleted", task });
  } catch (err) {
    next(err);
  }
};


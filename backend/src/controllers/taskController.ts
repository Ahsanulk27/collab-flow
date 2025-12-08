import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "../generated/client";
import { authRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

export const createTask = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { workspaceId } = req.params;
    const { title, description, status, assignedToId } = req.body;
    if (!title || !status || !workspaceId) {
      return res
        .status(400)
        .json({ error: "title, status, and workspaceId are required" });
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

export const getTasksByWorkspace = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
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

export const updateTask = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { taskId } = req.params;
    if (!taskId) {
      return res.status(400).json({ error: "taskId is required" });
    }
    if (!req.body) {
      return res.status(400).json({ error: "Request body is required" });
    }
    const { title, description, status, assignedToId } = req.body;
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });
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

export const assignTask = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ error: "taskId is required" });
    }

    if (!req.body) {
      return res.status(400).json({ error: "Request body is required" });
    }

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "User name is required" });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { workspace: true },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const assignedUser = await prisma.user.findFirst({
      where: { name },
    });

    if (!assignedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMember = await prisma.workspaceMember.findFirst({
      where: {
        userId: assignedUser.id,
        workspaceId: task.workspaceId,
      },
    });

    if (!isMember) {
      return res.status(400).json({
        error: "User is not a member of this workspace",
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { assignedToId: assignedUser.id },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    res.json(updatedTask);
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
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

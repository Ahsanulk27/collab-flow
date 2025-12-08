import { Router } from "express";
import {
  createTask,
  getTasksByWorkspace,
  updateTask,
  deleteTask,
} from "../controllers/taskController";

const router = Router();


router.post("/workspaces/:workspaceId/tasks", createTask);


router.get("/workspaces/:workspaceId/tasks", getTasksByWorkspace);


router.put("/tasks/:taskId", updateTask);


router.delete("/tasks/:taskId", deleteTask);

export default router;
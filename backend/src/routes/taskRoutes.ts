import { Router } from "express";
import {
  createTask,
  getTasksByWorkspace,
  updateTask,
  assignTask,
  deleteTask,
} from "../controllers/taskController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.post("/workspaces/:workspaceId/tasks", createTask);

router.get("/workspaces/:workspaceId/tasks", getTasksByWorkspace);

router.put("/tasks/:taskId", updateTask);

router.patch("/tasks/:taskId/assign", assignTask);

router.delete("/tasks/:taskId", deleteTask);

export default router;

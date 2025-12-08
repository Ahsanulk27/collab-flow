import { Router, Request, Response } from "express";
import {
  getAllWorkspaces,
  createWorkspace,
  joinWorkspace,
  leaveWorkspace
} from "../controllers/workspaceController";
import { authMiddleware } from "../middleware/authMiddleware";

const workspaceRouter = Router();

workspaceRouter.use(authMiddleware);

workspaceRouter.get("/", getAllWorkspaces);

workspaceRouter.post("/", createWorkspace);

workspaceRouter.post("/join", joinWorkspace);

workspaceRouter.delete("/:workspaceId/leave", leaveWorkspace);

export default workspaceRouter;

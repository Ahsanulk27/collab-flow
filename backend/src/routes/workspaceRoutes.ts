import { Router, Request, Response } from "express";
import {
  getAllWorkspaces,
  createWorkspace,
  joinWorkspace,
  leaveWorkspace,
  getWorkspaceById,
} from "../controllers/workspaceController";
import chatRouter from "./chatRoutes";
import { authMiddleware } from "../middleware/authMiddleware";

const workspaceRouter = Router();

workspaceRouter.use(authMiddleware);

workspaceRouter.get("/", getAllWorkspaces);

workspaceRouter.get("/:workspaceId", getWorkspaceById);

workspaceRouter.post("/", createWorkspace);

workspaceRouter.post("/join", joinWorkspace);

workspaceRouter.delete("/:workspaceId/leave", leaveWorkspace);

// nested chat route for fetching chats in a workspace
workspaceRouter.use("/:workspaceId/messages", chatRouter);

export default workspaceRouter;

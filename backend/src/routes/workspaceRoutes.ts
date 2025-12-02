import { Router, Request, Response } from "express";
import {getAllWorkspaces, createWorkspace} from "../controllers/workspaceController"
import {authMiddleware} from "../middleware/authMiddleware";

const workspaceRouter = Router();

workspaceRouter.use(authMiddleware)

workspaceRouter.get("/", getAllWorkspaces);

workspaceRouter.post("/", createWorkspace);

workspaceRouter.post("/join", (req: Request, res: Response) => {
  res.send("JOIN a workspaces");
});

workspaceRouter.delete("/:id/leave", (req: Request, res:Response) => {
    res.send("LEAVE a workspace")
})

export default workspaceRouter;
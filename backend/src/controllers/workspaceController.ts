import { Response } from "express";
import { authRequest } from "../middleware/authMiddleware";
import { prisma } from "../config/db";

export const getAllWorkspaces = async (req: authRequest, res: Response) => {
    try{
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({success: false, message: "Unauthorized"});
        }

        const workspaces = await prisma.workspace.findMany({
            where: {
                members: {
                    some: {userId}
                }
            },
            include: {
                members: {
                    include: {user: true} //include user info for each member
                }
            },
            orderBy: {createdAt: "desc"}
        })
        res.status(200).json({success: true, workspaces});

    } catch(error){
        console.log(error)
        res.status(500).json({success: false, message: "Failed to fetch workspaces"});
    }
}

export const createWorkspace = async (req: authRequest, res: Response) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({success: false, message: "Unauthorized"});
      }
      const { name, description } = req.body;
  
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
      const workspace = await prisma.workspace.create({
        data: {
          name,
          description,
          inviteCode,
          members: {
            create: { userId, role: "OWNER" }
          }
        },
        include: {
          members: { include: { user: true } }
        }
      });
  
      res.status(201).json({ success: true, workspace });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Failed to create workspace" });
    }
  };
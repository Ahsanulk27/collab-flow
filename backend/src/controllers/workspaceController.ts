import { Response } from "express";
import { authRequest } from "../middleware/authMiddleware";
import { prisma } from "../config/db";

export const getAllWorkspaces = async (req: authRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          }, 
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, workspaces });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch workspaces" });
  }
};

export const createWorkspace = async (req: authRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { name, description } = req.body;

    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const workspace = await prisma.workspace.create({
      data: {
        name,
        description,
        inviteCode,
        members: {
          create: { userId, role: "OWNER" },
        },
      },
      include: {
        members: { include: { user: true } },
      },
    });

    res.status(201).json({ success: true, workspace });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to create workspace" });
  }
};

export const joinWorkspace = async (req: authRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const inviteCode = req.body.inviteCode;

    if (!inviteCode) {
      return res
        .status(400)
        .json({ success: false, message: "Invite code is required" });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { inviteCode: inviteCode },
    });

    if (!workspace) {
      return res
        .status(404)
        .json({ success: false, message: "Workspace not found" });
    }

    const isMember = await prisma.workspaceMember.findFirst({
      where: { userId, workspaceId: workspace.id },
    });

    if (isMember) {
      return res
        .status(400)
        .json({ success: false, message: "Already a member of the workspace" });
    }

    await prisma.workspaceMember.create({
      data: {
        userId,
        workspaceId: workspace.id,
        role: "MEMBER",
      },
    });

    res.status(200).json({
      success: true,
      message: "Joined workspace successfully",
      workspace,
    });
  } catch (error) {
    console.error("Error in joinWorkspace:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to join workspace" });
  }
};

export const leaveWorkspace = async (req: authRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "unauthorized access" });
    }

    const workspaceId = req.params.workspaceId;
    if (!workspaceId) {
      return res
        .status(400)
        .json({ success: false, message: "Workspace ID is required" });
    }

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId, workspaceId },
    });

    if (!membership) {
      return res
        .status(404)
        .json({ success: false, message: "Membership not found" });
    }

    await prisma.workspaceMember.delete({
      where: { id: membership.id },
    });

    res
      .status(200)
      .json({ success: true, message: "Left workspace successfully" });
  } catch (error) {
    console.error("Error in leaveWorkspace:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to leave workspace" });
  }
};

import { Response } from "express";
import { authRequest } from "../middleware/authMiddleware";
import { prisma } from "../config/db";

export const getAllChats = async (req: authRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const workspaceId = req.params.workspaceId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!workspaceId) {
      return res
        .status(400)
        .json({ success: false, message: "Workspace ID is required" });
    }
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: { where: { userId } } },
    });

    if (!workspace) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this workspace",
      });
    }

    const messages = await prisma.message.findMany({
      where: {
        workspaceId: workspaceId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            email: true,
          },
        },
      },
    });

    const reversedMessages = messages.reverse();

    return res.status(200).json({
      success: true,
      message: "Messages fetched successfully",
      messages: reversedMessages,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch messages" });
  }
};

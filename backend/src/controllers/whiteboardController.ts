import { Response } from "express";
import { prisma } from "../config/db";
import { authRequest } from "../middleware/authMiddleware";

export const getWhiteboard = async (req: authRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { workspaceId } = req.params;

    if (!workspaceId) {
      return res.status(400).json({ error: "Workspace ID is required" });
    }

    let whiteboard = await prisma.whiteboard.findUnique({
      where: { workspaceId },
    });

    // If no whiteboard exists for this workspace, create one
    if (!whiteboard) {
      whiteboard = await prisma.whiteboard.create({
        data: {
          workspaceId,
          elements: [],
        },
      });
    }

    res.json(whiteboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch whiteboard" });
  }
};

export const updateWhiteboard = async (req: authRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { workspaceId } = req.params;
    const { elements } = req.body;

    if (!workspaceId) {
      return res.status(400).json({ error: "Workspace ID is required" });
    }

    const whiteboard = await prisma.whiteboard.upsert({
      where: { workspaceId },
      update: { elements },
      create: {
        workspaceId,
        elements,
      },
    });

    res.json(whiteboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save whiteboard" });
  }
};

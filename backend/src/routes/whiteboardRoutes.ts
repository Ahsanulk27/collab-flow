import express from "express";
import { getWhiteboard, updateWhiteboard } from "../controllers/whiteboardController";
import { authMiddleware } from "../middleware/authMiddleware"; 

const router = express.Router();

router.get("/:workspaceId", authMiddleware, getWhiteboard);
router.put("/:workspaceId", authMiddleware, updateWhiteboard);

export default router;

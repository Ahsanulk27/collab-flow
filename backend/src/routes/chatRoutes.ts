import {Router} from "express";
import {authMiddleware} from "../middleware/authMiddleware";
import {getAllChats} from "../controllers/chatController";

// Add mergeParams: true
const chatRouter = Router({ mergeParams: true });

chatRouter.use(authMiddleware);

chatRouter.get("/", getAllChats);

export default chatRouter;



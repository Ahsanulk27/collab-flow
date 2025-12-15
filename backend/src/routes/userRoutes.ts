import { Router, Request, Response } from "express";
import { authMiddleware, authRequest } from "../middleware/authMiddleware";
import { prisma } from "../config/db";

const userRouter = Router();

userRouter.use(authMiddleware);

userRouter.get("/", (req: Request, res: Response) => {
  res.send("GET all users");
});

userRouter.get(
  "/me",
  authMiddleware,
  async (req: authRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
        },
      });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.status(200).json({ success: true, user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Failed to fetch user" });
    }
  }
);

userRouter.get("/:id", (req: Request, res: Response) => {
  res.send("GET user details");
});

userRouter.post("/", (req: Request, res: Response) => {
  res.send("CREATE new user");
});

userRouter.put("/:id", (req: Request, res: Response) => {
  res.send("UPDATE user");
});

userRouter.delete("/:id", (req: Request, res: Response) => {
  res.send("DELETE user");
});

export default userRouter;

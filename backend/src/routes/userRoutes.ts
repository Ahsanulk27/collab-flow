import { Router, Request, Response } from "express";

const userRouter = Router();

userRouter.get("/", (req: Request, res: Response) => {
  res.send("GET all users");
});

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

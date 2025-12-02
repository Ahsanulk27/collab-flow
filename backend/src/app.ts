import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import {Request, Response} from "express";

// Load common .env first, then environment-specific file
dotenv.config();
const env = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${env}`, override: true }); // Override with env-specific vars

import authRouter from "./routes/authRoutes";
import userRouter from "./routes/userRoutes";
import workspaceRouter from "./routes/workspaceRoutes";

import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/workspaces", workspaceRouter);

app.use(errorHandler);

app.get("/", (req: Request, res: Response) => {
  res.send("CollabFlow Server Running!");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on  http://localhost:${process.env.PORT}`);
});

export default app;

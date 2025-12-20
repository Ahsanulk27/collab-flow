import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";

dotenv.config();
const env = process.env.NODE_ENV || "production";
dotenv.config({ path: `.env.${env}`, override: true }); // Override with env-specific vars

import authRouter from "./routes/authRoutes";
import userRouter from "./routes/userRoutes";
import workspaceRouter from "./routes/workspaceRoutes";
import taskRouter from "./routes/taskRoutes";
import profileRouter from "./routes/profileRoutes";
import { errorHandler } from "./middleware/errorHandler";


const app = express();

app.use(
  cors({
    origin: "http://localhost:1045", 
    credentials: true,               
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/workspaces", workspaceRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1", taskRouter);
app.use(errorHandler);

app.get("/", (req: Request, res: Response) => {
  res.send("CollabFlow Server Running!");
});

const PORT = process.env.PORT || 1045;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;

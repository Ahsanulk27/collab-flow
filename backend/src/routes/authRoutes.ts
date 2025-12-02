import { Router, Request, Response } from "express";
import {signup, login, logout } from "../controllers/authController"

const authRouter = Router();

authRouter.post("/signup", signup);

authRouter.post("/login", login);

authRouter.post("/logout", logout);

export default authRouter;

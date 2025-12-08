import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface authRequest extends Request {
  user?: JwtPayload & { userId: string; email: string };
}

export const authMiddleware = async(
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ error: "JWT secret not configured" });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret);

    if (typeof decoded !== "object" || decoded === null) {
      res.status(401).json({ error: "Invalid token payload" });
      return;
    }

    const payload = decoded as JwtPayload;

    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string"
    ) {
      res.status(401).json({ error: "Invalid token payload" });
      return;
    }

    const userPayload = {
      ...payload,
      userId: payload.userId,
      email: payload.email,
    } as JwtPayload & { userId: string; email: string };
    req.user = userPayload;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
};

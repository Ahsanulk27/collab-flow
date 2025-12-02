import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface authRequest extends Request {
  user?: JwtPayload & { userId: string; email: string };
}

export function authMiddleware(
  req: authRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: "JWT secret not configured" });
    }

    const decoded = jwt.verify(token, jwtSecret);

    if (typeof decoded !== "object" || decoded === null) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    const payload = decoded as JwtPayload;

    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string"
    ) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    const userPayload = {
      ...payload,
      userId: payload.userId,
      email: payload.email,
    } as JwtPayload & { userId: string; email: string };
    req.user = userPayload;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

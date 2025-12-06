import { Prisma } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err);

  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        error: "A record with this value already exists.",
      });
    }

    if (err.code === "P2025") {
      return res.status(404).json({
        error: "Record not found.",
      });
    }

    return res.status(500).json({
      error: "Internal Server Error.",
    });
  }
  return res.status(err.status).json({
    error: err.message,
  });
}

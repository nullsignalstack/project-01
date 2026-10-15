import { Prisma } from "../generated/prisma/client.js";
import { ZodError } from "zod";
import type { ErrorRequestHandler } from "express";

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}
export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  next,
) => {
  if (res.headersSent) return next(error);
  if (error instanceof HttpError)
    return res.status(error.status).json({ error: error.message });
  if (error instanceof SyntaxError && "body" in error)
    return res.status(400).json({ error: "Invalid JSON request body." });
  if (error instanceof ZodError)
    return res.status(400).json({
      error: error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; "),
    });
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002")
      return res.status(409).json({ error: "That name already exists." });
    if (["P2025", "P2003", "P2018"].includes(error.code))
      return res.status(400).json({
        error: "The selected record no longer exists. Refresh and try again.",
      });
  }
  console.error(
    "Request failed",
    error instanceof Error ? error.name : "UnknownError",
  );
  res
    .status(500)
    .json({ error: "Unable to complete the request. Please try again." });
};

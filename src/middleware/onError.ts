import { ErrorHandler } from "hono";
import { ZodError } from "zod";

export const onError: ErrorHandler = (err, c) => {
  if (err instanceof ZodError) {
    return c.json({ error: "Invalid request" }, 400);
  }
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
};

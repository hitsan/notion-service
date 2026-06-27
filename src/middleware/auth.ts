import { MiddlewareHandler } from "hono";

export const apiSecretAuth: MiddlewareHandler<{
  Bindings: { API_SECRET: string };
}> = async (c, next) => {
  const secret = c.env.API_SECRET;
  const provided = c.req.header("X-Api-Secret");
  if (!secret || provided !== secret) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
  return;
};

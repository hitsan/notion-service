import { z } from "zod";

export const PageIdSchema = z.string().length(32);
export type PageId = z.infer<typeof PageIdSchema>;

export const UrlSchema = z.string().url();
export type Url = z.infer<typeof UrlSchema>;

export const PathSchema = z.string().min(1);
export type Path = z.infer<typeof PathSchema>;

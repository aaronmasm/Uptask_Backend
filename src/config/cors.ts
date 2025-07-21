import { CorsOptions } from "cors";

// cors.ts (configuración mejorada)
export const corsConfig: CorsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  allowedHeaders: ["Content-Type"],
};

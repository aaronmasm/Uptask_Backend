import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

// Extend Express Request interface to include csrfToken
declare global {
  namespace Express {
    interface Request {
      csrfToken?: () => string;
    }
  }
}

// Middleware para generar y validar tokens CSRF
export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Generar token CSRF si no existe
  const generateToken = () => {
    return crypto.randomBytes(32).toString("hex");
  };

  // Para requests que cambian estado, validar token
  if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
    const cookieToken = req.cookies.csrfToken;
    const bodyToken = req.body?._csrf || req.headers["x-csrf-token"];

    if (!cookieToken || !bodyToken || cookieToken !== bodyToken) {
      res.status(403).json({
        error: "Token CSRF inválido o faltante. Solicita un nuevo token.",
      });
      return;
    }
  }

  // Establecer cookie CSRF si no existe
  if (!req.cookies.csrfToken) {
    const token = generateToken();
    res.cookie("csrfToken", token, {
      httpOnly: false, // Debe ser accesible por JavaScript para el frontend
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 60 * 60 * 1000, // 1 hora
    });
  }

  // Agregar método para obtener token en responses
  req.csrfToken = () => {
    return req.cookies.csrfToken || generateToken();
  };

  next();
};

// Middleware para excluir rutas públicas del CSRF
export const csrfExclusion = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Rutas que no requieren CSRF (login público, etc.)
  const publicRoutes = [
    "/api/auth/login",
    "/api/auth/create-account",
    "/api/auth/confirm-account",
    "/api/auth/request-code",
    "/api/auth/forgot-password",
    "/api/auth/validate-token",
  ];

  if (publicRoutes.some((route) => req.path.startsWith(route))) {
    return next();
  }

  return csrfProtection(req, res, next);
};

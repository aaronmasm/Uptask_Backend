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

    if (!cookieToken || !bodyToken) {
      res.status(403).json({
        error: "Token CSRF faltante. Solicita un nuevo token.",
      });
      return;
    }

    try {
      const cookieBuffer = Buffer.from(cookieToken, "hex");
      const bodyBuffer = Buffer.from(bodyToken, "hex");

      if (
        cookieBuffer.length !== bodyBuffer.length ||
        !crypto.timingSafeEqual(cookieBuffer, bodyBuffer)
      ) {
        res.status(403).json({
          error: "Token CSRF inválido. Solicita un nuevo token.",
        });
        return;
      }
    } catch (error) {
      res.status(403).json({
        error: "Error al validar el token CSRF.",
      });
      return;
    }
  }

  // Establecer cookie CSRF si no existe
  if (!req.cookies.csrfToken) {
    const token = generateToken();
    res.cookie("csrfToken", token, {
      httpOnly: true, // Mayor seguridad, no accesible por JS
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Permitir en navegación inicial pero proteger contra cross-site
      maxAge: 60 * 60 * 1000, // 1 hora
    });
  }

  // Agregar método para obtener token en responses
  req.csrfToken = () => {
    const token = req.cookies.csrfToken || generateToken();

    // Si el token es nuevo y no se ha establecido la cookie aún, la establecemos
    if (!req.cookies.csrfToken) {
      res.cookie("csrfToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000,
      });
    }

    return token;
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

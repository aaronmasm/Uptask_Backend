import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

// Interfaz del payload del JWT
interface JwtPayload {
  id: string;
}

// Extendemos Request para incluir el campo user
declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ error: "No autorizado. Token no encontrado." });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await User.findById(decoded.id).select("-password -confirmed");

    if (!user) {
      res.status(401).json({ error: "Usuario no válido." });
      return;
    }

    req.user = user;
    next();
  } catch (e) {
    res.status(401).json({ error: "Token inválido o expirado." });
  }
};

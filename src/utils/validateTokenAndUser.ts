import Token from "../models/Token";
import User from "../models/User";
import type { Response } from "express";

export const validateTokenAndUser = async (
  token: string,
  res: Response,
): Promise<{ user: any; tokenExist: any } | null> => {
  const tokenExist = await Token.findOne({ token });

  if (!tokenExist) {
    const error = new Error("Token no válido");
    res.status(404).json({ error: error.message });
    return null;
  }

  const user = await User.findById(tokenExist.user);

  if (!user) {
    const error = new Error("Usuario no encontrado");
    res.status(404).json({ error: error.message });
    return null;
  }

  return { user, tokenExist };
};

import jwt, { SignOptions } from "jsonwebtoken";

type UserPayload = {
  id: string;
};

export const generateJWT = (
  payload: UserPayload,
  expiresIn: string | number,
): string => {
  const secret = process.env.JWT_SECRET!;
  if (!secret) {
    throw new Error("JWT_SECRET no está definido en las variables de entorno");
  }

  const options: SignOptions = {
    expiresIn: expiresIn as any, // Casting para evitar error TS2459
  };

  return jwt.sign(payload, secret, options);
};

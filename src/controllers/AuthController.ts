import type { Request, Response } from "express";
import User from "../models/User";
import Token from "../models/Token";
import { checkPassword, hashPassword } from "../utils/auth";
import { sendToken } from "../utils/sendToken";
import { validateTokenAndUser } from "../utils/validateTokenAndUser";
import { generateJWT } from "../utils/jwt";

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    try {
      const { password, email } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists) {
        const error = new Error("El usuario ya está registrado");
        res.status(409).json({ error: error.message });
        return;
      }

      const user = new User(req.body);
      user.password = await hashPassword(password);

      await user.save();

      await sendToken(user, "confirmation");

      res.send(
        "Tu cuenta ha sido creada correctamente. Revisa tu correo electrónico para confirmar tu registro",
      );
    } catch (e) {
      console.error(e);
      res.status(500).json({
        error: "Ha ocurrido un error interno. Intenta nuevamente más tarde",
      });
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const result = await validateTokenAndUser(token, res);
      if (!result) return;

      const { user, tokenExist } = result;

      user.confirmed = true;

      await Promise.allSettled([user.save(), tokenExist.deleteOne()]);

      res.send(
        "Tu cuenta ha sido confirmada exitosamente. Ya puedes iniciar sesión",
      );
    } catch (e) {
      console.error(e);
      res.status(500).json({
        error: "Ha ocurrido un error interno. Intenta nuevamente más tarde",
      });
    }
  };

  static loginAccount = async (req: Request, res: Response) => {
    try {
      const { email, password, rememberMe = false } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        const error = new Error("El usuario no está registrado");
        res.status(401).json({ error: error.message });
        return;
      }

      const isPasswordCorrect = await checkPassword(password, user.password);
      if (!isPasswordCorrect) {
        const error = new Error("La contraseña ingresada es incorrecta");
        res.status(401).json({ error: error.message });
        return;
      }

      if (!user.confirmed) {
        const existingToken = await Token.findOne({
          user: user.id,
          purpose: "confirmation",
        });

        if (existingToken) {
          const error = new Error(
            "Tu cuenta aún no ha sido confirmada. Ya hemos enviado un correo de confirmación. Por favor, revisa tu bandeja de entrada o carpeta de spam",
          );
          res.status(403).json({ error: error.message });
          return;
        }

        // No hay token activo, enviamos uno nuevo
        await sendToken(user, "confirmation");

        const error = new Error(
          "Tu cuenta aún no ha sido confirmada. Te acabamos de enviar un nuevo correo de confirmación",
        );
        res.status(403).json({ error: error.message });
        return;
      }

      const expiresIn = rememberMe ? "180d" : "1h";
      const token = generateJWT({ id: user.id.toString() }, expiresIn);

      // maxAge para cookie en ms, solo si rememberMe
      const maxAge = rememberMe ? 1000 * 60 * 60 * 24 * 30 * 6 : undefined;

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        ...(maxAge ? { maxAge } : {}),
        path: "/",
        // No usamos "domain" para que la cookie funcione correctamente en desarrollo y producción
      });

      // Respondemos con un mensaje o los datos que necesites
      res.json({ message: "Login exitoso" });
    } catch (e) {
      console.error(e);
      res.status(500).json({
        error: "Ha ocurrido un error interno. Intenta nuevamente más tarde",
      });
    }
  };

  static logoutAccount = (_req: Request, res: Response) => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Igual que login
      path: "/",
      domain: process.env.COOKIE_DOMAIN, // si también la usaste en login
    });

    res.json({ message: "Sesión cerrada correctamente" });
  };

  static requestConfirmationCode = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        const error = new Error(
          "No encontramos una cuenta registrada con ese correo electrónico",
        );
        res.status(404).json({ error: error.message });
        return;
      }

      const existingToken = await Token.findOne({ user: user.id });

      if (existingToken) {
        const error = new Error(
          "Ya se ha enviado un correo de confirmación. Por favor, revisa tu bandeja de entrada",
        );
        res.status(429).json({ error: error.message });
        return;
      }

      if (user.confirmed) {
        const error = new Error("Esta cuenta ya ha sido confirmada");
        res.status(403).json({ error: error.message });
        return;
      }

      await sendToken(user, "confirmation");

      res.send(
        "Hemos enviado un nuevo código de confirmación a tu correo electrónico",
      );
    } catch (e) {
      console.error(e);
      res.status(500).json({
        error: "Ha ocurrido un error interno. Intenta nuevamente más tarde",
      });
    }
  };

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        const error = new Error(
          "No existe una cuenta asociada a ese correo electrónico",
        );
        res.status(404).json({ error: error.message });
        return;
      }

      const existingToken = await Token.findOne({ user: user.id });

      if (existingToken) {
        const error = new Error(
          "Ya se ha enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada o carpeta de spam",
        );
        res.status(429).json({ error: error.message });
        return;
      }

      await sendToken(user, "reset");

      res.send(
        "Hemos enviado instrucciones para restablecer tu contraseña a tu correo electrónico",
      );
    } catch (e) {
      console.error(e);
      res.status(500).json({
        error: "Ha ocurrido un error interno. Intenta nuevamente más tarde",
      });
    }
  };

  static validateToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExist = await Token.findOne({ token });

      if (!tokenExist) {
        const error = new Error("Token no válido");
        res.status(404).json({ error: error.message });
        return;
      }

      res.send("Token válido, define tu nuevo password");
    } catch (e) {
      console.error(e);
      res.status(500).json({
        error: "Ha ocurrido un error interno. Intenta nuevamente más tarde",
      });
    }
  };

  static updatePasswordWithToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const result = await validateTokenAndUser(token, res);
      if (!result) return;

      const { user, tokenExist } = result;

      user.password = await hashPassword(password);

      await Promise.allSettled([user.save(), tokenExist.deleteOne()]);

      res.send("Tu contraseña fue restablecida con éxito");
    } catch (e) {
      console.error(e);
      res.status(500).json({
        error: "Ha ocurrido un error interno. Intenta nuevamente más tarde",
      });
    }
  };

  static user = async (req: Request, res: Response) => {
    res.json(req.user);
  };

  static updateProfile = async (req: Request, res: Response) => {
    const { name, email } = req.body;

    const userExist = await User.findOne({ email });

    if (userExist && userExist.id.toString() !== req.user.id.toString()) {
      const error = new Error("Ese email ya esta registrado");
      res.status(409).json({ error: error.message });
      return;
    }

    req.user.name = name;
    req.user.email = email;

    try {
      await req.user.save();
      res.send("Perfil actualizado correctamente");
    } catch (e) {
      res.status(500).send("Hubo un error");
    }
  };

  static updateCurrentUserPassword = async (req: Request, res: Response) => {
    const { current_password, password } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      const error = new Error("Usuario no encontrado");
      res.status(404).json({ error: error.message });
      return;
    }

    const isPasswordCorrect = await checkPassword(
      current_password,
      user.password,
    );
    if (!isPasswordCorrect) {
      const error = new Error("El Password actual es incorrecto");
      res.status(401).json({ error: error.message });
      return;
    }

    try {
      user.password = await hashPassword(password);
      await user.save();
      res.send("El Password se modificó correctamente");
    } catch (e) {
      res.status(500).send("Hubo un error");
    }
  };

  static checkPassword = async (req: Request, res: Response) => {
    const { password } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      const error = new Error("Usuario no encontrado");
      res.status(404).json({ error: error.message });
      return;
    }

    const isPasswordCorrect = await checkPassword(password, user.password);
    if (!isPasswordCorrect) {
      const error = new Error("El Password es incorrecto");
      res.status(401).json({ error: error.message });
      return;
    }

    res.send("Password Correcto");
  };
}

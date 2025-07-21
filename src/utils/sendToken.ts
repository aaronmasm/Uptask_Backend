import { IUser } from "../models/User";
import Token, { IToken } from "../models/Token";
import { generateToken } from "./token";
import { AuthEmail } from "../emails/AuthEmail";

type TokenPurpose = "confirmation" | "reset";

export const sendToken = async (
  user: IUser,
  purpose: TokenPurpose,
): Promise<IToken> => {
  const token = new Token({
    token: generateToken(),
    user: user.id,
    purpose,
  });

  await token.save();

  if (purpose === "confirmation") {
    await AuthEmail.sendConfirmationEmail({
      email: user.email,
      name: user.name,
      token: token.token,
    });
  } else {
    await AuthEmail.sendPasswordResetToken({
      email: user.email,
      name: user.name,
      token: token.token,
    });
  }

  return token;
};

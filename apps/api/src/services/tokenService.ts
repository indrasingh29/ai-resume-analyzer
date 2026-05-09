import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import type { UserDocument } from "../models/User";
import { ApiError } from "../utils/http";

type TokenPayload = JwtPayload & {
  sub: string;
  email: string;
  name: string;
};

export function signAccessToken(user: UserDocument) {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN
  };

  return jwt.sign(
    {
      email: user.email,
      name: user.name
    },
    env.JWT_SECRET,
    {
      ...options,
      subject: user.id as string
    }
  );
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);

    if (typeof payload === "string" || !payload.sub || !payload.email || !payload.name) {
      throw new ApiError(401, "Invalid authentication token");
    }

    return payload as TokenPayload;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(401, "Invalid or expired authentication token");
  }
}

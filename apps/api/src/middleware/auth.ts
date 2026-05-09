import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../services/tokenService";
import { ApiError } from "../utils/http";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authentication token is required"));
  }

  const token = header.slice("Bearer ".length);
  const payload = verifyAccessToken(token);

  req.user = {
    id: payload.sub,
    email: payload.email,
    name: payload.name
  };

  return next();
}

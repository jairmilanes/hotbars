import { NextFunction, Request, Response } from "express";
import { RequestEnhanced } from "../types";

export const persistParams = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  (req as RequestEnhanced).original = {
    params: { ...req.params },
    query: { ...req.query },
  };
  next();
};

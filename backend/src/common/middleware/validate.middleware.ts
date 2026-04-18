import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

export const validate = (schema: ZodTypeAny) => (req: Request, _res: Response, next: NextFunction): void => {
  schema.parse({
    body: req.body,
    params: req.params,
    query: req.query
  });
  next();
};

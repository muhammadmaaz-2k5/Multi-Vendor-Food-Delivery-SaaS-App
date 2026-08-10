import type { Request, Response, NextFunction } from 'express';
const { ZodObject, ZodError } = require('zod');


const validateRequest = (schema: ZodObject<any>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: (error as any).errors,
        });
        return;
      }
      next(error);
    }
  };
};
exports.validateRequest = validateRequest;


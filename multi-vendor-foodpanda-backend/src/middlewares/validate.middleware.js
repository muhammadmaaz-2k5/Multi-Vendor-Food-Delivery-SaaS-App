"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { ZodError } = require('zod');
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: error.errors,
                });
                return;
            }
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validate.middleware.js.map
// Importamos el tipo estándar para middleware en Express
import type { RequestHandler } from "express";

// Importamos el validador de resultados de express-validator
import { validationResult } from "express-validator";

/**
 * Middleware que captura errores de validación en las solicitudes.
 *
 * Si hay errores en los campos validados, responde con estado 400 y
 * un array de errores. Si no hay errores, continúa al siguiente middleware
 * o controlador.
 */
export const handleInputErrors: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);

  // Si existen errores de validación, respondemos con 400
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return; // Cortamos la ejecución del middleware
  }

  // Si no hay errores, continuamos con el siguiente middleware/controlador
  next();
};

import type { Request, Response, NextFunction } from "express";
import Task, { Itask } from "../models/Task";
import { IProject } from "../models/Project";

declare global {
  namespace Express {
    interface Request {
      task: Itask;
      project: IProject;
    }
  }
}

export async function taskExists(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) {
      const error = new Error("Tarea no encontrada");
      res.status(404).json({ error: error.message });
      return;
    }

    req.task = task;

    next();
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Hubo un error en el servidor" });
  }
}

export function taskBelongToProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.task.project.toString() !== req.project.id.toString()) {
    const error = new Error("No tienes permiso para acceder a esta tarea");
    res.status(403).json({ error: error.message });
    return;
  }
  next();
}

export function hasAuthorization(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user?.id;
  const managerId = req.project?.manager;

  // 1. Validamos existencia de datos
  if (!userId || !managerId) {
    const error = new Error("Faltan datos de autenticación o del proyecto");
    res.status(403).json({ error: error.message });
    return;
  }

  // 2. Comprobamos autorización
  if (userId.toString() !== managerId.toString()) {
    const error = new Error("No tienes permiso para realizar esta acción");
    res.status(403).json({ error: error.message });
    return;
  }

  next();
}

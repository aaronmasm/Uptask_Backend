// Importamos los tipos Request y Response desde Express para tipar correctamente los parámetros del controlador
import type { Request, Response } from "express";
import Project from "../models/Project";

// Definimos una clase llamada ProjectController que actuará como controlador para manejar la lógica relacionada con "Proyectos"
export class ProjectController {
  static createProject = async (req: Request, res: Response) => {
    const project = new Project(req.body);

    // Asigna un manager
    project.manager = req.user?.id;
    try {
      await project.save();
      res.send("Proyecto creado correctamente");
    } catch (e) {
      console.error("❌ Error al guardar el proyecto:", e);
      res.status(500).json({
        error: "Hubo un problema al guardar el proyecto. Inténtalo más tarde",
      });
    }
  };

  // Al ser estático, no necesitamos instanciar la clase para usarlo
  static getAllProjects = async (req: Request, res: Response) => {
    try {
      const projects = await Project.find({
        $or: [{ manager: req.user?.id }, { team: { $in: [req.user?.id] } }],
      });
      res.json(projects);
    } catch (e) {
      console.error(e);
      res.status(500).json({
        error: "No se pudieron obtener los proyectos. Inténtalo nuevamente",
      });
    }
  };

  static getProjectById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const project = await Project.findById(id).populate("tasks");

      if (!project) {
        const error = new Error("El proyecto solicitado no existe");
        res.status(404).json({ error: error.message });
        return;
      }

      if (
        project.manager?.toString() !== req.user?.id.toString() &&
        !project.team.includes(req.user?.id)
      ) {
        const error = new Error(
          "No tienes permisos para acceder a este proyecto",
        );
        res.status(403).json({ error: error.message });
        return;
      }

      res.json(project);
    } catch (e) {
      console.error(e);
      res
        .status(500)
        .json({ error: "Error al obtener el proyecto. Inténtalo más tarde" });
    }
  };

  static updateProject = async (req: Request, res: Response) => {
    try {
      req.project.projectName = req.body.projectName;
      req.project.clientName = req.body.clientName;
      req.project.description = req.body.description;
      await req.project.save();
      res.send("Proyecto actualizado con éxito.");
    } catch (e) {
      console.error(e);
      res.status(500).json({
        error: "No se pudo actualizar el proyecto. Inténtalo más tarde",
      });
    }
  };

  static deleteProject = async (req: Request, res: Response) => {
    try {
      await req.project.deleteOne();
      res.send("Proyecto eliminado correctamente");
    } catch (e) {
      console.error(e);
      res.status(500).json({
        error: "No se pudo eliminar el proyecto. Inténtalo más tarde",
      });
    }
  };
}

import type { Request, Response } from "express";
import User from "../models/User";
import Project from "../models/Project";

export class TeamMemberController {
  static findMemberByEmail = async (req: Request, res: Response) => {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email }).select(
      "-password -confirmed -__v",
    );

    if (!user) {
      const error = new Error("Usuario No Encontrado");
      res.status(404).json({ error: error.message });
      return;
    }

    res.json(user);
  };

  static getProjectMembers = async (req: Request, res: Response) => {
    const project = await Project.findById(req.project.id).populate({
      path: "team",
      select: "-password -confirmed -__v",
    });

    res.json(project?.team);
  };

  static addMemberById = async (req: Request, res: Response) => {
    const { id } = req.body;

    // Find user
    const user = await User.findById(id).select("id");

    if (!user) {
      const error = new Error("Usuario No Encontrado");
      res.status(404).json({ error: error.message });
      return;
    }

    // Si team es undefined, usa un array vacío como fallback
    const currentTeam = req.project.team ?? [];
    if (currentTeam.some((team) => team?.toString() === user.id.toString())) {
      const error = new Error("El usuario ya existe en el proyecto");
      res.status(409).json({ error: error.message });
      return;
    }

    req.project.team.push(user.id);
    await req.project.save();

    res.send("Usuario agregado correctamente");
  };

  static removeMemberById = async (req: Request, res: Response) => {
    const { userId } = req.params;

    const currentTeam = req.project.team ?? [];
    if (!currentTeam.some((team) => team?.toString() === userId)) {
      const error = new Error("El usuario no existe en el proyecto");
      res.status(409).json({ error: error.message });
      return;
    }

    // Aseguramos que team siempre sea un array ([] si es undefined/null)
    req.project.team = (req.project.team ?? []).filter(
      (teamMember) => teamMember?.toString() !== userId,
    );

    await req.project.save();

    res.send("Usuario eliminado correctamente");
  };
}

// Importamos el módulo Router desde express para poder crear rutas modularizadas
import { Router } from "express";
import { body, param } from "express-validator";

// Importamos el controlador de proyectos que contiene la lógica de negocio para manejar las rutas relacionadas con "Project"
import { authenticate } from "../middleware/auth";
import { handleInputErrors } from "../middleware/validation";
import { projectExists } from "../middleware/project";
import {
  hasAuthorization,
  taskBelongToProject,
  taskExists,
} from "../middleware/task";
import { ProjectController } from "../controllers/ProjectController";
import { TaskController } from "../controllers/TaskController";
import { TeamMemberController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";

// Creamos una nueva instancia del router de Express
const router = Router();

router.use(authenticate);

/** Routes for Projects */

router.post(
  "/",
  body("projectName")
    .notEmpty()
    .withMessage("El nombre del proyecto es obligatorio"),
  body("clientName")
    .notEmpty()
    .withMessage("El nombre del cliente es obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripción del proyecto es obligatoria"),
  handleInputErrors,
  ProjectController.createProject,
);

router.get("/", ProjectController.getAllProjects);

router.get(
  "/:id",
  param("id").isMongoId().withMessage("Id no válido"),
  handleInputErrors,
  ProjectController.getProjectById,
);

router.param("projectId", projectExists);

router.put(
  "/:projectId",
  param("projectId").isMongoId().withMessage("Id no válido"),
  body("projectName")
    .notEmpty()
    .withMessage("El nombre del proyecto es obligatorio"),
  body("clientName")
    .notEmpty()
    .withMessage("El nombre del cliente es obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripción del proyecto es obligatoria"),
  handleInputErrors,
  hasAuthorization,
  ProjectController.updateProject,
);

router.delete(
  "/:projectId",
  param("projectId").isMongoId().withMessage("Id no válido"),
  handleInputErrors,
  hasAuthorization,
  ProjectController.deleteProject,
);

/** Routes for Tasks */
router.post(
  "/:projectId/tasks",
  hasAuthorization,
  body("taskName")
    .notEmpty()
    .withMessage("El nombre de la tarea es obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripción de la tarea es obligatoria"),
  handleInputErrors,
  TaskController.createTask,
);

router.get("/:projectId/tasks", TaskController.getProjectTasks);

router.param("taskId", taskExists);
router.param("taskId", taskBelongToProject);

router.get(
  "/:projectId/tasks/:taskId",
  param("taskId").isMongoId().withMessage("Id no válido"),
  handleInputErrors,
  TaskController.getTaskById,
);

router.put(
  "/:projectId/tasks/:taskId",
  hasAuthorization,
  param("taskId").isMongoId().withMessage("Id no válido"),
  body("taskName")
    .notEmpty()
    .withMessage("El nombre de la tarea es obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripción de la tarea es obligatoria"),
  handleInputErrors,
  TaskController.updateTask,
);

router.delete(
  "/:projectId/tasks/:taskId",
  hasAuthorization,
  param("taskId").isMongoId().withMessage("Id no válido"),
  handleInputErrors,
  TaskController.deleteTask,
);

router.patch(
  "/:projectId/tasks/:taskId/status",
  param("taskId").isMongoId().withMessage("Id no válido"),
  body().notEmpty().withMessage("El estado es obligatorio"),
  handleInputErrors,
  TaskController.updateStatus,
);

/** Routes for Teams */
router.post(
  "/:projectId/team/find",
  body("email").isEmail().toLowerCase().withMessage("E-mail no válido"),
  handleInputErrors,
  TeamMemberController.findMemberByEmail,
);

router.get("/:projectId/team", TeamMemberController.getProjectMembers);

router.post(
  "/:projectId/team",
  body("id").isMongoId().withMessage("ID No Válido"),
  handleInputErrors,
  TeamMemberController.addMemberById,
);

router.delete(
  "/:projectId/team/:userId",
  param("userId").isMongoId().withMessage("ID No Válido"),
  handleInputErrors,
  TeamMemberController.removeMemberById,
);

/** Routes for Notes */
router.post(
  "/:projectId/tasks/:taskId/notes",
  body("content")
    .notEmpty()
    .withMessage("El contenido de la nota es obligatorio"),
  handleInputErrors,
  NoteController.createNote,
);

router.get("/:projectId/tasks/:taskId/notes", NoteController.getTaskNotes);

router.delete(
  "/:projectId/tasks/:taskId/notes/:noteId",
  param("noteId").isMongoId().withMessage("Id no válido"),
  handleInputErrors,
  NoteController.deleteNote,
);

// Exportamos el router para poder usarlo en otros archivos, por ejemplo, al montarlo en el archivo principal de rutas de la aplicación
export default router;

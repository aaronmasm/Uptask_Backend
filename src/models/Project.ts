// Importamos mongoose y desestructuramos Schema y Document desde el paquete
import mongoose, { Schema, Document, PopulatedDoc, Types } from "mongoose";
import Task, { Itask } from "./Task";
import { IUser } from "./User";
import Note from "./Note";

// Definimos una interface de TypeScript que extiende de Document (de Mongoose)
// y añade las propiedades específicas del modelo Project
export interface IProject extends Document {
  projectName: string;
  clientName: string;
  description: string;
  tasks: PopulatedDoc<Itask & Document>[];
  manager: PopulatedDoc<IUser & Document>;
  team: PopulatedDoc<IUser & Document>[];
}

// Creamos una nueva instancia de Schema de Mongoose para definir la estructura del modelo Project
const ProjectSchema: Schema = new Schema(
  {
    // Definimos el campo 'projectName' como string, obligatorio y sin espacios extra
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    // Definimos el campo 'clientName' como string, obligatorio y sin espacios extra
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    // Definimos el campo 'description' como string, obligatorio y sin espacios extra
    description: {
      type: String,
      required: true,
      trim: true,
    },
    tasks: [
      {
        type: Types.ObjectId,
        ref: "Task",
      },
    ],
    manager: {
      type: Types.ObjectId,
      ref: "User",
    },
    team: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

// Middleware
ProjectSchema.pre("deleteOne", { document: true }, async function () {
  const projectId = this._id;
  if (!projectId) return;

  const tasks = await Task.find({ project: projectId });
  for (const task of tasks) {
    await Note.deleteMany({ task: task.id });
  }

  await Task.deleteMany({ project: projectId });
});

// Creamos el modelo de Mongoose llamado "Project", basado en el esquema definido,
// y lo tipamos con nuestro tipo TypeScript personalizado 'ProjectType'
const Project = mongoose.model<IProject>("Project", ProjectSchema);
// Exportamos el modelo para poder utilizarlo en otras partes de la aplicación (por ejemplo en rutas o controladores)
export default Project;

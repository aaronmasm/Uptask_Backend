import "dotenv/config";
import express from "express";

// Importamos la librería CORS, que permite controlar qué orígenes pueden acceder a la API
import cors from "cors";

import morgan from "morgan";

import cookieParser from "cookie-parser";

// Importamos una configuración personalizada de CORS desde el archivo cors.ts
import { corsConfig } from "./config/cors";

// Importamos la función que conecta a la base de datos MongoDB
import { connectDB } from "./config/db";

// Importamos las rutas relacionadas con los proyectos
// Estas rutas están modularizadas en un archivo separado
import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";

// Ejecutamos la función para conectar con la base de datos MongoDB
// Se usa catch vacío para evitar advertencias si la promesa falla y no se maneja el error
connectDB().catch(() => {});

// Creamos una instancia de la aplicación de Express
const app = express();

// Aplicamos el middleware de CORS con la configuración personalizada importada
// Esto controla qué frontend puede hacer peticiones a nuestra API
app.use(cors(corsConfig));

// logging
app.use(morgan("dev"));

// Habilitamos el middleware de Express para parsear JSON automáticamente
// Esto permite que las peticiones POST o PUT con cuerpo JSON sean entendidas correctamente
app.use(express.json());

app.use(cookieParser());

// Registramos el archivo de rutas para proyectos
// Todas las rutas definidas en projectRoutes estarán disponibles bajo el prefijo /api/projects
// Ejemplo: GET /api/projects, POST /api/projects, etc.
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

// Exportamos la aplicación de Express para que pueda ser utilizada desde otro archivo
// como por ejemplo server.ts, donde se hará app.listen para arrancar el servidor
export default app;

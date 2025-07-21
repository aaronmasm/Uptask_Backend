// Importamos mongoose para conectarnos a MongoDB
import mongoose from "mongoose";

// Importamos colors para dar estilo a los mensajes de consola
import colors from "colors";

// Importamos 'exit' para cerrar el proceso de Node si ocurre un error grave
import { exit } from "node:process";

/**
 * Función para conectar a la base de datos MongoDB
 * Usa la variable de entorno DATABASE_URL como URI de conexión
 */
export const connectDB = async () => {
  try {
    // Intentamos conectarnos a la base de datos usando mongoose
    const { connection } = await mongoose.connect(process.env.DATABASE_URL!);

    // Construimos una URL informativa con el host y puerto
    const url = `${connection.host}:${connection.port}`;

    // Mostramos en consola que la conexión fue exitosa
    console.log(colors.magenta.bold(`✅ MongoDB conectado en: ${url}`));
  } catch (e) {
    // Mostramos un mensaje de error en rojo si falla la conexión
    console.log(colors.red.bold("❌ Error al conectar a MongoDB"));

    // Finalizamos el proceso de Node con código de error
    exit(1);
  }
};

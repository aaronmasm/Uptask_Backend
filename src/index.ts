// Importamos 'colors' para darle estilos a los mensajes de consola (por ejemplo, colores y negritas)
import colors from "colors";

// Importamos la instancia de la aplicación Express desde 'server.ts'
import server from "./server";

// Definimos el puerto en el que correrá el servidor
// Usa la variable de entorno PORT si existe, o por defecto el 4000
const port = process.env.PORT || 4000;

/**
 * Inicia el servidor escuchando en el puerto especificado.
 * Una vez activo, imprime un mensaje estilizado en consola usando 'colors'.
 */
server.listen(port, () => {
  console.log(colors.cyan.bold(`🚀 REST API funcionando en el puerto ${port}`));
});

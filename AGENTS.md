# Guías para Agentes - Uptask Backend

## Comandos

- Compilar: `npm run build` (Compilación TypeScript a ./dist)
- Desarrollo: `npm run dev` (Nodemon + ts-node desde src/index.ts)
- Producción: `npm start` (Ejecuta dist/index.js)
- Sin framework de pruebas - considerar agregar Jest/Mocha para testing
- Sin linting - considerar agregar ESLint + Prettier para calidad de código

## Estilo de Código

- Modo estricto de TypeScript habilitado, usar tipos explícitos
- Importar tipos con sintaxis `import type`
- Controladores basados en clases con métodos estáticos asíncronos
- Patrón async/await con manejo try/catch de errores
- Mensajes de error en español para respuestas al usuario
- Indentación de 2 espacios, comillas simples para strings
- Usar Promise.allSettled para operaciones DB paralelas

## Arquitectura

- Backend Express v5 + Mongoose (MongoDB)
- Autenticación JWT almacenada en cookies HTTP-only con SameSite
- Validación de requests usando express-validator
- Middleware de seguridad: Helmet (headers), CORS, cookie-parser, CSRF
- Protección CSRF con double-submit cookie pattern (token en cookie + body)
- Controladores manejan lógica de negocio, rutas definen endpoints
- Variables de entorno para configuración (PORT, DATABASE_URL, etc.)

## Seguridad CSRF

- Obtener token CSRF: GET /api/auth/csrf-token
- Incluir token en requests POST/PUT/DELETE: body.\_csrf o header x-csrf-token
- Rutas públicas (login, registro) excluidas de CSRF
- Tokens válidos por 1 hora, renovados automáticamente

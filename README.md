Goyochea Enzo Mariano - Comisión B

Dependencias:
    express
    express-validator
    mysql2
    passport
    passport-jwt
    jsonwebtoken
    bcrypt
    cors

Ejecución:
    1. Backend:  npm run backend
    2. Frontend: npm run dev  (Vite http://localhost:5173; consume la API en http://localhost:3000)

Frontend (frontend/src):
    pages/        Inicio (pública), Login, Vehiculos, Conductores, Viajes, Usuarios (solo admin)
    componentes/  Navbar, Campo
    services/     api.js (fetch contra la API REST, token y errores)
    utiles/       fechas.js

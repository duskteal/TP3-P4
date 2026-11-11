import express from 'express'
import { conectarDB } from './config/db.js'
import usuariosRouter from './middleware/rutas/usuarios.js';
import authRouter, { authConfig } from './middleware/auth.js'
const app = express();

const port = process.env.DB_PORT

app.use(express.json());

conectarDB();
authConfig();


app.use('/auth', authRouter);
app.use('/usuarios', usuariosRouter);

app.listen(port, () => {
  console.log(`La aplicación esta funcionando en ${port}`);
});
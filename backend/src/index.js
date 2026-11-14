import express from 'express'
import { conectarDB } from './config/db.js'
import usuariosRouter from './middleware/rutas/usuarios.js';
import loginRouter, { authConfig } from './middleware/rutas/login.js'
import vehiculosRouter from './middleware/rutas/vehiculos.js'
const app = express();

const port = process.env.DB_PORT

app.use(express.json());

conectarDB();
authConfig();


app.use('/login', loginRouter);
app.use('/usuarios', usuariosRouter);
app.use('/vehiculos', vehiculosRouter);

app.listen(port, () => {
  console.log(`La aplicación esta funcionando en ${port}`);
});
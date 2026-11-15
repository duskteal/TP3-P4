import express from 'express'
import cors from 'cors'
import { conectarDB } from './config/db.js'
import usuariosRouter from './middleware/rutas/usuarios.js';
import loginRouter, { authConfig } from './middleware/rutas/login.js'
import vehiculosRouter from './middleware/rutas/vehiculos.js'
import conductoresRouter from './middleware/rutas/conductores.js'
import viajesRouter from './middleware/rutas/viajes.js'
const app = express();

const port = process.env.DB_PORT

app.use(cors());
app.use(express.json());

conectarDB();
authConfig();


app.use('/login', loginRouter);
app.use('/usuarios', usuariosRouter);
app.use('/vehiculos', vehiculosRouter);
app.use('/conductores', conductoresRouter);
app.use('/viajes', viajesRouter);

app.listen(port, () => {
  console.log(`La aplicación esta funcionando en ${port}`);
});
import express from 'express'
import { conectarDB } from './db.js'
import rutas from './middleware/rutas/index.js';

const app = express();

const port = process.env.DB_PORT

app.use(express.json());

conectarDB()

app.use(rutasExpo)

app.listen(port, () => {
  console.log(`La aplicación esta funcionando en ${port}`);
});
import express, { Router } from 'express';
import { db } from '../../config/db.js';
import bcrypt from "bcrypt";
import { 
    validarAutenticacion,
    validarId,
    validarUsuario,verificarValidaciones } from '../validaciones.js';


const router = express.Router();

router.get('/', validarAutenticacion, verificarValidaciones, async (req, res) => {
  
  if (!req.user.esAdmin) {
      return res.status(401).send("Usuario no autorizado");
    }

  const [usuarios] = await db.execute(
    "SELECT id, nombre, email, esAdmin FROM usuarios",
  );

  res.json(usuarios);
});


router.get(
  '/:id',
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {

    if (!req.user.esAdmin) {
      return res.status(401).send("Usuario no autorizado");
    }

    const id = parseInt(req.params.id);
    const [usuarios] = await db.execute(
      "SELECT id, nombre, email, esAdmin FROM usuarios WHERE id=?",
      [id],
    );

    if (usuarios.length === 0) {
      return res.status(404).json("Usuario no encontrado");
    }

    res.json(usuarios[0]);
  }
);

router.post('/', validarAutenticacion, validarUsuario, verificarValidaciones, async (req, res) => {
 
    if (!req.user.esAdmin) {
      return res.status(401).send("Usuario no autorizado");
    }

    const { nombre, email, password, esAdmin } = req.body;

    const hashPassword = await bcrypt.hash(password, 12);

    const [result] = await db.execute(
      "INSERT INTO usuarios (nombre, email, hashPassword, esAdmin) VALUES (?,?,?,?)",
      [nombre, email, hashPassword, esAdmin],
    );

    res
      .status(201)
      .json({ id: result.insertId, nombre, email, esAdmin});
})

export default router;
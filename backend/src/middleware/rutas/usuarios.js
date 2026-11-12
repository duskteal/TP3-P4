import express from 'express';
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

    return res.status(201).json(usuarios[0]);
  }
);

router.post('/', validarAutenticacion, validarUsuario, verificarValidaciones, async (req, res) => {
 
    if (!req.user.esAdmin) {
      return res.status(401).send("Usuario no autorizado");
    }

    const { nombre, email, password, esAdmin } = req.body;

    const hashPassword = await bcrypt.hash(password, 12);

    const [resultado] = await db.execute(
      "INSERT INTO usuarios (nombre, email, hashPassword, esAdmin) VALUES (?,?,?,?)",
      [nombre, email, hashPassword, esAdmin],
    );

    res
      .status(201)
      .json({ id: resultado.insertId, nombre, email, esAdmin});
});

router.put(
  '/:id',
  validarAutenticacion,
  validarId,
  validarUsuario,
  verificarValidaciones,
  async (req, res) => {

    if (!req.user.esAdmin) {
      return res.status(401).send("Usuario no autorizado");
    }
    const id = parseInt(req.params.id);

    const idUsuario = await db.execute(
      "SELECT id FROM usuarios WHERE id=?",
      [id],
    );
    
    if (idUsuario === 0) {
      return res.status(404).json("Usuario no encontrado");
    }
    const { nombre, email, password, esAdmin } = req.body;
    const hashPassword = await bcrypt.hash(password, 12);
    const [resultado] = await db.execute(
      "UPDATE usuarios SET nombre = ?, email = ?, hashPassword = ?, esAdmin = ? WHERE id = ?",
      [nombre, email, hashPassword, esAdmin, id]
    );
    return res.status(200).json({ id: id, nombre, email, esAdmin});
  }
);

router.delete(
  '/:id',
  validarAutenticacion,
  validarId,
  async (req, res) => {

    if (!req.user.esAdmin) {
      return res.status(401).send("Usuario no autorizado");
    };

    const id = parseInt(req.params.id);

    const [usuarios] = await db.execute(
      "SELECT id FROM usuarios WHERE id = ?", [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json("Usuario no encontrado");
    }
    await db.execute('DELETE FROM usuarios WHERE id=?', [id]);

    return res.status(200).send('Usuario eliminado.')
  }
);
export default router;
import express from 'express';
import { verificarValidaciones } from '../validaciones.js'
import { db } from '../../config/db.js';
import { body } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

const router = express.Router();

export function authConfig(){
    const jwtOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
    };
    

    passport.use(
        new Strategy(jwtOptions, async (payload, next) => {
            next(null, payload);
        })
    );
};

router.post(
  "/login",
  [
    body('email')
      .not().isEmpty()
      .withMessage('Campo vacío. Ingrese un email')
      .isEmail()
      .withMessage('Solo se permite un email valido'),
    body('password')
      .not().isEmpty()
      .withMessage('Campo vacío. Ingrese una contraseña')
      .isString()
        .withMessage('El valor debe ser de mínimo 8 caracteres y al menos un número'),
  ],
  async (req, res) => {
    const { email, password } = req.body;

    const [usuarios] = await db.execute(
      "SELECT * FROM usuarios WHERE email=?",
      [email],
    );

    if (usuarios.length === 0) {
      return res.status(400).json("Email no existente");
    };

    // Verificar la contraseña
    const hashPassword = usuarios[0].hashPassword; // pw en db

    const passwordComparada = await bcrypt.compare(password, hashPassword);

    if (!passwordComparada) {
      return res.status(400).json("Contraseña incorrecta");
    }

    const sesionDuracion = '4h';

    const payload = {
      userId: usuarios[0].id,
      esAdmin: Boolean(usuarios[0].esAdmin)
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: sesionDuracion,
    });


    res.json({
      token,
      email: usuarios[0].email,
      esAdmin: Boolean(usuarios[0].esAdmin),
      mensaje: `Login exitoso. Duración de sesión: ${sesionDuracion}`
    });
  }
);

export default router;
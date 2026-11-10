import express, { Router , param } from 'express';
import {
    validarId,
    validarUsuario,
    validationResult
} from '.back-end/middleware/validaciones.js'


const router = express.Router();

router.get("/usuarios", (req, res => {

}))
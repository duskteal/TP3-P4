import express from 'express';
import { db } from '../../config/db.js';
import {
    validarAutenticacion,
    validarId,
    validarVehiculo,
    verificarValidaciones
    }
    from '../validaciones.js';

const router = express.Router();

router.get(
    '/',
    validarAutenticacion,
    verificarValidaciones,
    async (req, res) => {

        const [vehiculos] = await db.execute('SELECT * FROM vehiculos');

        if(vehiculos.length === 0) res.status(404).send('No hay registro de vehículos');

        res.status(200).json(vehiculos[0]);
    }
);

router.get(
    '/:id',
    validarAutenticacion,
    validarId,
    verificarValidaciones,
    async (req, res) => {

        const id = parseInt(req.params.id);

        const [vehiculos] = await db.execute('SELECT * FROM vehiculos WHERE id=?', [id]);

        if(vehiculos.length === 0) res.status(404).send('Vehículo no encontrado');

        return res.status(200).json(vehiculos[0]);

    }
)

router.post(
    '/',
    validarAutenticacion,
    validarVehiculo,
    verificarValidaciones,
    async (req, res) => {

        if (!req.user.esAdmin) {
            return res.status(403).send("Usuario no autorizado");
        }

        const { marca, modelo, patente, anio, capacidad_carga } = req.body;

        const [nuevoVehiculo] = await db.execute(
            'INSERT INTO vehiculos (marca, modelo, patente, anio, capacidad_carga) VALUES (?,?,?,?,?)',
             [marca, modelo, patente, anio, capacidad_carga]);

        // agregar funcion que no permita misma patente

        return res.status(201).json(nuevoVehiculo[0]);
    }
)

export default router;
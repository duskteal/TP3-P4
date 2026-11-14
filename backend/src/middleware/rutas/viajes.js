import express from 'express';
import { db } from '../../config/db.js';
import {
    validarAutenticacion,
    validarId,
    validarViaje,
    verificarValidaciones
    }
    from '../validaciones.js';

const router = express.Router();

router.get(
    '/',
    validarAutenticacion,
    verificarValidaciones,
    async (req, res) => {

        const [viajes] = await db.execute('SELECT * FROM viajes')

        if(viajes.length === 0) return res.status(404).send('No hay registros de viajes.')

        return res.status(200).json(viajes)
    }
);

router.get(
    '/:id',
    validarAutenticacion,
    validarId,
    verificarValidaciones,
    async (req, res) => {

        const id = parseInt(req.params.id);

        const [viaje] = await db.execute('SELECT * FROM viajes WHERE id=?', [id]);

        if(viaje.length === 0) return res.status(404).send('Viaje no encontrado');

        return res.status(200).json(viaje[0]);

    }
);

router.post(
    '/',
    validarAutenticacion,
    validarViaje,
    verificarValidaciones,
    async (req, res) => {

        if (!req.user.esAdmin) {
            return res.status(403).send("Usuario no autorizado.");
        }

        const {
            vehiculo_id,
            conductor_id,
            fecha_salida,
            fecha_llegada, 
            origen,
            destino,
            kilometros,
            observaciones} = req.body;

        const [nuevoViaje] = await db.execute(
            'INSERT INTO viajes (vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones) VALUES (?,?,?,?,?,?,?,?)',
             [vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones]);

        return res.status(201).json( {
             id: nuevoViaje.insertId,
             vehiculo_id,
             conductor_id,
             fecha_salida,
             fecha_llegada,
             origen,
             destino,
             kilometros,
             observaciones
            }
        )
    }
);

router.get(
    '/',
    validarAutenticacion,
    validarViaje,
    verificarValidaciones,
    async (req, res) => {

        const idVeh = parseInt(req.query.vehiculoId);
        const idCond = parseInt(req.query.conductorId);

        const [viajes] = await db.execute('SELECT * FROM viajes WHERE id_vehiculo = ? AND id_conductor = ?',
            [idVeh, idCond]
        )

        if(viajes.length === 0) return res.status(404).send("No existen viajes con estos parámetros.")

        return res.status(200).json(viajes)
    } // reparar, el endpoint muestra todo
);

export default router;
import express from 'express';
import { db, reiniciarAutoIncremento } from '../../config/db.js';
import {
    validarAutenticacion,
    validarId,
    validarViaje,
    validarQueryViajes,
    verificarValidaciones,
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
    '/filtrarPor',
    validarAutenticacion,
    validarQueryViajes,
    verificarValidaciones,
    async (req, res) => {

        const { vehiculoId, conductorId } = req.query;

        if (!vehiculoId && !conductorId) {
            return res.status(400).send('Indique vehiculoId, conductorId o ambos.');
        }

        const condiciones = [];
        const parametros = [];

        if (vehiculoId) {
            condiciones.push('vehiculo_id = ?');
            parametros.push(parseInt(vehiculoId));
        }

        if (conductorId) {
            condiciones.push('conductor_id = ?');
            parametros.push(parseInt(conductorId));
        }

        const [viajes] = await db.execute(
            `SELECT * FROM viajes WHERE ${condiciones.join(' AND ')} ORDER BY fecha_salida DESC`,
            parametros
        );

        if(viajes.length === 0) return res.status(404).send("No existen viajes con estos parámetros.")

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

function esErrorDeReferencia(err) {
    return err.code === 'ER_NO_REFERENCED_ROW_2';
}

router.post(
    '/',
    validarAutenticacion,
    validarViaje,
    verificarValidaciones,
    async (req, res) => {

        const {
            vehiculo_id,
            conductor_id,
            fecha_salida,
            fecha_llegada, 
            origen,
            destino,
            kilometros} = req.body;


        const observaciones = req.body.observaciones ?? null;

        try {
            await reiniciarAutoIncremento('viajes');

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
        } catch (err) {
            if (esErrorDeReferencia(err)) {
                return res.status(400).send('El vehículo o el conductor indicado no existe.');
            }
            throw err;
        }
    }
);

router.put(
    '/:id',
    validarAutenticacion,
    validarId,
    validarViaje,
    verificarValidaciones,
    async (req, res) => {

        if (!req.user.esAdmin) {
            return res.status(403).send("Usuario no autorizado.");
        }

        const id = parseInt(req.params.id);

        const [consultarId] = await db.execute('SELECT id FROM viajes WHERE id=?', [id]);

        if(consultarId.length === 0) return res.status(404).send('Viaje no encontrado');

        const {
            vehiculo_id,
            conductor_id,
            fecha_salida,
            fecha_llegada, 
            origen,
            destino,
            kilometros} = req.body;

        const observaciones = req.body.observaciones ?? null;

        try {
            await db.execute(
                'UPDATE viajes SET vehiculo_id = ?, conductor_id = ?, fecha_salida = ?, fecha_llegada = ?, origen = ?, destino = ?, kilometros = ?, observaciones = ? WHERE id = ?',
                [vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones, id]);
        } catch (err) {
            if (esErrorDeReferencia(err)) {
                return res.status(400).send('El vehículo o el conductor indicado no existe.');
            }
            throw err;
        }

        return res.status(200).json( {
             id,
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

router.delete(
    '/:id',
    validarAutenticacion,
    validarId,
    verificarValidaciones,
    async (req, res) => {

        if (!req.user.esAdmin) {
            return res.status(403).send("Usuario no autorizado.");
        }

        const id = parseInt(req.params.id);

        const [consultarId] = await db.execute('SELECT id FROM viajes WHERE id=?', [id]);

        if(consultarId.length === 0) return res.status(404).send('Viaje no encontrado');

        await db.execute('DELETE FROM viajes WHERE id=?', [id]);

        return res.status(200).send('Viaje eliminado.');
    }
);

export default router;
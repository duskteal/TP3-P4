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

        if(vehiculos.length === 0) return res.status(404).send('No hay registro de vehículos');

        return res.status(200).json(vehiculos);
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

        if(vehiculos.length === 0) return res.status(404).send('Vehículo no encontrado');

        return res.status(200).json(vehiculos);

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

        const [consultarPatenteExistente] = await db.execute('SELECT patente FROM vehiculos WHERE patente=?', [patente])

        if(consultarPatenteExistente.length !== 0) {
            return res.status(400).send('Ya existe un vehículo con esa patente.');
        }
        

        const [cargaVehiculo] = await db.execute(
            'INSERT INTO vehiculos (marca, modelo, patente, anio, capacidad_carga) VALUES (?,?,?,?,?)',
             [marca, modelo, patente, anio, capacidad_carga]);

        return res.status(201).json( { id: cargaVehiculo.insertId, marca, modelo, patente, anio, capacidad_carga });
    }
);

router.put(
    '/:id',
    validarAutenticacion,
    validarId,
    validarVehiculo,
    verificarValidaciones,
    async (req, res) => {

        if (!req.user.esAdmin) {
            return res.status(403).send("Usuario no autorizado");
        }

        const id = parseInt(req.params.id);

        const [consultarId] = await db.execute('SELECT * FROM vehiculos WHERE id=?', [id]);

        if(consultarId.length === 0) return res.status(404).send('Vehículo no encontrado');

        const { marca, modelo, patente, anio, capacidad_carga } = req.body;

        const [consultarPatenteExistente] = await db.execute(
            'SELECT patente FROM vehiculos WHERE patente=? AND id<>?',
            [patente, id]
        )

        if(consultarPatenteExistente.length !== 0) {
            return res.status(400).send('Ya existe un vehículo con esa patente.');
        }

        await db.execute(
            'UPDATE vehiculos SET marca = ?, modelo = ?, patente = ?, anio = ?, capacidad_carga = ? WHERE id = ?',
            [marca, modelo, patente, anio, capacidad_carga, id]
        );

        return res.status(200).json( {id: id, marca, modelo, patente, anio, capacidad_carga });
    }
);

router.delete(
    '/:id',
    validarAutenticacion,
    validarId,
    verificarValidaciones,
    async (req, res) => {

        if (!req.user.esAdmin) {
            return res.status(403).send("Usuario no autorizado");
        }

        const id = parseInt(req.params.id);

        const [consultarId] = await db.execute(
            "SELECT id FROM vehiculos WHERE id = ?", [id]
        );

        if (consultarId.length === 0) {
          return res.status(404).json("Vehículo no encontrado.");
        }

        async function eliminarVehiculo(){
            await db.execute('DELETE FROM vehiculos WHERE id=?', [id])
            res.status(200).send('Vehiculo eliminado.')
        }

        try{ await eliminarVehiculo(id) }
        catch(err){
            return res.status(409).json(
                {
                msg: "Error: el elemento a borrar presenta conflictos en otras tablas.",
                err
                }
            )
        };
    }
);


export default router;
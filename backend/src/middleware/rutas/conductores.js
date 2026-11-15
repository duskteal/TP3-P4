import express from 'express';
import { db } from '../../config/db.js';
import {
    validarAutenticacion,
    validarId,
    validarConductor,
    verificarValidaciones,
    }
    from '../validaciones.js';

const router = express.Router();

router.get(
    '/',
    validarAutenticacion,
    verificarValidaciones,
    async (req, res) => {

        const [conductores] = await db.execute('SELECT * FROM conductores');

        if(conductores.length === 0) res.status(404).send('No hay registros de conductores.');

        res.status(200).json(conductores);
    }
);

router.get(
    '/:id',
    validarAutenticacion,
    validarId,
    verificarValidaciones,
    async (req, res) => {

        const id = parseInt(req.params.id);

        const [conductor] = await db.execute('SELECT * FROM conductores WHERE id=?', [id]);

        if(conductor.length === 0) return res.status(404).send('Conductor no encontrado');

        return res.status(200).json(conductor[0]);

    }
);

router.post(
    '/',
    validarAutenticacion,
    validarConductor,
    verificarValidaciones,
    async (req, res) => {

        if (!req.user.esAdmin) {
            return res.status(403).send("Usuario no autorizado.");
        }

        const {
            nombre,
            apellido,
            numero_documento,
            numero_licencia, 
            fecha_alta_licencia,
            fecha_vencimiento_licencia} = req.body;

        const [consultarConductorExistente] = await db.execute(
            'SELECT * FROM conductores WHERE numero_documento=? OR numero_licencia=?',
            [numero_documento, numero_licencia]
        )

        if(consultarConductorExistente.length !== 0) {
            return res.status(400).send('Ya existe un conductor con ese número de documento o licencia.');
        }

        const [nuevoConductor] = await db.execute(
            'INSERT INTO conductores (nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia) VALUES (?,?,?,?,?,?)',
             [nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia]);

        return res.status(201).json( { id: nuevoConductor.insertId, nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia } );
    }
);

router.put(
    '/:id',
    validarAutenticacion,
    validarId,
    validarConductor,
    verificarValidaciones,
    async (req, res) => {

        const id = parseInt(req.params.id);

        const [consultarId] = await db.execute('SELECT * FROM conductores WHERE id=?', [id]);

        if(consultarId.length === 0) return res.status(404).send('Conductor no encontrado');

        const {
            nombre,
            apellido,
            numero_documento,
            numero_licencia, 
            fecha_alta_licencia,
            fecha_vencimiento_licencia} = req.body;

        const [consultarConductorExistente] = await db.execute(
            'SELECT * FROM conductores WHERE numero_documento=? OR numero_licencia=?',
            [numero_documento, numero_licencia]
        )

        if(consultarConductorExistente.length !== 0) {
            return res.status(400).send('Ya existe un conductor con ese número de documento o licencia.');
        }

        await db.execute(
            'UPDATE conductores SET nombre = ?, apellido = ?, numero_documento = ?, numero_licencia = ?, fecha_alta_licencia = ?, fecha_vencimiento_licencia = ? WHERE id = ?',
            [nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia, id]
        );

        return res.status(200).json( {id: id, nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia });
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
            "SELECT id FROM conductores WHERE id = ?", [id]
        );

        async function eliminarConductor(){
            await db.execute('DELETE FROM conductores WHERE id=?', [id]);
            return res.status(200).send("Conductor eliminado.");
        }
        if (consultarId.length === 0) {
          return res.status(404).json("Conductor no encontrado.");
        }

        
        try{ await eliminarConductor(id) }
        catch(err){
            return res.status(409).json(
                {
                msg: "Error: el elemento a borrar presenta conflictos en otras tablas.",
                err
                }
            )
        }        
    }
)

export default router;
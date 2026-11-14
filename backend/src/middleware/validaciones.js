import express from 'express';
import { validationResult, body, param, query } from 'express-validator';
import passport from 'passport'

export const validarAutenticacion = passport.authenticate("jwt", {
  session: false,
});

export const validarId = param("id")
    .isInt({ min: 1})
    .withMessage('Solo se permiten números positivos');

export const validarUsuario = [
    body('nombre')
        .isAlpha("es-ES")
        .withMessage('Solo se permiten letras y numeros')
        .isLength({ min: 1, max: 25})
        .withMessage('Solo se permiten entre 1 y 25 caracteres'),
    body('email')
        .isEmail()
        .withMessage('Solo se permite un email valido'),
    body('password')
        .isStrongPassword({
            minLength: 8,
            minLowercase: 0,
            minUppercase: 0,
            minNumbers: 1,
            minSymbols: 0,
        })
        .withMessage('El valor debe ser de mínimo 8 caracteres y al menos un número'),
    body('esAdmin')
        .isBoolean()
        .withMessage('El valor debe ser `true` o `false`')
];

export const validarVehiculo = [
    body('marca')
        .optional()
        .isString()
        .isLength({ min: 1, max: 20})
        .withMessage('Solo se permiten entre 1 y 20 caracteres'),
    body('modelo')
        .optional()
        .isString()
        .isLength({ min: 1, max: 20})
        .withMessage('Solo se permiten entre 1 y 20 caracteres'),
    body('patente')
        .optional()
        .isLicensePlate('es-AR')
        .withMessage('Solo se permiten patentes con formato de Argentina'),
    body('anio')
        .optional()
        .isInt( { min: 1900 }) // a menos que maneje una carreta, raro que sea modelo anterior
        .withMessage('Solo se permiten números mayores a 1900')
        .isLength({ min: 4, max: 4})
        .withMessage('Solo se permiten 4 caracteres en el campo'),
    body('capacidad_carga')
        .optional()
        .isLength( {min: 1, max: 6} )
        .withMessage('Solo se permiten entre 1 y 6 caracteres')
        .isFloat( {min: 0, max: 150000})
        .withMessage('Solo se permiten valores numéricos entre 0 y 150000')
];

export const validarConductor = [
    body('nombre')
        .optional()
        .isAlpha('es-ES')
        .withMessage('Solo se permiten letras')
        .isLength( { min: 1, max: 20} )
        .withMessage('Solo se permiten entre 1 y 20 caracteres'),
    body('apellido')
        .optional()
        .isAlpha('es-ES')
        .withMessage('Solo se permiten letras')
        .isLength( { min: 1, max: 20} )
        .withMessage('Solo se permiten entre 1 y 20 caracteres'),
    body('numero_documento')
        .optional()
        .isInt( { min: 0 })
        .withMessage('Solo se permiten números')
        .isLength( { min: 8, max: 8})
        .withMessage('Solo se permiten 8 caracteres'),
    body('numero_licencia')
        .optional()
        .isInt( { min: 0 })
        .withMessage('Solo se permiten números')
        .isLength( { min: 8, max: 8 } ) // NOTA: No sé que licencia es, supondremos 8 caracteres
        .withMessage('Solo se permiten 8 caracteres'),
    body('fecha_alta_licencia')
        .optional()
        .isDate({ format: 'YYYY-MM-DD', strictMode: false })
        .withMessage('Solo se permite una fecha de formato YYYY-MM-DD'),
    body('fecha_vencimiento_licencia')
        .optional()
        .isDate({ format: 'YYYY-MM-DD', strictMode: false })
        .custom((vencimiento, { req }) => {
                const alta = req.body.fecha_alta_licencia;

                if (new Date(vencimiento) <= new Date(alta)) {
                  throw new Error('La fecha de vencimiento de la licencia debe ser posterior a su fecha de alta.');
                }
            
                return true;
            }
        )
]

export const validarViaje = [
    body('vehiculo_id')
        .isInt( { min: 1 })
        .withMessage('Solo se permite números positivos'),
    body('conductor_id')
        .isInt( { min: 1 })
        .withMessage('Solo se permite números positivos'),
    body('fecha_salida')
        .isDate({ format: 'YYYY-MM-DD', strictMode: false })
        .withMessage('Solo se permite una fecha de formato YYYY-MM-DD'),
    body('fecha_llegada')
        .isDate({ format: 'YYYY-MM-DD', strictMode: false })
        .custom((llegada, { req }) => {
                const salida = req.body.fecha_salida;

                if (new Date(llegada) <= new Date(salida)) {
                  throw new Error('La fecha de llegada debe ser posterior a la fecha de salida');
                }
            
                return true;
            }
        ),
    body('origen')
        .isString()
        .withMessage('Solo se permite un string')
        .isLength( { min: 1, max: 100 })
        .withMessage('Solo se permiten entre 1 y 100 caracteres'),
    body('destino')
        .isString()
        .withMessage('Solo se permite un string')
        .isLength( { min: 1, max: 100 })
        .withMessage('Solo se permiten entre 1 y 100 caracteres'),
    body('kilometros')
        .isNumeric( { min: 0, max: 30000 } )
        .withMessage('Solo se permiten números entre 0 y 30000'),
    body('observaciones')
        .optional()
        .isString('es-ES')
        .withMessage('Solo se permite un string')
        .isLength({ min: 1, max: 300 })
        .withMessage('Solo se permiten entre 1 y 300 caracteres'),
    query('vehiculoId')
        .isEmpty()
        .withMessage('No se permite este campo vacío.')
        .isInt( { min: 1 })
        .withMessage('Solo se permite números positivos'),
    query('conductorId')
        .isEmpty()
        .withMessage('No se permite este campo vacío.')
        .isInt( { min: 1 })
        .withMessage('Solo se permite números positivos')
];

// Resultados y manejo
export const verificarValidaciones = (req, res, next) => {
    const resultadoValidaciones = validationResult(req);
    
    if(!resultadoValidaciones.isEmpty()) {
        return res.status(400).json({
            mensaje: 'Parámetros inválidos. Revise los campos e intente nuevamente',
            errores: resultadoValidaciones.array()
        });
    }
    next();
};
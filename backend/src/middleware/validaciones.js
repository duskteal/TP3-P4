import { validationResult, body, param } from 'express-validator';
import passport from 'passport'

export const validarAutenticacion = passport.authenticate("jwt", {
  session: true,
});


export const validarId = param("id")
    .isInt({ min: 1})
    .withMessage('Solo se permiten números positivos');

export const validarUsuario = [
    body('nombre')
        .isAlphanumeric("es-ES")
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
        .isAlpha('es-ES')
        .withMessage('Solo se permiten letras')
        .isLength({ min: 1, max: 20})
        .withMessage('Solo se permiten entre 1 y 20 caracteres'),
    body('modelo')
        .isAlphanumeric('es-ES')
        .withMessage('Solo se permiten letras y numeros')
        .isLength({ min: 1, max: 20})
        .withMessage('Solo se permiten entre 1 y 20 caracteres'),
    body('patente')
        .isLicensePlate('es-AR')
        .withMessage('Solo se permiten patentes con formato de Argentina'),
    body('anio')
        .isInt( { min: 1900 }) // a menos que maneje una carreta, raro que sea modelo anterior
        .withMessage('Solo se permiten numeros')
        .isLength({ min: 4, max: 4})
        .withMessage('Solo se permiten 4 caracteres en el campo'),
    body('capacidad_carga')
        .isLength( {min: 1, max: 5} )
        .withMessage('Solo se permiten entre 1 y 5 caracteres')
        .isNumeric( {min: 1, max: 40000})
        .withMessage('Solo se permiten valores numéricos entre 1 y 40000')
];

export const validarConductor = [
    body('nombre')
        .isAlpha('es-ES')
        .withMessage('Solo se permiten letras')
        .isLength( { min: 1, max: 20} )
        .withMessage('Solo se permiten entre 1 y 20 caracteres'),
    body('apellido')
        .isAlpha('es-ES')
        .withMessage('Solo se permiten letras')
        .isLength( { min: 1, max: 20} )
        .withMessage('Solo se permiten entre 1 y 20 caracteres'),
    body('numero_documento')
        .isInt( { min: 0 })
        .withMessage('Solo se permiten números')
        .isLength( { min: 8, max: 8})
        .withMessage('Solo se permiten 8 caracteres'),
    body('numero_licencia')
        .isInt( { min: 0 })
        .withMessage('Solo se permiten números')
        .isLength( { min: 8, max: 8 } ) // NOTA: No sé que licencia es, supondremos 8 caracteres
        .withMessage('Solo se permiten 8 caracteres'),
    body('fecha_alta_licencia')
        .isDate({ format: 'DD-MM-YYYY', strictMode: false })
        .withMessage('Solo se permite una fecha de formato DD-MM-YYYY'),
    body('fecha_vencimiento_licencia')
        .isDate({ format: 'DD-MM-YYYY', strictMode: false })
        .withMessage('Solo se permite una fecha de formato DD-MM-YYYY')
]

export const validarViaje = [
    body('vehiculo_id')
        .isInt( { min: 1 })
        .withMessage('Solo se permite números positivos'),
    body('conductor_id')
        .isInt( { min: 1 })
        .withMessage('Solo se permite números positivos'),
    body('fecha_salida')
        .isDate({ format: 'DD-MM-YYYY', strictMode: false })
        .withMessage('Solo se permite una fecha de formato DD-MM-YYYY'),
    body('fecha_llegada')
        .isDate({ format: 'DD-MM-YYYY', strictMode: false })
        .withMessage('Solo se permite una fecha de formato DD-MM-YYYY'),
    body('origen')
        .isString()
        .withMessage('Solo se permite un string')
        .isLength( { min: 1, max: 50 })
        .withMessage('Solo se permiten entre 1 y 50 caracteres'),
    body('destino')
        .isString()
        .withMessage('Solo se permite un string')
        .isLength( { min: 1, max: 50 })
        .withMessage('Solo se permiten entre 1 y 50 caracteres'),
    body('kilometros')
        .isNumeric( { min: 0, max: 30000 } )
        .withMessage('Solo se permiten números entre 0 y 30000'),
    body('observaciones')
        .optional()
        .isString('es-ES')
        .withMessage('Solo se permite un string')
        .isLength({ min: 1, max: 300 })
        .withMessage('Solo se permiten entre 1 y 300 caracteres')
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
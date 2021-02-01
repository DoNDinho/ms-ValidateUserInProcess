'use strict';
const logger = require('../config/log4js_config');
const headerSchema = require('../schemas/header_schema');
const userSchema = require('../schemas/user_schema');
const UsuarioEnProceso = require('../models/UsuarioEnProceso');

class User {
    /**
     * @method
     * @description Valida el request de la solicitud
     * @param {object} headers cabecera de la solicitud
     * @param {object} body cuerpo de la solicitud
     * @param {object} res objeto que contiene respuesta de la solicitud
     */
    validarRequest(headers, body, res) {
        const Ajv = require('ajv');
        const ajv = new Ajv();
        let valid;

        return new Promise((resolve, reject) => {
            logger.info('Validando request de la solicitud');
            // Validando headers de la solicitud
            valid = ajv.validate(headerSchema, headers);
            if (!valid) {
                logger.error('Solicitud invalida - Headers invalidos!');
                return res.status(400).json({
                    code: '400',
                    message: `${ajv.errors[0].message}`
                });
            } else {
                // Validando body de la solicitud
                valid = ajv.validate(userSchema, body);

                if (!valid) {
                    logger.error('Solicitud invalida - Body invalido!');
                    reject(
                        res.status(400).json({
                            code: '400',
                            message: `${ajv.errors[0].dataPath} - ${ajv.errors[0].message}`
                        })
                    );
                } else {
                    logger.info('Solicitud valida!');
                    resolve(body);
                }
            }
        });
    }

    /**
     * @method
     * @description Retorna datos asociados al usuario en proceso de registro
     * @param {integer} auth_code codigo verificacion de usuario en proceso de registro
     * @param {string} email email de usuario en proceso de registro
     * @param {object} res objeto que contiene respuesta de la solicitud
     */
    validarCodigoYEmail(auth_code, email, res) {
        logger.info('Buscando datos en base de datos');

        return new Promise((resolve, reject) => {
            // La consulta devuelve user_encrypted y fech_exp
            UsuarioEnProceso.findOne({ auth_code: auth_code, email: email }, 'user_encrypted fech_exp').exec((err, usuarioEnProceso) => {
                if (err) {
                    logger.error('Error al obtener datos');
                    res.status(502).json({
                        code: '502',
                        message: 'Bad Gateway'
                    });

                    reject(res);
                } else {
                    if (!usuarioEnProceso) {
                        logger.error('Datos no existen');
                        res.status(422).json({
                            code: '422',
                            message: 'Código autorizacion inválido'
                        });

                        reject(res);
                    } else {
                        logger.info('Datos encontrados');
                        resolve(usuarioEnProceso);
                    }
                }
            });
        });
    }

    /**
     * @method
     * @description valida la fecha de expiracion
     * @param {string} fech_exp fecha de expiracion
     * @returns {boolean} true si la fecha es valida, false si la fecha expiro
     */
    validarFechaExp(fech_exp) {
        let fechaActual = new Date();
        let fechaExp = new Date(fech_exp);

        logger.info('Validando fecha expiracion');
        if (fechaActual.getTime() > fechaExp.getTime()) {
            logger.info('Codigo ha expirado');
            return false;
        } else {
            logger.info('Fecha expiracion valida');
            return true;
        }
    }

    /**
     * @method
     * @description elimina usuario en proceso de la base de datos
     * @param {integer} auth_code codigo verificacion de usuario en proceso de registro
     * @param {string} email email de usuario en proceso de registro
     */
    eliminarUsuarioEnProceso(auth_code, email) {
        logger.info('eliminando registro');
        UsuarioEnProceso.findOneAndDelete({ auth_code: auth_code, email: email }).exec();
    }
}

module.exports = User;

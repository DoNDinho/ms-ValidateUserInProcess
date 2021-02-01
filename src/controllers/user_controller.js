'use strict';
const logger = require('../config/log4js_config');
const User = require('../services/user_service');

exports.user = async (req, res) => {
    try {
        let transactionId = req.headers.transaction_id;
        logger.addContext('transaction_id', transactionId);

        let headers = req.headers;
        let body = req.body;
        let auth_code = body.data.auth_code;
        let email = body.data.client_data.email;

        let user = new User();

        try {
            await user.validarRequest(headers, body, res);
            let usuarioEnProceso = await user.validarCodigoYEmail(auth_code, email, res);
            let fech_exp = usuarioEnProceso.fech_exp; // Fecha expiracion codigo
            let user_encrypted = usuarioEnProceso.user_encrypted; // Usuario encriptado

            let fechaExpValida = user.validarFechaExp(fech_exp);

            if (!fechaExpValida) {
                res.status(422).json({
                    code: '422',
                    message: 'Código ha expirado'
                });
            } else {
                user.eliminarUsuarioEnProceso(auth_code, email);

                res.json({
                    data: {
                        user_encrypted
                    }
                });
            }
        } catch (err) {
            // devuelve objeto error
            return err;
        }
    } catch (err) {
        logger.error('Ha ocurrido un error en metodo User in Process Validate Controller: ', err);
        return res.status(500).json({
            code: '500',
            message: 'Internal Server Error'
        });
    }
};

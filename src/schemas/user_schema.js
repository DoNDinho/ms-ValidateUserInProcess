const userSchema = {
    type: 'object',
    properties: {
        data: {
            type: 'object',
            properties: {
                auth_code: {
                    type: 'integer',
                    minimum: 1
                },
                client_data: {
                    type: 'object',
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            minLength: 1
                        }
                    },
                    required: ['email']
                }
            },
            required: ['auth_code', 'client_data']
        }
    },
    required: ['data']
};

module.exports = userSchema;

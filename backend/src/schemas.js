const Joi = require('joi');

// DATA VALIDATION 
const itemSchema = Joi.object({
    lobbyId: Joi.string().min(1).max(40).required(),
    lobbyName: Joi.string().min(1).max(30).required(),
    isPrivate: Joi.boolean().required(),
    lobbyPass: Joi.when('isPrivate', {
        is: true,
        then: Joi.string().min(4).max(30).required(),
        otherwise: Joi.string().allow('').optional()
    }),
    lobbyStatus: Joi.string().min(1).max(10).required(),
    player1: Joi.string().min(1).max(40).required()
    /*
    player1: Joi.object().keys({
        playerId: Joi.string().min(1).max(255).required(),
        playerName: Joi.string().min(1).max(255).required(),
        isReady: Joi.boolean().required()
    }).required()*/
});

const player2Schema = Joi.object({
    lobbyName: Joi.string().min(1).max(255).optional(),
    player2: Joi.string().min(1).max(255).required(),
    lobbyStatus: Joi.string().min(1).max(25).optional(),
    /*player2: Joi.object().keys({
        playerId: Joi.string().min(1).max(255).required(),
        playerName: Joi.string().min(1).max(255).required(),
        isReady: Joi.boolean().required() 
    }).required(), */
    lobbyPass: Joi.string().allow('').optional()
});

const playerSchema = Joi.object({
    playerName: Joi.string().min(1).max(255).required(),
    isReady: Joi.boolean().required()
})

module.exports = {
    itemSchema, 
    player2Schema,
    playerSchema
}
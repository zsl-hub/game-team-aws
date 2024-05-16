const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const dynamoDB = require("../database");

// DATA VALIDATION 
const itemSchema = Joi.object({
    lobbyName: Joi.string().min(1).max(255).required(),
    isPrivate: Joi.boolean().required(),
    lobbyPass: Joi.when('isPrivate', {
        is: true,
        then: Joi.string().min(4).max(255).required(),
        otherwise: Joi.string().allow('').optional()
    }),
    lobbyStatus: Joi.string().min(1).max(255).required(),
    player1: Joi.object().keys({
        playerId: Joi.string().min(1).max(255).required(),
        playerName: Joi.string().min(1).max(255).required(),
        isReady: Joi.boolean().required()
    }).required()
});

const player2Schema = Joi.object({
    lobbyName: Joi.string().min(1).max(255).required(),
    player2: Joi.object().keys({
        playerId: Joi.string().min(1).max(255).required(),
        playerName: Joi.string().min(1).max(255).required(),
        isReady: Joi.boolean().required() 
    }).required(),
    lobbyPassword: Joi.string().allow('').optional()
});

const playerSchema = Joi.object({
    playerName: Joi.string().min(1).max(255).required(),
    isReady: Joi.boolean().required()
})

// DATABASE OPERATIONS
const createLobby = async (data) => {
    const { error, value } = itemSchema.validate(data);

    if (error) {
        console.error("Validation error:", error.details[0].message);
        throw new Error("Validation error");
    }

    try {
        const item = {
            lobbyId: uuidv4(),
            lobbyName: value.lobbyName, 
            isPrivate: value.isPrivate,
            lobbyStatus: value.lobbyStatus,
            player1: value.player1
        };
        
        if (value.isPrivate) {
            item.lobbyPass = value.lobbyPass;
        }

        const params = {
            TableName: 'lobby',
            Item: item,
        };

        await dynamoDB.put(params).promise();

        return item;
    }
    catch (error) {
        console.error("Error creating item:", error);
        throw error;
    }
}

const getLobbyById = async (itemId) => {
    try {
        const params = {
            TableName: 'lobby',
            Key: {
                lobbyId: itemId,
            },
        };
        return await dynamoDB.get(params).promise();
    }
    catch (error) {
        console.error("Error getting item: ", error);
        throw error; 
    }
}

const getLobbyByName = async (itemName) => {
    try {
        const params = {
            TableName: 'lobby',
            FilterExpression: 'lobbyName = :name', 
            ExpressionAttributeValues: {
                ':name': itemName
            }
        };
        const result = await dynamoDB.scan(params).promise();
        if (result.Items.length > 0) {
            return result.Items[0];
        } else {
            return null;
        }
    }
    catch (error) {
        console.error("Error getting item: ", error);
        throw error; 
    }
}

const getAllLobbies = async () => {
    try {
        const params = {
            TableName: 'lobby'
        };
        return await dynamoDB.scan(params).promise();
    }
    catch (error) {
        console.error("Error getting all items: ", error);
        throw error; 
    }
}

const updateLobby = async (itemId, updateData) => {
    const { error, value } = itemSchema.validate(updateData);

    if (error) throw new Error(error.details[0].message);

    try {
        const existingItem = await getLobbyById(itemId);
        if (!existingItem) {
            throw new Error("Item not found");
        }

        let updateExpression = 'SET lobbyName = :lobbyName, isPrivate = :isPrivate, lobbyStatus = :lobbyStatus, player1 = :player1';
        const expressionAttributeValues = {
            ':lobbyName': value.lobbyName,
            ':isPrivate': value.isPrivate,
            ':lobbyStatus': value.lobbyStatus,
            ':player1': value.player1
        };

        if (!value.isPrivate) {
            updateExpression += ' REMOVE lobbyPass';
        }
        else {
            updateExpression += ', lobbyPass = :lobbyPass';
            expressionAttributeValues[':lobbyPass'] = value.lobbyPass;
        }

        const params = {
            TableName: 'lobby',
            Key: {
                lobbyId: itemId,
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues,
        };
        
        return await dynamoDB.update(params).promise();
    }
    catch (error) {
        console.error("Error updating item:", error);
        throw error;
    }
}

const addPlayer2 = async (itemId, updateData) => {
    const { error, value } = player2Schema.validate(updateData);

    if (error) throw new Error(error.details[0].message);

    try {
        const existingItem = await getLobbyById(itemId);
        if (!existingItem) {
            throw new Error("Item not found");
        }

        let updateExpression = 'SET';
        const expressionAttributeValues = {};

        if (value.player2) {
            updateExpression += ' player2 = :player2';
            expressionAttributeValues[':player2'] = value.player2;
        }

        updateExpression += ', lobbyStatus = :status';
        expressionAttributeValues[':status'] = 'playing';

        const params = {
            TableName: 'lobby',
            Key: {
                lobbyId: itemId,
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        };
        
        return await dynamoDB.update(params).promise();
    }
    catch (error) {
        console.error("Error updating item:", error);
        throw error;
    }
}

const deleteLobby = async (itemId) => {
    try {
        const params = {
            TableName: 'lobby',
            Key: {
              lobbyId: itemId,
            },
        };  
        return await dynamoDB.delete(params).promise();
    }
    catch (error) {
        console.error("Error deleting item:", error);
        throw error;
    }
};

const createPlayer = async (playerName, isReady) => {
    const data = { playerName, isReady };

    const { error, value } = playerSchema.validate(data);

    if (error) {
        console.error("Validation error:", error.details[0].message);
        throw new Error("Validation error");
    }

    try {
        const item = {
            playerId: uuidv4(),
            playerName: value.playerName, 
            isReady: value.isReady,
        };

        const params = {
            TableName: 'player',
            Item: item,
        };

        await dynamoDB.put(params).promise();

        return item;
    }
    catch (error) {
        console.error("Error creating item:", error);
        throw error;
    }
};

module.exports = {
    createLobby,
    getLobbyById,
    getLobbyByName,
    getAllLobbies,
    updateLobby,
    addPlayer2,
    deleteLobby,
    createPlayer
}
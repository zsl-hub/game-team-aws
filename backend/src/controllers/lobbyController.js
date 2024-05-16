const express = require("express");
const dynamoDB = require("../database");
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const router = express.Router();

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

const createItem = async (data) => {
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

const getItem = async (itemId) => {
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

const getItemByName = async (itemName) => {
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

const getAllItems = async () => {
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

const updateItem = async (itemId, updateData) => {
    const { error, value } = itemSchema.validate(updateData);

    if (error) throw new Error(error.details[0].message);

    try {
        const existingItem = await getItem(itemId);
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

const updatePlayer2 = async (itemId, updateData) => {
    const { error, value } = player2Schema.validate(updateData);

    if (error) throw new Error(error.details[0].message);

    try {
        const existingItem = await getItem(itemId);
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

const deleteItem = async (itemId) => {
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

router.get("/", async (req, res) => {
    try {
        const allLobbies = await getAllItems();
        res.json(allLobbies)
    }
    catch (error) {
        console.error("Error while getting all lobbies:", error);
        res.status(500).json({ error: "An error occurred while getting all lobbies" }); 
    }
});

router.post("/joinLobby", async (req, res) => {
    try {
        const getLobby = await getItemByName(req.body.lobbyName);
        if (getLobby.lobbyStatus === "waiting") {
            if (!getLobby.Pass || req.body.lobbyPassword === getLobby.lobbyPass) {
                const player = await createPlayer(req.body.player2, false);
                req.body.player2 = player;
                updatePlayer2(getLobby.lobbyId, req.body);
                res.status(200).json({ success: true, message: "Joined lobby successfully", lobbyId: getLobby.lobbyId, player2: req.body.player2.playerId });
            } else {
                res.status(401).json({ success: false, message: "Incorrect lobby password" });
            }
        } else {
            res.status(403).json({ success: false, message: "Lobby is full" }); 
        }
        
    } catch (error) {
        console.error("Error while getting lobby:", error);
        res.status(500).json({ success: false, message: "An error occurred while getting lobby" });
    }
});

router.post("/createLobby", async (req, res) => {
    try {
        const player = await createPlayer(req.body.player1, false);
        req.body.player1 = player;
        const newLobby = await createItem(req.body);
        res.status(201).json(newLobby); 
    } catch (error) {
        console.error("Error while creating lobby:", error);
        res.status(500).json({ error: "An error occurred while creating the lobby" }); 
    }
});

router.get("/lobbyList", async (req, res) => {
    try {
        const lobbyList = await getAllItems();
        res.json(lobbyList);
    }
    catch (error) {
        console.error("Error while getting all lobbies:", error);
        res.status(500).json({ error: "An error occurred while joining the lobby" });
    }
});

module.exports = router;
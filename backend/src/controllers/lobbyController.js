const express = require("express");
const dynamoDB = require("../database");
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const router = express.Router();

// DATA VALIDATION 
const itemSchema = Joi.object({
    lobbyName: Joi.string().min(1).max(255).required(),
    isPrivate: Joi.boolean().required(),
    lobbyPass: Joi.string().min(4).max(255).optional()
});


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
            isPrivate: value.isPrivate
        };
        
        if (value.isPrivate) {
            item.lobbyPass = value.lobbyPass;
        }

        const params = {
            TableName: 'lobby',
            Item: item,
        };

        return await dynamoDB.put(params).promise();
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

const updateItem = async (itemId, updateData) => {
    const { error, value } = itemSchema.validate(updateData);

    if (error) throw new Error(error.details[0].message);

    try {
        const existingItem = await getItem(itemId);
        if (!existingItem) {
            throw new Error("Item not found");
        }

        let updateExpression = 'SET isPrivate = :isPrivate, lobbyName = :lobbyName';
        const expressionAttributeValues = {
            ':isPrivate': value.isPrivate,
            ':lobbyName': value.lobbyName
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

router.post("/createLobby", async (req, res) => {
    try {
        const newItem = await createItem(req.body);
        res.status(201).json(newItem); 
    } catch (error) {
        console.error("Error while creating lobby:", error);
        res.status(500).json({ error: "An error occurred while creating the lobby" }); 
    }
});

module.exports = router;
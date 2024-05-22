const dynamoDB = require("../database");

const getLobby = async (itemId) => {
    try {

        console.log(itemId);

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
};

const getPlayer = async (itemId) => {
    try {
        const params = {
            TableName: 'player',
            Key: {
                playerId: itemId,
            },
        };
        return await dynamoDB.get(params).promise();
    }
    catch (error) {
        console.error("Error getting item: ", error);
        throw error; 
    }
};

const updatePlayer = async (lobbyId, updateData) => {
    try {
        const lobby = await getLobby(lobbyId);
        if (!lobby) {
            throw new Error("Item not found");
        }

        console.log(lobby);

        let player = lobby.Item.player1;

        for(var key in updateData)
        {
            player[key] = updateData[key];
        }

        let updateExpression = "SET player1 = :player1,";
        const expressionAttributeValues = {};
        expressionAttributeValues[':player1'] = player;

        const params = {
            TableName: 'lobby',
            Key: {
                lobbyId: lobbyId,
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        };
        
        await dynamoDB.update(params).promise();
    }
    catch (error) {
        console.error("Error updating item:", error);
        throw error;
    }
};

module.exports = {
    getLobby,
    getPlayer,
    updatePlayer
};
const dynamoDB = require("../database");

// DATABASE OPERATIONS
const createItem = async (table, data) => {
    try {
        const item = {};
        for (let key in data) {
            item[key] = data[key]
        }

        const params = {
            TableName: table, 
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

const getItemById = async (table, itemKey) => {
    try {
        const params = {
            TableName: table,
            Key: itemKey
        };
        return await dynamoDB.get(params).promise();
    }
    catch (error) {
        console.error("Error getting item: ", error);
        throw error; 
    }
}

const getItemByProperty = async (table, itemKey) => {
    try {
        const params = {
            TableName: table,
            FilterExpression: `${Object.keys(itemKey)[0]} = :name`,
            ExpressionAttributeValues: {
                ':name': Object.values(itemKey)[0]
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

const getAllItems = async (table) => { 
    try {
        const params = {
            TableName: table
        };
        return await dynamoDB.scan(params).promise();
    }
    catch (error) {
        console.error("Error getting all items: ", error);
        throw error; 
    }
}

const updateItem = async (table, itemKey, updateData) => {
    try {
        const existingItem = await getItemById(table, itemKey);
        if (!existingItem) {
            throw new Error("Item not found");
        }

        let updateExpression = 'SET';
        const expressionAttributeValues = {};

        for (let key in updateData){
            updateExpression += ` ${key} = :${key},`;
            expressionAttributeValues[`:${key}`] = updateData[key];
        }

        const params = {
            TableName: table,
            Key: itemKey,
            UpdateExpression: updateExpression.substring(0, updateExpression.length-1),
            ExpressionAttributeValues: expressionAttributeValues,
        };
        
        return await dynamoDB.update(params).promise();
    }
    catch (error) {
        console.error("Error updating item:", error);
        throw error;
    }
}

const deleteLobby = async (table, itemId) => {
    try {
        const params = {
            TableName: table,
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

module.exports = {
    createItem,
    getItemById,
    getItemByProperty,
    getAllItems,
    updateItem,
    deleteLobby
}
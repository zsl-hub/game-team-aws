const { getItemById, updateItem } = require("../repositories/lobbyRepository");
const { v4:  uuidv4 } = require("uuid");

class FieldUtil{
    static generateFields(dimentionLength) 
    {
        console.log(`Generate Fields: ${dimentionLength}`);
        let fields = [];

        for(let x = 0; x < dimentionLength; x++)
        {
            let row = [];
            for(let y = 0; y < dimentionLength; y++)
            {
                const fieldId = uuidv4();
    
                let field = {
                    fieldId: fieldId,
                    x,
                    y,
                    wasShoot: false,
                }
    
                row.push(field);
            }

            fields.push(row);
        }

        return fields;
    }
}

module.exports = FieldUtil;
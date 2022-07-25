async function validateDataTypeString(input, fieldInputError){
    if (typeof(input) !== "string") {
        return fieldInputError.push(input)
    } else {
        return null
    }
}

async function validateDataTypeNumber(input, fieldInputError){
    if (typeof(input) !== "number") {
        return fieldInputError.push(input)
    } else {
        return null
    }
}

async function validateDataTypeObject(input, fieldInputError){
    if (typeof(input)!== 'object') {
        return fieldInputError.push(input)
    }else {
        return null
    }
}

module.exports = {
    validateDataTypeString,
    validateDataTypeNumber,
    validateDataTypeObject
}
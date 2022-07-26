function validateDataTypeString(input, fieldInputError, key){
    if (typeof(input) !== "string" || !input) {
        return fieldInputError.push(key)
    } else {
        return null
    }
}

function validateDataTypeNumber(input, fieldInputError, key){
    if (typeof(input) !== "number") {
        return fieldInputError.push(key)
    } else {
        return null
    }
}

function validateDataTypeObject(input, fieldInputError, key, fieldOne, fieldTwo){
    if (typeof(input)!== 'object' || Object.keys(input) === [fieldOne,fieldTwo]) {
        console.log(input)
        return fieldInputError.push(key)
    }else {
        return null
    }
}

module.exports = {
    validateDataTypeString,
    validateDataTypeNumber,
    validateDataTypeObject
}
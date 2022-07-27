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
        return fieldInputError.push(key)
    }else {
        return null
    }
}

function validateEmail(input, fieldInputError, key){
    let emailRegex = new RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
    if (!input.match(emailRegex)) {
        errorMsg.push('email')
    }
}

function validateUrl(input, fieldInputError, key){
    let urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi)
      if (!input.match(urlRegex)) {
            return fieldInputError.push(key)
        }else{
            return null
        }
}

        

module.exports = {
    validateDataTypeString,
    validateDataTypeNumber,
    validateDataTypeObject,
    validateEmail,
    validateUrl
}
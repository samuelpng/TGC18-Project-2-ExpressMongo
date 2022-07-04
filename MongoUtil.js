// require('mongodb') will return a Mongo object
// the Mongo client contains many other objects (aka properties)
// but we are only interested in the MongoClient
// hence put `.MongoClient` at the back of the require
const MongoClient = require('mongodb').MongoClient;

async function connect(mongoUri, dbName) {
    const client = await MongoClient.connect(mongoUri, {
        "useUnifiedTopology": true // there were different versions of Mongo
                                  // when this is true we don't have to care about those versions
    })

    const db = client.db(dbName);
    return db;
}

// export out `connect` so that other JavaScript file
module.exports = {
    connect
}
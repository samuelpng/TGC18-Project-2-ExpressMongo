const express = require("express");
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const MongoUtil = require("./MongoUtil");

const mongoUri = process.env.MONGO_URI;

let app = express();

//Enable processing JSON data
app.use(express.json());

//Enable CORS
app.use(cors());

//SETUP END
async function main() {

  let db = await MongoUtil.connect(mongoUri, "bird_watching");
  app.get('/', function(req,res){
    res.send('hello world')
  })

  app.post('/bird_sightings', async function(req,res){
    let birdSize = req.body.birdSize;
    let birdFamily = req.body.birdFamily;
    let birdSpecies = req.body.birdSpecies
    let birdColours = req.body.birdColours.slice(',');
    let dateSpotted = req.body.dateSpotted ? new Date(req.body.dateSpotted): new Date();
    let neighbourhoodSpotted = req.body.neighbourhoodSpotted
    let lattitude = req.body.locationSpotted.lattitude;
    let longitude = req.body.locationSpotted.longitude;
    let imageUrl = req.body.imageUrl;
    let eatingHabits = req.body.eatingHabitsAndBehaviour.eatingHabits.slice(',');
    let behaviour = req.body.eatingHabitsAndBehaviour.behaviour.slice(',');
    let description = req.body.description;
    let result = await db.collection('sightings').insertOne({
        birdSize,
        birdFamily,
        birdSpecies,
        birdColours,
        dateSpotted,
        neighbourhoodSpotted,
        lattitude,
        longitude,
        imageUrl,
        eatingHabits,
        behaviour,
        description
    })
    res.status(201);
    res.send(result);
  })
  
  app.get('/bird_sightings/:id', async function(req,res){
    res.json(await db.collection('sightings').findOne({
      '_id': ObjectId(req.params.id)
    }))
  })

  


}
main();

//START SERVER
app.listen(3000, () => {
    console.log("Server has started")
})
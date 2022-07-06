const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { ObjectId } = require("mongodb");
const MongoUtil = require("./MongoUtil");

const MONGO_URI = process.env.MONGO_URI;

let app = express();

//Enable processing JSON data
app.use(express.json());

//Enable CORS
app.use(cors());

//SETUP END

async function main() {

  let db = await MongoUtil.connect(MONGO_URI, "bird_watching");
  app.get('/', function (req, res) {
    res.send('hello world')
  })

  app.post('/bird_sightings', async function (req, res) {
    let birdSize = req.body.birdSize;
    let birdFamily = req.body.birdFamily;
    let birdSpecies = req.body.birdSpecies;
    let birdColours = req.body.birdColours;
    let dateSpotted = req.body.dateSpotted ? new Date(req.body.dateSpotted) : new Date();
    let neighbourhoodSpotted = req.body.neighbourhoodSpotted
    let locationSpotted = req.body.locationSpotted;
    let imageUrl = req.body.imageUrl;
    let character = req.body.character
    let description = req.body.description;
    let results = await db.collection('sightings').insertOne({
      birdSize,
      birdFamily,
      birdSpecies,
      birdColours,
      dateSpotted,
      neighbourhoodSpotted,
      locationSpotted,
      imageUrl,
      character,
      description
    })

    if (typeof(birdSize) !== 'number' || (birdSize<1 || birdSize >5) ){
      res.status(406).send('birdSize error')
    }else if (typeof(birdFamily) !== "string"){
      res.status(406).send('birdFamily error')
    }else if (typeof(birdSpecies) !== "string"){
      res.status(406).send('birdSpecies error')
    }else if (typeof(birdColours) !== "object"){
      res.status(406).send('birdColours error')
    }else if (typeof(neighbourhoodSpotted) !== "string"){
      res.status(406).send('neighbourhoodSpotted error')
    }else if (typeof(locationSpotted) !== "object"){
      res.status(406).send('locationSpotted error')
    }else{
      res.status(200);
      res.send(results);
    }  
  })

  app.get('/bird_sightings/:id', async function (req, res) {
    res.json(await db.collection('sightings').findOne({
      '_id': ObjectId(req.params.id)
    }))
  })

  app.get('/bird_sightings', async function(req,res) {

    let criteria = {};

    if(req.query.birdFamily) {
      criteria['birdFamily'] = {
        '$regex' : req.query.birdFamily, '$options':'i'
      }
    }

    if (req.query.birdColours) {
      criteria['birdColours'] = {
        '$in' : [req.query.birdColours]
      }
    }

    if (req.query.birdSize) {
      criteria['birdSize'] = {
        '$eq' : [req.query.birdSize]
      }
    }

    if (req.query.neighbourhoodSpotted) {
      criteria['neighbourhoodSpotted'] = {
        '$in' : [req.query.neighbourhoodSpotted]
      }
    }

    // if (req.query.sortBySize) {
    //   criteria['neighbourhoodSpotted'] = {
    //     '$sort' : [req.query.birdSize]
    //   }
    // }

    
    let results = await db.collection('sightings').find(criteria)
    res.status(200)
    res.send(await results.toArray());
  })


  app.put('/bird_sightings/:id', async function (req, res) {
    let birdSize = req.body.birdSize;
    let birdFamily = req.body.birdFamily;
    let birdSpecies = req.body.birdSpecies
    let birdColours = req.body.birdColours;
    let dateSpotted = req.body.dateSpotted ? new Date(req.body.dateSpotted) : new Date();
    let neighbourhoodSpotted = req.body.neighbourhoodSpotted
    let lattitude = req.body.locationSpotted.lattitude;
    let longitude = req.body.locationSpotted.longitude;
    let imageUrl = req.body.imageUrl;
    let eatingHabits = req.body.eatingHabitsAndBehaviour.eatingHabits;
    let behaviour = req.body.eatingHabitsAndBehaviour.behaviour;
    let description = req.body.description;
    let results = await db.collection('sightings').updateOne({
      '_id': ObjectId(req.params.id)
    }, {
      '$set': {
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
      }
    })
    res.status(200);
    res.json(results)
  })

  app.delete('/bird_sightings/:id', async function (req, res) {
    let result = await db.collection('sightings').deleteOne({
      '_id': ObjectId(req.params.id)
    })
    console.log(req.params.id, result)
    res.status(200);
    res.json({
      'staus': 'ok'
    })
  })


}
main();

//START SERVER
app.listen(3000, () => {
  console.log("Server has started")
})
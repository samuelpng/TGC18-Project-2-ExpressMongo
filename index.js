const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { ObjectId } = require("mongodb");
const MongoUtil = require("./MongoUtil");
const validation = require("./validation");

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

  
  app.post('/bird_sightings/comments/:id', async function(req,res){
    let commentId = new ObjectId();
    let displayName = req.body.displayName;
    let datePosted = new Date();
    let commentDescription = req.body.commentDescription;
    let result = await db.collection('sightings').updateOne({
      _id: ObjectId(req.params.id)
    },{
      $push: {
        comments: {commentId, displayName, datePosted, commentDescription}
      }
    })
    res.status(200).json(result)

    // if (typeof(commentDescription) !== "string"){
    //   res.status(406).send('description error')
    // }else {
    //   res.status(200);
    //   res.send(result.id);
    //   // res.send(result.id)
    // }

  })

  app.post('/bird_sightings', async function (req, res) {
    let birdSize = req.body.birdSize;
    let birdFamily = req.body.birdFamily;
    let birdSpecies = req.body.birdSpecies;
    let birdColours = req.body.birdColours;
    let dateSpotted = req.body.dateSpotted;
    let neighbourhoodSpotted = req.body.neighbourhoodSpotted
    let locationSpotted = req.body.locationSpotted;
    let imageUrl = req.body.imageUrl;
    let character = req.body.character;
    let description= req.body.description;
    let datePosted = new Date();
    let displayName = req.body.displayName;
    let email = req.body.email;
    

    console.log(locationSpotted)

    let fieldInputError = []

    validation.validateDataTypeNumber(birdSize, fieldInputError,'birdSize');
    validation.validateDataTypeString(birdFamily, fieldInputError, 'birdFamily');
    validation.validateDataTypeString(birdSpecies, fieldInputError, 'birdSpecies');
    validation.validateDataTypeObject(birdColours, fieldInputError, 'birdColours');
    validation.validateDataTypeString(dateSpotted, fieldInputError, 'dateSpotted');
    validation.validateDataTypeString(neighbourhoodSpotted, fieldInputError, 'neightbourhoodSpotted');
    validation.validateDataTypeObject(locationSpotted, fieldInputError, 'locationSpotted', 'lat', 'lng');
    validation.validateDataTypeString(imageUrl, fieldInputError, 'imageUrl');
    validation.validateDataTypeString(description, fieldInputError, 'description');
    validation.validateDataTypeString(displayName, fieldInputError, 'displayName');
    validation.validateDataTypeString(email, fieldInputError, 'email');
    
    console.log(fieldInputError)

    if (fieldInputError.length !== 0){
      res.status(406).json({validationErrors : fieldInputError})
    } else {
      let result = await db.collection('sightings').insertOne({
        birdSize,
        birdFamily,
        birdSpecies,
        birdColours,
        dateSpotted,
        neighbourhoodSpotted,
        locationSpotted,
        imageUrl,
        character,
        description,
        datePosted,
        displayName,
        email
      })

      res.status(200);
      res.send(result);
    }


    // if (typeof(birdSize) !== 'number' || (birdSize<1 || birdSize >7) ){
    //   res.status(406).send('birdSize error')
    // }else if (typeof(birdFamily) !== "string"){
    //   res.status(406).send('birdFamily error')
    // }else if (typeof(birdSpecies) !== "string"){
    //   res.status(406).send('birdSpecies error')
    // }else if (typeof(birdColours) !== "object"){
    //   res.status(406).send('birdColours error')
    // }else if (typeof(neighbourhoodSpotted) !== "string"){
    //   res.status(406).send('neighbourhoodSpotted error')
    // }else if (typeof(locationSpotted) !== "object"){
    //   res.status(406).send('locationSpotted error')
    // }else{
    //   res.status(200);
    //   res.send(result);
    // }  
  })

  app.get('/bird_sightings/:id', async function (req, res) {
    res.json(await db.collection('sightings').findOne({
      '_id': ObjectId(req.params.id)
    }))
  })

  

  //search and filtering 
  app.get('/bird_sightings', async function(req,res) {

    let criteria = {};
    let projection = {
      projection:{
          "email": 0
      }
    }

    let sortBy = {};

    if (req.query.sort) {
      if (req.query.sort === "latest") {
        sortBy = {
          'datePosted': -1
        } 
      } else if (req.query.sort === "alphabetically") {
        sortBy = {
          'birdSpecies': 1
        }
      } else if (req.query.sort === "birdFamily") {
        sortBy = {
          'birdFamily': 1
        }
      }
    }

    //search
    if (req.query.searchQuery){
      criteria['$or'] = [
        {
          'birdFamily' : {
            '$regex': `${req.query.searchQuery}`,
            '$options': 'i'
          }
        },
        {
          'birdSpecies': {
            '$regex': `${req.query.searchQuery}`,
            '$options': 'i'
          }
        },
        {
          'birdColours': {
            '$regex': `${req.query.searchQuery}`,
            '$options': 'i'
          }
        },
        {
          'neighbourhoodSpotted': {
            '$regex': `${req.query.searchQuery}`,
            '$options': 'i'
          }
        },
        {
          'displayName': {
            '$regex': `${req.query.searchQuery}`,
            '$options': 'i'
          }
        }
      ]
    }

    //birdFamily
    // if(req.query.birdFamily) {
    //   criteria['birdFamily'] = {
    //     '$regex' : req.query.birdFamily, '$options':'i'
    //   }
    // }

    //query on bird colours
    if (req.query.birdColours) {

    if (req.query.birdColours.length === 1) {
      criteria['birdColours'] = {
        '$in' : req.query.birdColours
      }
    } else {
      criteria['$and'] = req.query.birdColours.map(colour => { return {"birdColours": {"$in" : [colour] } }});    
      // url eg.: ?birdColours[]=red&birdColours[]=Brown
    }
      // criteria['birdColours'] = {
      //   '$in' : [...req.query.birdColours]
      // }
    }

    //query on bird size
    // if (req.query.birdSize) {
    //   criteria['birdSize'] = {
    //     '$eq' : parseInt(req.query.birdSize)
    //   }
    // }

    // if (req.query.birdSize) {
    //   criteria['birdSize'] = {
    //     '$eq' : parseInt(req.query.birdSize)
    //   }
    // }

    if (req.query.birdSize) {
      criteria['$or'] = req.query.birdSize.map(size => { return {"birdSize": {"$in" : [parseInt(size)] } }})
    }


    //query on neighbourhood
    if (req.query.neighbourhoodSpotted) {
      criteria['neighbourhoodSpotted'] = {
        '$in' : [req.query.neighbourhoodSpotted]
      }
    }

    //query on bird family
    if (req.query.birdFamily) {
      criteria['birdFamily'] = {
        '$in' : [req.query.birdFamily]
      }
    }

    //sort
    if (req.query.sortBySize) {
      criteria['birdSize'] = {
        '$sort' : [req.query.birdSize]
      }
    }

    if (req.query.sortByDate) {
      criteria['dateSpotted'] = {
        '$sort' : req.query.dateSpotted
      }
    }

    if (req.query.email) {
      criteria ['email'] = {
        '$in' : [req.query.email]
      }
    }

    // if (req.query.limit) {
    //  criteria
    // }

    

    
    let results = await db.collection('sightings').find(criteria, projection).sort(sortBy).toArray()
    res.status(200)
    console.log(criteria)
    res.json(results);
  })

  // app.get('/bird_sightings/profile', async function(req,res) {

  //   let criteria = {};
  //   let projection = {
  //     projection:{
  //         "email": 0
  //     }
  //   }

  //   if (req.query.email) {
  //     criteria['email'] = {
  //       '$eq' : [req.query.birdFamily]
  //     }
  //   }

  //   let results = await db.collection('sightings').find(criteria, projection).toArray()
  //   res.status(200)
  //   console.log(criteria)
  //   res.json(results);
  // })


  app.put('/bird_sightings/:id', async function (req, res) {
    let birdSize = req.body.birdSize;
    let birdFamily = req.body.birdFamily;
    let birdSpecies = req.body.birdSpecies
    let birdColours = req.body.birdColours;
    let dateSpotted = req.body.dateSpotted;
    let neighbourhoodSpotted = req.body.neighbourhoodSpotted
    let locationSpotted = req.body.locationSpotted;
    let imageUrl = req.body.imageUrl;
    let character = req.body.character;
    let description = req.body.description;
    let displayName = req.body.displayName;
    let email = req.body.email;
    
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
        locationSpotted,
        imageUrl,
        character,
        description,
        displayName,
        email
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
// app.listen(8000, () => {
//   console.log("Server has started")
// })
app.listen(process.env.PORT, () => {
  console.log("Server has started")
})
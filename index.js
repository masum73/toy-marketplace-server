const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wbbftwk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toyCollection = client.db('toyTime').collection('toys');


    // all toys get in home
    app.get('/alltoys', async (req, res) => {
      const query = req.query.q
      console.log(query);
      if(query){
        const cursor = toyCollection.find({name: new RegExp(`${query}`)})
        const result = await cursor.toArray();
         return res.send(result)
      }
      const limit = req.query.limit;
      if(limit){
        const cursor = toyCollection.find().limit(20);
        const result = await cursor.toArray();
        return res.send(result)
      }
      const cursor = toyCollection.find();
      const result = await cursor.toArray();
      //console.log(result);
      res.send(result)
    })

    // as a user posting a single toy - add a toy 
    app.post('/alltoys', async (req, res) => {
      const toy = req.body;
      console.log(toy);

      const result = await toyCollection.insertOne(toy);
      res.send(result);
    })


    // my toys - deleting a single toy 
    app.delete('/mytoys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query)
      res.send(result);
    })

    // my toys - email query - all toys get
    app.get('/mytoys', async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { 'seller.email': req.query.email }
      }
      console.log(query);
      const result = await toyCollection.find(query).toArray();
      res.send(result)
    })

    // my toys - single toy details - get
    app.get('/mytoys/toy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }

      const result = await toyCollection.findOne(query);
      res.send(result)
    })
    // my toys - single toy details - update
    app.patch('/mytoys/toy/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updateToy = req.body;

      const result = await toyCollection.updateOne(filter, { $set: updateToy })
      res.send(result)
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('toy is selling')
})

app.listen(port, () => {
  console.log(`Toy Time Server is running on port ${port}`)
})
const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const port=process.env.PORT||5000


// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hxa3e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
  try {
    await client.connect();
    const database = client.db('clockShop');
    const productsCollection = database.collection('products');
    const usersCollection = database.collection('users');
    const orderCollection = database.collection('orderProducts')
    const ratingCollection = database.collection('rating')

    // GET API
    app.get('/products', async(req,res)=>{  
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });

    // GET SINGEL PRODUCT
    app.get('/products/:id', async (req, res) => { 
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.json(product);
  });


  //ORDER GET API
  app.get('/orderProducts', async(req, res)=>{
    const email = req.query.email;
    const query = {email: email};
    const cursor = orderCollection.find(query);
    const orderProducts = await cursor.toArray();
    res.json(orderProducts);
  })
    // ORDER POST API
    app.post('/orderProducts', async(req, res) =>{
      const orderProduct = req.body;
      const result = await orderCollection.insertOne(orderProduct);
      res.json(result);
    })


    //ORDER DELETE API
    app.delete('/orderProducts/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id:ObjectId(id)};
      const result = await orderCollection.deleteOne(query);
      res.json(result);
  })

    //POST API
    app.post('/products', async(req, res) =>{
      const newProducts = req.body;
      const result = await productsCollection.insertOne(newProducts);
      res.json(result);
    });


    // DELETE API
    app.delete('/products/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id:ObjectId(id)};
      const result = await productsCollection.deleteOne(query);
      res.json(result);
  })

   //RATING GET API
   app.get('/rating', async(req,res)=>{  
    const cursor = ratingCollection.find({});
    const rating = await cursor.toArray();
    res.send(rating);
  });

  //RATING POST API
  app.post('/rating', async(req, res) =>{
    const newRatings = req.body;
    const result = await ratingCollection.insertOne(newRatings);
    res.json(result);
  });

  app.get('/users/:email', async (req, res)=>{
    const email = req.params.email;
    const query = {email: email};
    const user = await usersCollection.findOne(query);
    let isAdmin = false;
    if(user?.role === 'admin'){
      isAdmin = true;
    }
    res.json({admin: isAdmin});
  })

  // Firebase to database save data post api
  app.post('/users', async (req, res)=>{
    const newUser = req.body;
    const result = await usersCollection.insertOne(newUser);
    res.json(result);
  });

  // Make Admin
  app.put('/users/admin', async(req, res) =>{
    const user = req.body;
        const filter = {email: user.email};
        const updateDoc = {$set: {role: 'admin'}};
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result);
  })

  // // Users register update api
  // app.put('/users', async (req, res) =>{
  //   const user = req.body;
  //   const filter = {email: user.email};
  //   const option = { upsert: ture };
  //   const updateDoc = {$set: user};
  //   const result = await usersCollection.updateOne(filter,updateDoc, option);
  //   res.json(result);
  //   })

 } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);















app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
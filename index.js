const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { response } = require("express");
const jwt = require('jsonwebtoken');
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

//middleware
app.use(cors());
app.use(express.json());

//verify token
  function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
      return res.status(401).send({message: 'unauthorized access'});
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) =>{
      if(err){
        return res.status(403).send({message: 'Forbidden access'});
      }
      console.log('decoded', decoded);
      req.decoded = decoded;
      next();
    } )
    
   }

   // test url link 


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jgbqt.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//  try finally function

async function run() {
  try {
    await client.connect();
    const productCollection = client.db("laptop").collection("products");

   // user login Jwt post api 
   app.post('/login', async (req, res)=>{
    const email = req.body;
    const accessToken = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
    res.send({accessToken})
  })

   // item api
    app.get("/product", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const items = await cursor.toArray();
      res.send(items);
    });

    app.get('/product/:id',async(req, res)=>{
        const id = req.params.id;
        const query={_id: new ObjectId(id)};
        const item = await productCollection.findOne(query);
        res.send(item);
    })

    //get api add
     app.get('/myItems',verifyJWT, async (req, res)=>{
       const decodedEmail = req.decoded.email;
       const email = req.query.email;
       if(email === decodedEmail){
        const query = {email};
        const cursor = productCollection.find(query);
        const myItems = await cursor.toArray();
        res.send(myItems);
       }
       else{
         res.status(403).send({message: 'forbidden access'});
       }
     })

    //post api
    app.post('/product', async(req, res)=>{
      const newItem = req.body;
      const tokenInfo = req.headers.authorization;
      console.log(tokenInfo)
      const result = await productCollection.insertOne(newItem);
      res.send(result);
    });


    //Delete Api
    app.delete('/product/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await productCollection.deleteOne(query);
      res.send(result);
    })

    //Delete product items api
    app.delete('/myItems/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await productCollection.deleteOne(query);
      res.send(result);
    })


    // Update quantity api code
    app.put('/quantity/:id', async (req, res) =>{
      const id = req.params.id;
      const data = req.body;
      const filter = {_id: new ObjectId(id)}
      const options = { upsert: true};
      const updateDoc = {
        $set: {
          quantity : data.quantity
        }
      };
      const result = await productCollection.updateOne(filter,updateDoc,options)
      res.send(result);
    })

  } finally {

  }
}
 /*  prot running */

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("<h1 style='color:red; margin:20% auto; text-align:center'>My Laptop WareHouse Management Server Running</h1>");
});

app.listen(port, () => {
  console.log("server site running Laptop warehouse", port);
});
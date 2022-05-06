const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000;

// middleware

app.use(cors())
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jgbqt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('laptop').collection('products')
        const userEmailCollection = client.db("User").collection("email");
        //get
        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query)
            const products = await cursor.toArray()
            res.send(products)
        
        });
        //get
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const product = await productCollection.findOne(query)
            res.send(product)
        });

        //post
        app.post('/product', async (req, res) => {
            const newProduct = req.body
            const result = await productCollection.insertOne(newProduct)
            res.send(result)
        });
      
        //Delete
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productCollection.deleteOne(query)
            res.send(result); 
        })
        
     // user email add Post  
    
         app.post('/user', async (req, res) => {
            const userEmail = req.body
            const result = await userEmailCollection.insertOne(userEmail)
            res.send(result)
         });
        
        //get
         app.get('/user', async (req, res) => {
            const query = {};
            const cursor = userEmailCollection.find(query)
            const products = await cursor.toArray()
            res.send(products)
        
        });

     //delete
        app.delete('/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await userEmailCollection.deleteOne(query)
            res.send(result)
        })


       //quantity update api
     app.put('/quantity/:id' , async(req,res)=>{
      const id = req.params.id;
      const data = req.body;
      const filter = {_id: ObjectId(id)}
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          quantity : data.quantity 
        }
      };
      const result = await productCollection.updateOne(filter ,updatedDoc , options)
      res.send(result)

      
     })

         

    }
    finally {
        
}
    
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Running server site shipon form bangladesh')
});

app.listen(port, () => {
    console.log('server site running assignment-11', port );
})
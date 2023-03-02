const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();


app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Duber server running')
})



const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@cluster0.r7d25w3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const Duber = async () => {
    try {
        const TransportsData = client.db('duber').collection('transports');
        const UsersData = client.db('duber').collection('users');
        const transportCollection = client.db("duber").collection("transportDetails")
        const reviewCollection = client.db("duber").collection("allReview")

        app.post("/add-transport", async (req, res) => {
            const query = req.body;
            const result = await transportCollection.insertOne(query)
            res.send(result)
        })

        app.get("/all-transports", async (req, res) => {
            const query = {}
            const result = await transportCollection.find(query).toArray()
            res.send(result)
        })

        app.post("/add-review", async (req, res) => {
            const query = req.body;
            const result = await reviewCollection.insertOne(query)
            res.send(result)
        })

    }
    finally { }
}
Duber().catch(error => console.log(error));


app.listen(port, () => {
    console.log('server running', port);
})
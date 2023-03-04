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

        app.post('/addtransport', async (req, res) => {
            const transport = req.body
            const result = await TransportsData.insertOne(transport)
            res.send(result)
        });
        // add transport api 

        app.get('/alltransport', async (req, res) => {
            const location = req.query.location;
            const deis = req.query.destination;

            if (location) {
                const alltransport = await TransportsData.find({}).toArray();
                const filterData = alltransport.filter(tra =>
                    tra.from.toLowerCase().includes(location.toLowerCase()))
                return res.send(filterData)
            }

            if (deis) {
                const alltransport = await TransportsData.find({}).toArray();
                const filterData = alltransport.filter(tra => tra.destination.toLowerCase().includes(deis.toLowerCase()))
                return res.send(filterData)
            }


            const alltransport = await TransportsData.find({}).toArray();
            res.send(alltransport);
        });
        // get all product from DB

        app.post('/adduser', async (req, res) => {
            const user = req.body;
            const added = await UsersData.insertOne(user);
            res.send(added);
        });
        // added user to DB 

    }
    finally { }
}
Duber().catch(error => console.log(error));


app.listen(port, () => {
    console.log('server running', port);
})
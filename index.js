const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();

const stripe = require("stripe")(process.env.STRIPE_KEY);

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
        const bookingsCollection = client.db('ride').collection('bookings')
        const paymentsCollection = client.db('duber').collection('payments');

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

        app.put('/alltransport/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    approve: true
                }
            }
            const result = await TransportsData.updateOne(filter, updatedDoc, options);
            res.send(result);
            console.log(result);
        });
        //approve product

        app.post('/adduser', async (req, res) => {
            const user = req.body;
            const added = await UsersData.insertOne(user);
            res.send(added);
            console.log(added);
        });
        // added user to DB

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const query = {}
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        });
        //added ride to db

        app.get('/bookings/:email', async (req, res) => {
            const email = req.params.email
            const query = { email }
            const result = await bookingsCollection.find(query).toArray()
            res.send(result);
        });
        //get ride from db

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await bookingsCollection.deleteOne(filter);
            res.send(result);
        })


        app.get('/adduser', async (req, res) => {
            const quary = {}
            const result = await UsersData.find(quary).toArray();
            res.send(result);
        })
        // get user from DB 

        app.get('/passenger', async (req, res) => {
            const query = { role: "passenger" }
            const role = await UsersData.find(query).toArray()
            res.send(role)
        })
        //get passenger from db

        app.get('/company', async (req, res) => {
            const query = { role: "company" }
            const role = await UsersData.find(query).toArray()
            res.send(role)
        })
        //get company from db



        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const price = booking.cost;
            const amount = price * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ]
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment);
            const id = payment.bookingId
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedResult = await bookingsCollection.updateOne(filter, updatedDoc)
            res.send(result);
            console.log(result);
            console.log(updatedResult);
        })

        //payment

    }
    finally { }
}
Duber().catch(error => console.log(error));


app.listen(port, () => {
    console.log('server running', port);
})
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.z8kj7tg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    // const categoriesOptionCollection = client.db("laptopResailMarket").collection("categoriesOption");
    const productsCollection = client.db("laptopResailMarket").collection("productsCollection");

    const bookingCollection = client.db("laptopResailMarket").collection("bookings");
    // app.get("/categories", async (req, res) => {
    //   const query = {};
    //   const options = await categoriesOptionCollection.find(query).toArray();
    //   res.send(options);
    // });

    // Booking api
    app.get("/bookings", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const bookings = await bookingCollection.find(query).toArray();
      res.send(bookings);
    });

    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    //products api
    app.get("/products", async (req, res) => {
      console.log(req.query);
      let query = {};
      if (req.query.category_name) {
        query = {
          category_name: req.query.category_name,
        };
      }

      const options = await productsCollection.find(query).toArray();
      res.send(options);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const options = await productsCollection.findOne(query);
      res.send(options);
    });
  } finally {
  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("Used products resail server is running");
});

app.listen(port, () => {
  console.log(`used product resail running on port ${port}`);
});

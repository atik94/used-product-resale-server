const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorised access");
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
      req.decoded = decoded;
      next();
    }
  });
}

async function run() {
  try {
    // const categoriesOptionCollection = client.db("laptopResailMarket").collection("categoriesOption");
    const productsCollection = client.db("laptopResailMarket").collection("productsCollection");

    const bookingCollection = client.db("laptopResailMarket").collection("bookings");
    const usersCollection = client.db("laptopResailMarket").collection("users");
    // app.get("/categories", async (req, res) => {
    //   const query = {};
    //   const options = await categoriesOptionCollection.find(query).toArray();
    //   res.send(options);
    // });

    // Booking api
    app.get("/bookings", async (req, res) => {
      const email = req.query.email;
      // const decodedEmail = req.decoded.email;
      // if (email !== decodedEmail) {
      //   return res.status(403).send({ message: "forbidden access" });
      // }

      const query = { email: email };
      const bookings = await bookingCollection.find(query).toArray();
      res.send(bookings);
    });

    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    //TOKEN api
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: "30d" });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: "" });
    });

    // All Buyers api
    app.get("/buyers", async (req, res) => {
      const query = { role: "buyers" };
      const buyers = await usersCollection.find(query).toArray();
      console.log(buyers);
      res.send(buyers);
    });

    // All Sellers api
    app.get("/sellers", async (req, res) => {
      const query = { role: "sellers" };
      const sellers = await usersCollection.find(query).toArray();
      console.log(sellers);
      res.send(sellers);
    });

    //All Users api
    app.get("/users", async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    app.put("/users/admin/:id", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await usersCollection.findOne(query);

      if (user?.role !== "admin") {
        return res.status(403).send({ message: "forvidden access" });
      }

      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(filter, updatedDoc, options);
      res.send(result);
    });

    //products api
    app.post("/products", async (req, res) => {
      const query = req.body;
      const options = await productsCollection.insertOne(query);
      res.send(options);
    });

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

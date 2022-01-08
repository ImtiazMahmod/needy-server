const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
var cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

app.use(cors());
app.use(express.json());

//database connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zbwte.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();

    const database = client.db("Needy");
    const productCollection = database.collection("products");
    const ordersCollection = database.collection("orders");
    const reviewCollection = database.collection("reviews");

    ///get products
    app.get("/products", async (req, res) => {
      const products = await productCollection.find({}).toArray();
      res.send(products);
    });

    ///get single product
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });

    //post product order

    app.post("/orderProduct", async (req, res) => {
      const newOrder = req.body;

      const result = await ordersCollection.insertOne(newOrder);
      res.json(result);
    });

    //load specific user orders
    app.get("/myOrders", async (req, res) => {
      const email = req.query.email;

      const myOrders = await ordersCollection.find({ email: email }).toArray();
      res.send(myOrders);
      console.log("all pro", myOrders);
    });

    ///delete user order
    app.delete("/deleteOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const deleteOrder = await ordersCollection.deleteOne(query);
      res.send(deleteOrder);
      console.log("delete", id);
    });

    ///add review
    app.post("/review", async (req, res) => {
      const review = req.body;
      console.log(review);
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });

    ///load review
    app.get("/review", async (req, res) => {
      const reviews = await reviewCollection.find({}).toArray();
      res.send(reviews);
    });
  } finally {
    // await client.close()
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server OK");
});

app.listen(port, () => {
  console.log(`my port is `, port);
});

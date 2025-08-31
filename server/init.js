const express = require("express");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv").config();
const client = new MongoClient(process.env.MONGODB_URL);
const dbName = process.env.DATABASE;
let db;
const app = express();

connectToDatabase();
async function connectToDatabase() {
  try {
    await client.connect();
    db = client.db(dbName);
    app.locals.db = db;
    console.log("Database connected...");
    app.listen(process.env.PORT, () => {
      console.log(`Server started at port number ${process.env.PORT}...`);
    });
  } catch (err) {
    console.log(err);
  }
}
module.exports = { app };

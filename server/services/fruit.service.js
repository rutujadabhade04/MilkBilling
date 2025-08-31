const { app } = require("../init.js");
const { ObjectId } = require("mongodb");

async function getAllFruits() {
  const db = app.locals.db;

  const collection = db.collection("fruits");

  let list = await collection.find().toArray();

  return list;
}
async function getFruitById(id) {
  let obj = await Fruit.findById(id);
  return obj;
}
async function addFruit(obj) {
  const db = app.locals.db;
  const collection = db.collection("fruits");
  let response = await collection.insertOne(obj);
  return obj;
}
async function updateFruit(obj) {
  const db = app.locals.db;
  const collection = db.collection("fruits");
  let id = obj._id;
  delete obj._id;
  obj = await collection.updateOne(
    { _id: ObjectId.createFromHexString(id) },
    { $set: obj }
  );
  return obj;
}
async function deleteFruit(id) {
  const db = app.locals.db;
  const collection = db.collection("fruits");
  let obj = await collection.deleteOne({
    _id: ObjectId.createFromHexString(id),
  });
  return obj;
}
module.exports = FruitService = {
  getAllFruits,
  getFruitById,
  addFruit,
  updateFruit,
  deleteFruit,
};

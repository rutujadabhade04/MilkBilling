const { app } = require("../init.js");
const { ObjectId } = require("mongodb");

async function getAllOwner_clients() {
  const db = app.locals.db;

  const collection = db.collection("owner_clients");

  let list = await collection.find().toArray();

  return list;
}
async function getOwner_clientById(id) {
  const db = app.locals.db;
  const collection = db.collection("owner_clients");
  const owner_clientObj = await collection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
  console.log(owner_clientObj);

  return owner_clientObj;
}
async function addOwner_client(obj) {
  const db = app.locals.db;
  const collection = db.collection("owner_clients");
  // normalize text
  const keys = Object.keys(obj);
  for (let key of keys) {
    if (typeof obj[key] == "string") {
      obj[key] = normalizeNewlines(obj[key]);
    }
  }
  let result = await collection.insertOne(obj);
  obj._id = result.insertedId;
  return obj;
}
async function addManyOwner_clients(owner_clients) {
  const db = app.locals.db;
  const collection = db.collection("owner_clients");
  const result = await collection.insertMany(owner_clients);
  const insertedIds = Object.values(result.insertedIds);
  const insertedDocs = await collection
    .find({ _id: { $in: insertedIds } })
    .toArray();
  return insertedDocs;
}
async function updateManyOwner_clients(owner_clients) {
  const db = app.locals.db;
  const collection = db.collection("owner_clients");
  // Prepare bulk operations
  const operations = owner_clients.map((owner_client) => {
    const { _id, ...fieldsToUpdate } = owner_client;
    return {
      updateOne: {
        filter: { _id: ObjectId.createFromHexString(_id) },
        update: { $set: fieldsToUpdate },
      },
    };
  });
  const result = await collection.bulkWrite(operations);
  const updatedIds = owner_clients.map((p) => ObjectId.createFromHexString(p._id));

  const updatedOwner_clients = await collection
    .find({ _id: { $in: updatedIds } })
    .toArray();
  return updatedOwner_clients;
}
async function updateOwner_client(obj) {
  const db = app.locals.db;
  const collection = db.collection("owner_clients");
  let id = obj._id;
  delete obj._id;
  let result = await collection.updateOne(
    { _id: ObjectId.createFromHexString(id) },
    { $set: obj }
  );
  return result;
}
async function deleteOwner_client(id) {
  const db = app.locals.db;
  const collection = db.collection("owner_clients");
  let obj = await collection.deleteOne({
    _id: ObjectId.createFromHexString(id),
  });
  return obj;
}
normalizeNewlines = (text) => {
  return text.replace(/\r\n/g, "\n");
};z
module.exports = Owner_clientService = {
  getAllOwner_clients,
  getOwner_clientById,
  addOwner_client,
  addManyOwner_clients,
  updateManyOwner_clients,
  updateOwner_client,
  deleteOwner_client,
};

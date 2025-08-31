const { app } = require("../init.js");
const { ObjectId } = require("mongodb");

async function getAllQuotations() {
  const db = app.locals.db;

  const collection = db.collection("quotations");

  let list = await collection.find().toArray();

  return list;
}
async function getQuotationById(id) {
  let obj = await Quotation.findById(id);
  return obj;
}
async function addQuotation(obj) {
  const db = app.locals.db;
  const collection = db.collection("quotations");
  let response = await collection.insertOne(obj);
  return obj;
}
async function updateQuotation(obj) {
  const db = app.locals.db;
  const collection = db.collection("quotations");
  let id = obj._id;
  delete obj._id;
  obj = await collection.updateOne(
    { _id: ObjectId.createFromHexString(id) },
    { $set: obj }
  );
  return obj;
}
async function deleteQuotation(id) {
  const db = app.locals.db;
  const collection = db.collection("quotations");
  let obj = await collection.deleteOne({
    _id: ObjectId.createFromHexString(id),
  });
  return obj;
}
module.exports = QuotationService = {
  getAllQuotations,
  getQuotationById,
  addQuotation,
  updateQuotation,
  deleteQuotation,
};

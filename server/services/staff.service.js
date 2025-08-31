const { app } = require("../init.js");
const { ObjectId } = require("mongodb");

async function getAllStaff() {
  const db = app.locals.db;

  const collection = db.collection("staff");

  let list = await collection.find().toArray();

  return list;
}
async function getStaffById(id) {
  let obj = await Staff.findById(id);
  return obj;
}
async function addStaff(obj) {
  const db = app.locals.db;
  const collection = db.collection("staff");
  let response = await collection.insertOne(obj);
  return obj;
}
async function updateStaff(obj) {
  const db = app.locals.db;
  const collection = db.collection("staff");
  let id = obj._id;
  delete obj._id;
  obj = await collection.updateOne(
    { _id: ObjectId.createFromHexString(id) },
    { $set: obj }
  );
  console.log("Updated");
  console.log(obj);
  return obj;
}
async function deleteStaff(id) {
  const db = app.locals.db;
  const collection = db.collection("staff");
  let obj = await collection.deleteOne({
    _id: ObjectId.createFromHexString(id),
  });
  return obj;
}
module.exports = StaffService = {
  getAllStaff,
  getStaffById,
  addStaff,
  updateStaff,
  deleteStaff,
};

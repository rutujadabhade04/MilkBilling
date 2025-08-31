const { app } = require("../init.js");
const { ObjectId } = require("mongodb");

async function getAllRoles() {
  const db = app.locals.db;

  const collection = db.collection("roles");

  let list = await collection.find().toArray();

  return list;
}
async function getRoleById(id) {
  const db = app.locals.db;
  const collection = db.collection("roles");
  const roleObj = await collection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
  return roleObj;
}
async function addRole(obj) {
  const db = app.locals.db;
  const collection = db.collection("roles");
  let response = await collection.insertOne(obj);
  return obj;
}
async function updateRole(obj) {
  const db = app.locals.db;
  const collection = db.collection("roles");
  let id = obj._id;
  delete obj._id;
  obj = await collection.updateOne(
    { _id: ObjectId.createFromHexString(id) },
    { $set: obj }
  );
  return obj;
}
async function deleteRole(id) {
  const db = app.locals.db;
  const collection = db.collection("roles");
  let obj = await collection.deleteOne({
    _id: ObjectId.createFromHexString(id),
  });
  return obj;
}
module.exports = RoleService = {
  getAllRoles,
  getRoleById,
  addRole,
  updateRole,
  deleteRole,
};

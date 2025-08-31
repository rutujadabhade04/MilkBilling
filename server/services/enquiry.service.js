const { app } = require("../init.js");
const { ObjectId } = require("mongodb");

async function getAllEnquiries() {
  const db = app.locals.db;

  const collection = db.collection("enquiries");

  let list = await collection.find().toArray();

  return list;
}
async function getEnquiryById(id) {
  const db = app.locals.db;
  const collection = db.collection("enquiries");
  const enquiryObj = await collection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
  return enquiryObj;
}
async function addEnquiry(obj) {
  const db = app.locals.db;
  const collection = db.collection("enquiries");
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
async function addManyEnquiries(enquiries) {
  const db = app.locals.db;
  const collection = db.collection("enquiries");
  const result = await collection.insertMany(enquiries);
  const insertedIds = Object.values(result.insertedIds);
  const insertedDocs = await collection
    .find({ _id: { $in: insertedIds } })
    .toArray();
  return insertedDocs;
}

async function updateEnquiry(obj) {
  const db = app.locals.db;
  const collection = db.collection("enquiries");
  let id = obj._id;
  delete obj._id;
  let result = await collection.updateOne(
    { _id: ObjectId.createFromHexString(id) },
    { $set: obj }
  );
  return result;
}
async function updateManyEnquiries(enquiries) {
  const db = app.locals.db;
  const collection = db.collection("enquiries");
  // Prepare bulk operations
  const operations = enquiries.map((enquiry) => {
    const { _id, ...fieldsToUpdate } = enquiry;
    return {
      updateOne: {
        filter: { _id: ObjectId.createFromHexString(_id) },
        update: { $set: fieldsToUpdate },
      },
    };
  });
  const result = await collection.bulkWrite(operations);
  const updatedIds = enquiries.map((p) => ObjectId.createFromHexString(p._id));

  const updatedEnquiries = await collection
    .find({ _id: { $in: updatedIds } })
    .toArray();
  return updatedEnquiries;
}
async function deleteEnquiry(id) {
  const db = app.locals.db;
  const collection = db.collection("enquiries");
  let obj = await collection.deleteOne({
    _id: ObjectId.createFromHexString(id),
  });
  return obj;
}
async function addRemark(obj, id) {
  const db = app.locals.db;
  const collection = db.collection("enquiries");
  const response = await collection.updateOne(
    { _id: ObjectId.createFromHexString(id) },
    {
      $push: {
        remarks: obj,
      },
    }
  );
  return response;
}
async function deleteRemark(id, remarkId) {
  const db = app.locals.db;
  const collection = db.collection("enquiries");
  const response = await collection.updateOne(
    { _id: ObjectId.createFromHexString(id) },
    {
      $pull: { remarks: { _id: ObjectId.createFromHexString(remarkId) } },
    }
  );
  return response;
}
async function getEnquiryFileById(enquiryId, fileId) {
  const db = app.locals.db;
  const collection = db.collection("enquiries");
  const enquiry = await collection.findOne(
    {
      _id: enquiryId,
      "files._id": fileId,
    },
    {
      projection: {
        files: {
          $elemMatch: { _id: fileId },
        },
      },
    }
  );
  console.log(enquiry.files.length + "Tatya");
  console.log(enquiry.files[0]);

  if (enquiry?.files?.length > 0) {
    return enquiry.files[0];
  } else {
    return null;
  }
}
async function addFileInfo(obj, id) {
  const db = app.locals.db;
  const collection = db.collection("enquiries");
  const response = await collection.updateOne(
    { _id: ObjectId.createFromHexString(id) },
    {
      $push: {
        files: obj,
      },
    }
  );
  return response;
}
async function deleteFileInfo(id, resourceFileId) {
  const db = app.locals.db;
  const collection = db.collection("enquiries");
  const response = await collection.updateOne(
    { _id: ObjectId.createFromHexString(id) },
    {
      $pull: { files: { _id: ObjectId.createFromHexString(resourceFileId) } },
    }
  );
  return response;
}
module.exports = EnquiryService = {
  getAllEnquiries,
  getEnquiryById,
  addEnquiry,
  addManyEnquiries,
  updateEnquiry,
  updateManyEnquiries,
  deleteEnquiry,
  addRemark,
  getEnquiryFileById,
  addFileInfo,
  deleteFileInfo,
  deleteRemark,
};

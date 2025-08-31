const express = require("express");
const router = express.Router();
const Owner_clientService = require("../services/owner_client.service");
const multer = require("multer");
const { normalizeNewlines } = require("../services/utilities/lib");
// const upload = multer({ dest: "uploads/" });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });
router.get("/", async (req, res, next) => {
  try {
    let list = await Owner_clientService.getAllOwner_clients();
    res.status(200).json(list);
  } catch (error) {
    next(error); // Send error to middleware
  }
});
router.get("/:id", async (req, res, next) => {
  try {
    let id = req.params.id;
    let obj = await Owner_clientService.getOwner_clientById(id);
    res.send(obj);
  } catch (error) {
    next(error); // Send error to middleware
  }
});
router.post("/", upload.any(), async (req, res, next) => {
  try {
    let obj = req.body;
    // normalize text
    const keys = Object.keys(obj);
    for (let key of keys) {
      if (typeof obj[key] == "string") {
        obj[key] = normalizeNewlines(obj[key]);
      }
    }
    obj.addDate = new Date();
    obj.updateDate = new Date();
    obj = await Owner_clientService.addOwner_client(obj);
    res.status(201).json(obj);
  } catch (error) {
    next(error); // Send error to middleware
  }
});
router.post("/bulk-add", upload.any(), async (req, res, next) => {
  let owner_clients = req.body;
  if (!Array.isArray(owner_clients)) {
    return res.status(400).json({ message: "Invalid input, expected array" });
  }
  owner_clients.forEach((e, index) => {
    e.addDate = new Date();
    e.updateDate = new Date();
  });
  try {
    let result = await Owner_clientService.addManyOwner_clients(owner_clients);
    res.status(201).json(result);
  } catch (error) {
    next(error); // Send error to middleware
  }
});
router.put("/", upload.any(), async (req, res, next) => {
  try {
    let obj = req.body;
    obj.updateDate = new Date();
    let id = obj._id;
    let result = await Owner_clientService.updateOwner_client(obj);
    if (result.modifiedCount == 1) {
      obj._id = id;
      res.status(200).json(obj);
    }
  } catch (error) {
    next(error); // Send error to middleware
  }
});
router.put("/bulk-update", upload.any(), async (req, res, next) => {
  let owner_clients = req.body;
  if (!Array.isArray(owner_clients)) {
    return res.status(400).json({ message: "Invalid input, expected array" });
  }
  owner_clients.forEach((e, index) => {
    e.updateDate = new Date();
  });
  try {
    let result = await Owner_clientService.updateManyOwner_clients(owner_clients);
    res.status(201).json(result);
  } catch (error) {
    next(error); // Send error to middleware
  }
});
router.delete("/:id", async (req, res, next) => {
  try {
    let id = req.params.id;
    let obj = req.body;
    obj = await Owner_clientService.deleteOwner_client(id);
    res.json(obj);
  } catch (error) {
    next(error); // Send error to middleware
  }
});

module.exports = router;

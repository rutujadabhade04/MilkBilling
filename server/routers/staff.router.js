const express = require("express");
const router = express.Router();
const StaffService = require("../services/staff.service");
const multer = require("multer");
// const upload = multer({ dest: "uploads/" });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });
router.get("/", async (req, res) => {
  let list = await StaffService.getAllStaff();
  res.status(200).json(list);
});
router.get("/:id", async (req, res) => {
  let id = req.params.id;
  res.send(StaffService.getStaffById(id));
});
router.post("/", async (req, res) => {
  let obj = req.body;
  obj.addDate = new Date();
  obj.updateDate = new Date();
  obj = await StaffService.addStaff(obj);
  res.status(201).json(obj);
});
router.put("/", async (req, res) => {
  let obj = req.body;
  obj.updateDate = new Date();
  obj = await StaffService.updateStaff(obj);
  res.status(200).json(obj);
});
router.delete("/:id", async (req, res) => {
  let id = req.params.id;
  let obj = req.body;
  obj = await StaffService.deleteStaff(id);
  res.json(obj);
});

module.exports = router;

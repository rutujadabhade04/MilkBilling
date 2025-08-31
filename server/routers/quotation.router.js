const express = require("express");
const router = express.Router();
const QuotationService = require("../services/quotation.service");
const multer = require("multer");
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
    let list = await QuotationService.getAllQuotations();
    res.status(200).json(list);
  } catch (error) {
    next(error); // Send error to middleware
  }
});
router.get("/:id", async (req, res, next) => {
  try {
    let id = req.params.id;
    res.send(QuotationService.getQuotationById(id));
  } catch (error) {
    next(error); // Send error to middleware
  }
});
router.post("/", upload.any(), async (req, res, next) => {
  try {
    let obj = req.body;
    obj.addDate = new Date();
    obj.updateDate = new Date();
    console.log("Quotation post");
    console.log(req.body);
    console.log(req.files);

    obj = await QuotationService.addQuotation(obj);
    res.status(201).json(obj);
  } catch (error) {
    next(error); // Send error to middleware
  }
});
router.put("/", upload.any(), async (req, res, next) => {
  try {
    let obj = req.body;
    console.log("Quotation put");
    console.log(req.body);
    console.log(req.files);
    obj.updateDate = new Date();
    obj = await QuotationService.updateQuotation(obj);
    res.status(200).json(obj);
  } catch (error) {
    next(error); // Send error to middleware
  }
});
router.delete("/:id", async (req, res, next) => {
  try {
    let id = req.params.id;
    let obj = req.body;
    obj = await QuotationService.deleteQuotation(id);
    res.json(obj);
  } catch (error) {
    next(error); // Send error to middleware
  }
});

module.exports = router;

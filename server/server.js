const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + file.fieldname + ext);
  },
});

const upload = multer({ storage: storage });

// Accept one profileImage and multiple documents
const multiUpload = upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "documents", maxCount: 5 },
]);

// Upload route
app.post("/api/upload", multiUpload, (req, res) => {
  const { name, email } = req.body;
  const profileImage = req.files["profileImage"]?.[0]?.filename;
  const documents = req.files["documents"]?.map((file) => file.filename);

  res.json({
    message: "Upload successful",
    user: {
      name,
      email,
      profileImage,
      documents,
    },
  });
});

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

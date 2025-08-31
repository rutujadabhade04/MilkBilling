const express = require("express");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "aaappuuqq";
const router = express.Router();
const UserService = require("../services/user.service");
const RoleService = require("../services/role.service");
const multer = require("multer");
const logger = require("../logger");
const ms = require("ms");

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

router.get("/", async (req, res) => {
  try {
    let list = await UserService.getAllUsers();
    res.status(200).json(list);
  } catch (error) {
    next(error); // Send error to middleware
  }
});
router.get("/hello", async (req, res, next) => {
  const token = req.cookies.token;
  try {
    if (!token) {
      res.status(200).json("");
    } else {
      jwt.verify(token, process.env.SECRET_KEY, (err, tokenData) => {
        if (err) {
          next(err);
          return;
        } else {
          res.status(200).json(tokenData);
        }
      });
    }
    // let list = await StudentService.getAllStudents();
  } catch (error) {
    next(error); // Send error to middleware
  }
});
router.get("/:id", async (req, res, next) => {
  try {
    let id = req.params.id;
    res.send(await UserService.getUserById(id));
  } catch (error) {
    next(error); // Send error to middleware
  }
});
router.get("/byEmailId/:emailId", async (req, res, next) => {
  try {
    let emailId = req.params.emailId;
    res.status(200).json(await UserService.getUserByEmailId(emailId));
  } catch (error) {
    next(error); // Send error to middleware
  }
});
router.post(
  "/",
  auntheticateUser,
  logActivity,
  upload.single("file"),
  async (req, res, next) => {
    try {
      let obj = req.body;
      obj.password = "";
      obj.addDate = new Date();
      obj.updateDate = new Date();
      obj = await UserService.addUser(obj);
      res.status(201).json(obj);
    } catch (error) {
      next(error); // Send error to middleware
    }
  }
);
router.post("/signup", async (req, res, next) => {
  try {
    let obj = req.body;
    let userObj = await UserService.checkUser(obj);
    if (!userObj) {
      // user is not registered, add to database with role as user
      obj.role = "user";
      UserService.addUser(obj);
      res.status(201).json({ message: "Signup Operation Successful" });
    } //if
    else {
      res.status(409).json({ error: "This emailid is already registered" });
    }
  } catch (error) {
    //try
    next(error); // Send error to middleware
  }
});
router.post("/signout", async (req, res, next) => {
  // delete the token
  try {
    res.clearCookie("token"); //
    res.status(200).json({ result: "Signed out" });
  } catch (error) {
    next(error); // Send error to middleware
  }
});
router.post("/login", async (req, res, next) => {
  try {
    let obj = req.body;
    let userObj = await UserService.checkUserTryingToLogIn(obj);
    if (!userObj) {
      // No such user
      res.status(409).json({ error: "Wrong emailId" });
    } else if (userObj.status == "disabled") {
      res.status(403).json({ error: "Contact Admin." });
    } else if (userObj.password == "") {
      //First time login by user, he/she needs to signup first
      res.status(403).json({ error: "Signup First" });
    } else if (userObj.password != obj.password) {
      // wrong password
      res.status(403).json({ error: "Wrong password" });
    } else if (userObj.password === obj.password) {
      // send user to client
      delete userObj.password;
      delete userObj.confirmPassword;
      console.log(
        "Logged in success.. " + userObj.emailId + " " + userObj.role
      );
      console.log(userObj);
      // if successful login, assign token
      const token = jwt.sign(userObj, process.env.SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRY,
      });
      res.cookie("token", token, {
        httpOnly: true,
        secure: true, // Set to true in production with HTTPS
        sameSite: "Lax",
        maxAge: ms(process.env.JWT_EXPIRY),
      });
      res
        .status(201)
        .json({ user: userObj, message: "Logged in Successfully" });
    }
  } catch (error) {
    next(error); // Send error to middleware
  }
});
router.put(
  "/",
  auntheticateUser,
  logActivity,
  upload.single("file"),
  async (req, res, next) => {
    try {
      let obj = req.body;
      obj.updateDate = new Date();
      obj = await UserService.updateUser(obj);
      res.status(200).json(obj);
    } catch (error) {
      next(error); // Send error to middleware
    }
  }
);
router.delete("/:id", auntheticateUser, logActivity, async (req, res, next) => {
  try {
    let id = req.params.id;
    obj = await UserService.deleteUser(id);
    res.json(obj);
  } catch (error) {
    next(error); // Send error to middleware
  }
});
//================
function auntheticateUser(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    // This is unauthorized way... but before responding let us add to log
    req.activity = "Unauthorized";
    next();
    return; //**Important */
    // return res.sendStatus(401); // Unauthorized
  }
  jwt.verify(token, process.env.SECRET_KEY, (err, tokenData) => {
    console.log(tokenData.role + "AAI");

    if (err) {
      // There might be tempering with the token... but before responding let us add to log
      req.activity = "Forbidden";
      next();
      return;
      // res.sendStatus(403); // Forbidden
    }
    if (tokenData.role == "guest") {
      // Guest is trying to do the things illegally
      // but before responding let us add to log
      req.activity = "guestActivity";
      next();
      return;
      // return res.sendStatus(401); // Unauthorized
    }
    req.tokenData = tokenData; // Attach user info to request
    next();
  });
}
function logActivity(req, res, next) {
  if (req.activity == "Unauthorized") {
    logger.warn(
      `Unauthorized operation -->` + req.method + "--->" + req.baseUrl.slice(1)
    );
    return res.sendStatus(401);
  } else if (req.activity == "Forbidden") {
    logger.warn(
      `Forbidden woperation -->` + req.method + "--->" + req.baseUrl.slice(1)
    );
    return res.sendStatus(403);
  } else if (req.activity == "guestActivity") {
    logger.warn(
      `Guest's illegal operation -->` +
        req.method +
        "--->" +
        req.baseUrl.slice(1)
    );
    return res.sendStatus(401); // Unauthorized
  }
  logger.info(
    req.tokenData.name + "-->" + req.method + "--->" + req.baseUrl.slice(1)
  );
  next();
}
module.exports = router;

// const express = require("express");
// const jwt = require("jsonwebtoken");
// const SECRET_KEY = "aaappuuqq";
// const router = express.Router();
// const UserService = require("../services/user.service");
// const RoleService = require("../services/role.service");
// const multer = require("multer");
// const logger = require("../logger");

// // const upload = multer({ dest: "uploads/" });
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./uploads");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });
// const upload = multer({ storage: storage });

// router.get("/", async (req, res) => {
//   try {
//     let list = await UserService.getAllUsers();
//     res.status(200).json(list);
//   } catch (error) {
//     next(error); // Send error to middleware
//   }
// });
// router.get("/:id", async (req, res, next) => {
//   try {
//     let id = req.params.id;
//     res.send(await UserService.getUserById(id));
//   } catch (error) {
//     next(error); // Send error to middleware
//   }
// });
// router.get("/byEmailId/:emailId", async (req, res, next) => {
//   try {
//     let emailId = req.params.emailId;
//     res.status(200).json(await UserService.getUserByEmailId(emailId));
//   } catch (error) {
//     next(error); // Send error to middleware
//   }
// });
// router.post(
//   "/",
//   auntheticateUser,
//   logActivity,
//   upload.single("file"),
//   async (req, res, next) => {
//     try {
//       let obj = req.body;
//       obj.password = "";
//       obj.addDate = new Date();
//       obj.updateDate = new Date();
//       obj = await UserService.addUser(obj);
//       res.status(201).json(obj);
//     } catch (error) {
//       next(error); // Send error to middleware
//     }
//   }
// );
// router.post("/signup", async (req, res, next) => {
//   try {
//     let obj = req.body;
//     obj = await UserService.checkUser(obj);
//     res.status(201).json(obj);
//   } catch (error) {
//     next(error); // Send error to middleware
//   }
// });
// router.post("/signout", async (req, res, next) => {
//   // delete the token
//   try {
//     res.clearCookie("token"); //
//     res.status(200).json({ result: "Signed out" });
//   } catch (error) {
//     next(error); // Send error to middleware
//   }
// });
// router.post("/login", async (req, res, next) => {
//   try {
//     let obj = req.body;
//     // initially password of new user is empty
//     obj = await UserService.checkUserTryingToLogIn(obj);
//     // if successful login, assign token
//     if (obj.result == "validUser") {
//       // get role - level of the user
//       let role = await RoleService.getRoleById(obj.user.roleId);
//       obj.user.level = role.level;
//       const token = jwt.sign(obj.user, process.env.SECRET_KEY, {
//         expiresIn: "1h",
//       });
//       res.cookie("token", token, {
//         httpOnly: true,
//         // secure: false, // Set to true in production with HTTPS
//         secure: true, // Set to true in production with HTTPS
//         sameSite: "Lax",
//         maxAge: 3600000,
//       });
//     }
//     res.json(obj);
//   } catch (error) {
//     next(error); // Send error to middleware
//   }
// });
// router.put(
//   "/",
//   auntheticateUser,
//   logActivity,
//   upload.single("file"),
//   async (req, res, next) => {
//     try {
//       let obj = req.body;
//       obj.updateDate = new Date();
//       obj = await UserService.updateUser(obj);
//       res.status(200).json(obj);
//     } catch (error) {
//       next(error); // Send error to middleware
//     }
//   }
// );
// router.delete("/:id", auntheticateUser, logActivity, async (req, res, next) => {
//   try {
//     let id = req.params.id;
//     obj = await UserService.deleteUser(id);
//     res.json(obj);
//   } catch (error) {
//     next(error); // Send error to middleware
//   }
// });
// //================
// function auntheticateUser(req, res, next) {
//   const token = req.cookies.token;

//   if (!token) {
//     // This is unauthorized way... but before responding let us add to log
//     req.activity = "Unauthorized";
//     next();
//     return; //**Important */
//     // return res.sendStatus(401); // Unauthorized
//   }
//   jwt.verify(token, process.env.SECRET_KEY, (err, tokenData) => {
//     console.log(tokenData.role + "AAI");

//     if (err) {
//       // There might be tempering with the token... but before responding let us add to log
//       req.activity = "Forbidden";
//       next();
//       return;
//       // res.sendStatus(403); // Forbidden
//     }
//     if (tokenData.role == "guest") {
//       // Guest is trying to do the things illegally
//       // but before responding let us add to log
//       req.activity = "guestActivity";
//       next();
//       return;
//       // return res.sendStatus(401); // Unauthorized
//     }
//     req.tokenData = tokenData; // Attach user info to request
//     next();
//   });
// }
// function logActivity(req, res, next) {
//   if (req.activity == "Unauthorized") {
//     logger.warn(
//       `Unauthorized operation -->` + req.method + "--->" + req.baseUrl.slice(1)
//     );
//     return res.sendStatus(401);
//   } else if (req.activity == "Forbidden") {
//     logger.warn(
//       `Forbidden woperation -->` + req.method + "--->" + req.baseUrl.slice(1)
//     );
//     return res.sendStatus(403);
//   } else if (req.activity == "guestActivity") {
//     logger.warn(
//       `Guest's illegal operation -->` +
//         req.method +
//         "--->" +
//         req.baseUrl.slice(1)
//     );
//     return res.sendStatus(401); // Unauthorized
//   }
//   logger.info(
//     req.tokenData.name + "-->" + req.method + "--->" + req.baseUrl.slice(1)
//   );
//   next();
// }
// module.exports = router;

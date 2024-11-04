const express = require("express");
const router = express.Router();
const bookCtrl = require("../controllers/bookCtrl");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer");
const compressImage = require("../middleware/compressImage");

router.get("/bestrating", bookCtrl.getBestRatedBooks);
router.get("/:id", bookCtrl.getOneBook);
router.get("/", bookCtrl.getAllBooks);

router.post("/:id/rating", auth, bookCtrl.rateBook);
router.post("/", auth, multer, compressImage, bookCtrl.createBook);
router.put("/:id", auth, multer, compressImage, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;

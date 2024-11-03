const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookControllers");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer");
const compressImage = require("../middleware/compressImage");

router.get("/bestrating", bookController.getBestRatedBooks);
router.get("/:id", bookController.getOneBook);
router.get("/", bookController.getAllBooks);

router.post("/:id/rating", auth, bookController.rateBook);
router.post("/", auth, multer, compressImage, bookController.createBook);

router.put("/:id", auth, multer, compressImage, bookController.modifyBook);
router.delete("/:id", auth, bookController.deleteBook);

module.exports = router;

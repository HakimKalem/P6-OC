const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const compressImage = (req, res, next) => {
  if (!req.file) return next();

  const originalPath = req.file.path;

  const compressedPath = originalPath.replace(/\.\w+$/, ".webp");

  sharp(originalPath)
    .webp({ quality: 75 })
    .toFile(compressedPath, (error) => {
      if (error) {
        fs.unlink(originalPath);
        return res
          .status(500)
          .json({ error: "Erreur lors de la compression de l'image." });
      }

      req.file.path = compressedPath;
      req.file.filename = path.basename(compressedPath);

      fs.unlink(originalPath, (unlinkErr) => {
        if (unlinkErr)
          console.error(
            "Erreur lors de la suppression de l'image d'origine:",
            unlinkErr
          );
        next();
      });
    });
};

module.exports = compressImage;

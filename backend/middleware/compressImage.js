const sharp = require("sharp");
const fs = require("fs");

const compressImage = (req, res, next) => {
  if (!req.file) return next();

  const originalPath = req.file.path;

  const compressedPath = `${originalPath}.webp`;

  sharp(originalPath)
    .webp({ quality: 75 })
    .toFile(compressedPath, (error) => {
      if (error) {
        console.error("Erreur de compression:", error);

        fs.unlinkSync(originalPath);
        return res
          .status(500)
          .json({ error: "Erreur lors de la compression de l'image." });
      }

      req.file.path = compressedPath;

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

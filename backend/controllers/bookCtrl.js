const Book = require("../models/Book");
const fs = require("fs");

// Contrôleur pour récupérer tous les livres
exports.getAllBooks = (req, res) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// Contrôleur pour récupérer un livre spécifique
exports.getOneBook = (req, res) => {
  Book.findById(req.params.id)
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

// Contrôleur pour créer un livre
exports.createBook = (req, res) => {
  const bookData = JSON.parse(req.body.book);

  delete bookData._id;
  delete bookData._userId;

  const book = new Book({
    ...bookData,
    userId: req.auth.userId, // Associe le livre à l'utilisateur authentifié
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  book
    .save()
    .then(() => res.status(201).json({ message: "Livre cree avec succes !" }))
    .catch((error) => res.status(400).json({ error }));
};

// Contrôleur pour mettre à jour un livre
exports.modifyBook = (req, res, next) => {
  const bookData = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete bookData._userId;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }

      if (book.userId !== req.auth.userId) {
        return res.status(401).json({ message: "Non autorisé" });
      }

      Book.updateOne(
        { _id: req.params.id },
        { ...bookData, _id: req.params.id }
      )
        .then(() =>
          res.status(200).json({ message: "Livre modifié avec succès !" })
        )
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// Contrôleur pour supprimer un livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: "Requête non autorisée" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, (err) => {
          if (err) {
            return res.status(500).json({ error: err });
          }
          Book.deleteOne({ _id: req.params.id })
            .then(() =>
              res.status(200).json({ message: "Livre supprimé avec succès !" })
            )
            .catch((error) => res.status(400).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

// Contrôleur pour ajouter une note à un livre
exports.rateBook = async (req, res) => {
  try {
    const { userId, rating } = req.body;

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "La note doit être entre 1 et 5." });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé." });
    }

    const existingRating = book.ratings.find((r) => r.userId === userId);
    if (existingRating) {
      return res.status(400).json({ message: "Vous avez déjà noté ce livre." });
    }

    book.ratings.push({ userId: req.auth.userId, grade: rating });

    const totalRatings = book.ratings.length;
    const sumRatings = book.ratings.reduce((acc, r) => acc + (r.grade || 0), 0);
    book.averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    await book.save();

    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Contrôleur pour obtenir les meilleurs livres notés
exports.getBestRatedBooks = (req, res) => {
  Book.find()
    .then((books) => {
      const bestRatedBooks = books
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 3);

      res.status(200).json(bestRatedBooks);
    })
    .catch((error) => res.status(500).json({ error }));
};

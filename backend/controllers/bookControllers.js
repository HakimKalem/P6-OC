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
  console.log("Données reçues (req.body.book) :", req.body.book); // Vérifie le contenu brut
  console.log("Fichier reçu :", req.file); // Vérifie que l'image est bien reçue

  const bookData = JSON.parse(req.body.book);

  console.log("Données du livre après JSON.parse :", bookData); // Vérifie le contenu après parsing

  delete bookData._id;
  delete bookData._userId;

  const book = new Book({
    ...bookData,
    userId: req.auth.userId, // Associe le livre à l'utilisateur authentifié
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }.webp`,
  });

  book
    .save()
    .then(() => res.status(201).json({ message: "Book created successfully!" }))
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
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }

      // Vérifier que l'utilisateur authentifié est bien le propriétaire du livre
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: "Requête non autorisée" });
      }

      // Si l'utilisateur est autorisé, supprimer le livre
      Book.deleteOne({ _id: req.params.id })
        .then(() =>
          res.status(200).json({ message: "Livre supprimé avec succès !" })
        )
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// Contrôleur pour ajouter une note à un livre
exports.rateBook = async (req, res) => {
  try {
    const { userId, rating } = req.body;

    // Vérifier que la note est valide (entre 1 et 5)
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "La note doit être entre 1 et 5." });
    }

    // Rechercher le livre par son ID
    const book = await Book.findById(req.params.id);
    console.log(book);
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé." });
    }

    // Vérifier si l'utilisateur a déjà noté ce livre
    const existingRating = book.ratings.find((r) => r.userId === userId);
    if (existingRating) {
      return res.status(400).json({ message: "Vous avez déjà noté ce livre." });
    }

    // Ajouter la nouvelle note
    book.ratings.push({ userId: req.auth.userId, grade: rating });

    // Recalculer la moyenne des notes
    const totalRatings = book.ratings.length;
    const sumRatings = book.ratings.reduce((acc, r) => acc + (r.grade || 0), 0);
    book.averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    console.log("Livre avant sauvegarde :", book);

    // Sauvegarder les modifications
    await book.save();

    res.status(200).json(book);
  } catch (error) {
    console.error("Erreur lors de l'ajout de la note :", error);
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

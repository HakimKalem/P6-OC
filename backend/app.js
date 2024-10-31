const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const bookRoutes = require("./routes/bookRoutes");
const authRoutes = require("./routes/authRoutes");
const path = require("path");

const app = express();

dotenv.config();

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((error) => console.error("Connexion à MongoDB échouée :", error));

// Middleware CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// Middleware pour parser les requêtes au format JSON
app.use(express.json());

// Utilisation des routes pour les livres
app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;

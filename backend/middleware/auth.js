// middleware/auth.js
require("dotenv").config();
const jwt = require("jsonwebtoken");
const tokenSecret = process.env.TOKEN_SECRET;

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, tokenSecret);
    const userId = decodedToken.userId;
    req.auth = { userId };
    next();
  } catch {
    res.status(401).json({ error: "Requête non authentifiée !" });
  }
};

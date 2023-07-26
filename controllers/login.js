//ME TRAIGO JWT DESPUES DE HABERLO INSTALADO, ES UN MODULO DE AUTH0
const bcrypt = require("bcrypt");
const loginRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

loginRouter.post("/", async (req, res) => {
  const { body } = req;
  const { username, password } = body;

  const user = await User.findOne({ username });

  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    res.status(401).json({
      error: "invalid user or password",
    });
  }

  //CREO EL OBJETO QUE IRA EN EL TOKEN
  const userForToken = {
    id: user._id,
    username: user.username,
  };

  //CREO EL TOQUEN INDICANDO DE QUE OBJETO LO QUIERO CREAR Y LA PALABRA SECRETA, LA PALABRA SECRETA LA GUARDO EN LAS VARIABLES DE ENTORNO
  const token = jwt.sign(userForToken, "1");

  res.send({
    name: user.name,
    username: user.username,
    token,
  });
});

module.exports = loginRouter;

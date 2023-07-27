//ME TRAIGO JWT DESPUES DE HABERLO INSTALADO, ES UN MODULO DE AUTH0
const bcrypt = require("bcrypt");
const loginRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

loginRouter.post("/", async (req, res) => {
  const { username, password } = req.body;
  //BUSCO EL USUARIO EN LA BASE DE DATOS
  const user = await User.findOne({ username });
  //VERIFICO QUE EXISTA EL USUARIO, Y COMPARO CON BCRYPT.COMPARE LA CONTRASEÑA QUE RECIBO EN EL LOGIN, CON LA CONTRASEÑA HASHEADA QUE ESTA GUARDADA EN LA BDD
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    res.status(401).json({
      error: "invalid user or password",
    });
  }
  //CREO LA DATA QUE IRA EN EL TOKEN
  const userForToken = {
    id: user._id,
    username: user.username,
  };
  //FIRMO EL TOKEN CON LA DATA Y LA CLAVE SECRETA, ESTA LA GUARDO EN LAS VARIABLES DE ENTORNO, DEFINO CUANTO DURARA EL TOKEN
  const token = jwt.sign(userForToken, "1", {
    expiresIn: 60 * 60 * 24 * 7,
  });
  //LOGIN EXITOSO DEVUELVO EL TOKEN AL CLIENTE Y MAS DATA
  res.send({
    name: user.name,
    username: user.username,
    token,
  });
});

module.exports = loginRouter;

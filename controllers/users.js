const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/User");

usersRouter.post("/", async (req, res) => {
  const { username, name, password } = req.body;
  //POR SEGURIDAD CON BCRYPT HASHEO LA CONTRASEÑA, YA HASHEADA LA PUEDO GUARDAR EN LA BDD
  const passwordHash = await bcrypt.hash(password, 10);
  //EL USUARIO QUE GUARDON ESTA CON LOS VALORES QUE RECIBI Y LA CONTRASEÑA HASHEADA
  const user = {
    username,
    name,
    passwordHash,
  };
  const newUser = await User.create(user);
  res.status(201).json(newUser);
});

module.exports = usersRouter;

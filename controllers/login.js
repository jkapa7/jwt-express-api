const bcrypt = require("bcrypt");
const loginRouter = require("express").Router();
const User = require("../models/User");

loginRouter.post("/", async (req, res) => {
  const { body } = req;
  const { username, password } = body;

  const user = await User.findOne({ username });
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordhash);

  if (!passwordCorrect) {
    res.status(401).json({ error: "invalid user or password" });
  }

  res.send({
    user: user.name,
    username: user.username,
  });
});

const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  //ME TRAIGO LA UTORIZACION DEL HEADER
  const authorization = req.get("authorization");
  let token = "";

  //TOMO SOLO EL TOKEN
  if (authorization && authorization.toLowerCase().startsWith("bearer")) {
    token = authorization.substring(7);
  }

  //VERIFICO EL TOKEN CON LA CLAVE QUE CREE
  const decodedToken = jwt.verify(token, "1");

  //
  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: "token missing or invalid" });
  }

  const { id: userId } = decodedToken;

  req.userId = userId;

  next();
};

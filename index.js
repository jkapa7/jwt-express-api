require("dotenv").config();
require("./mongo");

const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
const express = require("express");
const app = express();
const cors = require("cors");
const notFound = require("./middleware/notFound.js");
const handleErrors = require("./middleware/handleErrors.js");
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const Note = require("./models/Note");

app.use(cors());
app.use(express.json());
app.use("/images", express.static("images"));

Sentry.init({
  dsn: "https://ac034ebd99274911a8234148642e044c@o537348.ingest.sentry.io/5655435",
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

app.get("/", (request, response) => {
  console.log(request.ip);
  console.log(request.ips);
  console.log(request.originalUrl);
  response.send("<h1>Hello World!</h1>");
});

app.post("/api/notes", async (request, response, next) => {
  const { content, important = false } = request.body;

  //ME TRAIGO LA UTORIZACION DEL HEADER
  const authorization = request.get("authorization");
  let token = "";

  //TOMO SOLO EL TOKEN
  if (authorization && authorization.toLowerCase().startsWith("bearer")) {
    token = authorization.substring(7);
  }

  let decodedToken = {};
  //VERIFICO EL TOKEN
  try {
    decodedToken = jwt.verify(token, "1");
  } catch (e) {
    console.log(e);
  }

  //
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: "token missing or invalid" });
  }

  const { id: userId } = decodedToken;
  const user = await User.findById(userId);

  if (!content) {
    return response.status(400).json({
      error: 'required "content" field is missing',
    });
  }

  const newNote = new Note({
    content,
    date: new Date(),
    important,
    user: user._id,
  });

  try {
    const savedNote = await newNote.save();

    user.notes = user.notes.concat(savedNote._id);
    await user.save();

    response.json(savedNote);
  } catch (error) {
    next(error);
  }
});

app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);

app.use(notFound);

app.use(Sentry.Handlers.errorHandler());
app.use(handleErrors);

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };

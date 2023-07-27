require("dotenv").config();
require("./mongo");

const Sentry = require("@sentry/node");
const express = require("express");
const app = express();
const cors = require("cors");
const handleErrors = require("./middleware/handleErrors.js");

const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");

const notesRouter = require("./controllers/postNotes");
const userExtractor = require("./middleware/userExtractor");

app.use(cors());
app.use(express.json());

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

app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);
app.use("/api/notes", userExtractor, notesRouter);

app.use(Sentry.Handlers.errorHandler());
app.use(handleErrors);

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };

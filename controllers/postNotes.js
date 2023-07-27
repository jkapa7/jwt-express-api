const Note = require("../models/Note");
const notesRouter = require("express").Router();
const User = require("../models/User");

notesRouter.post("/", async (req, res, next) => {
  const { content, important = false } = req.body;

  const { userId } = req;

  const user = await User.findById(userId);

  if (!content) {
    return res.status(400).json({
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

    res.json(savedNote);
  } catch (error) {
    next(error);
  }
});

module.exports = notesRouter;

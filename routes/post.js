// create a new router
const app = require("express").Router();

// import the models
const { Post } = require("../models/index");

// Route to add a new post
app.post("/", async (req, res) => {
  try {
    const { title, categoryId, date, cert, genre, runtime, year, image, hint, synopsis, postedBy } = req.body;
    const post = await Post.create({ title, categoryId, date, cert, genre, runtime, year, image, hint, synopsis, postedBy });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: "Error adding post" });
  }
});

// Route to get all posts
app.get("/", async (req, res) => {
  try {
    const posts = await Post.findAll();

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving posts", error });
  }
});

app.get("/:id", async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving post" });
  }
});

// Route to update a post
app.put("/:id", async (req, res) => {
  try {
    const { title, categoryId, date, cert, genre, runtime, year, image, hint, synopsis, postedBy } = req.body;
    const post = await Post.update(
      { title, categoryId, date, cert, genre, runtime, year, image, hint, synopsis, postedBy },
      { where: { id: req.params.id } }
    );
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Error updating post" });
  }
});

// Route to delete a post
app.delete("/:id", async (req, res) => {
  try {
    const post = await Post.destroy({ where: { id: req.params.id } });
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting post" });
  }
});

// export the router
module.exports = app;

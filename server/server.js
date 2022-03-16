const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;
const imageRoutes = require("./routes/image-upload");
const postRoutes = require("./routes/post-routes");
const commentRoutes = require("./routes/comment-routes");
const replyRoutes = require("./routes/reply-routes");
const likeRoutes = require("./routes/likes-routes");
const friendRoutes = require("./routes/friends-routes");

// express middleware, used to be bodyparser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve up static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

// app.use(require('./routes'));
app.use("/api/", imageRoutes);
app.use("/api/", postRoutes);
app.use("/api", commentRoutes);
app.use("/api", replyRoutes);
app.use("/api/", likeRoutes);
app.use("/api/", friendRoutes);

// Start the API server
app.listen(PORT, () =>
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`)
);

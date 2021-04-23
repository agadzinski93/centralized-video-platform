const express = require("express");
const router = express.Router({ caseSensitive: false, strict: false });
const axios = require("axios").default;

router.get("/", async (req, res, next) => {
  const vidId = "RMDSJyoYwg0";

  axios
    .get(
      `https://www.googleapis.com/youtube/v3/videos?id=${vidId}&key=${process.env.YOUTUBE_KEY}
      &part=snippet,statistics&fields=items(id,snippet,statistics)`
    )
    .then((yt) => {
      let snippet = yt.data.items[0].snippet;
      let stats = yt.data.items[0].statistics;

      res.render("lib", { snippet, stats, vidId, req });
    })
    .catch((err) => {
      console.log("Something went wrong: ", err);
    });
});

router.get("/:id", (req, res) => {
  res.send(`${req.params.id} Page`);
});

module.exports = router;

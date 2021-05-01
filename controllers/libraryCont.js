const axios = require("axios").default;

module.exports = {
  renderLibrary: async (req, res, next) => {
    const vidId = "RMDSJyoYwg0";

    axios
      .get(
        `https://www.googleapis.com/youtube/v3/videos?id=${vidId}&key=${process.env.YOUTUBE_KEY}
        &part=snippet,statistics&fields=items(id,snippet,statistics)`
      )
      .then((yt) => {
        let snippet = yt.data.items[0].snippet;
        let stats = yt.data.items[0].statistics;
        //console.log(snippet.thumbnails.medium.url);

        res.render("lib", {
          title: snippet.title,
          snippet,
          stats,
          vidId,
          req,
        });
      })
      .catch((err) => {
        console.log("Something went wrong: ", err);
      });
  },
  renderLibaryCategory: (req, res) => {
    res.send(`${req.params.id} Page`);
  },
};

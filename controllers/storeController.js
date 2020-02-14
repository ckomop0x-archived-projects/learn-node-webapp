exports.homePage = (req, res) => {
  res.render("index", {
    name: req.name
  });
};

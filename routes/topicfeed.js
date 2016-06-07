var display = require("../public/data/topicfeed.json");

exports.view = function(req,res) {
  console.log(req.query)

	res.render('topicfeed', display);
}

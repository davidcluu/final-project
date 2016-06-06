var display = require("../public/data/topicfeed.json");

exports.view = function(req,res) {
	res.render('topicfeed', display);
} 
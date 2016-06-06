var display = require("../public/data/thread.json");

exports.view = function(req,res) {
	res.render('thread', display);
} 
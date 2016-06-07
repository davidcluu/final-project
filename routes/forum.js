var models = require("../models")

exports.view = function(req, res){
	var display = require("../public/data/forum-category.json")
	
 	res.render('forum', display);
}

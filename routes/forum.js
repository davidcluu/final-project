var models = require("../models");
var display = require("../public/data/forum-category.json")

exports.view = function(req, res){
	console.log(req.query);
	var display = require("../public/data/forum-category.json")
	
 	res.render('forum', display);
}

var models = require("../models");
var display = require("../public/data/forum-topics.json")

exports.view = function(req, res){
	console.log(res.query);
	
 	res.render('topic', display);
}

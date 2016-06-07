var models = require("../models")

exports.view = function(req, res){
	var display = require("../public/data/forum-category.json")

  models.RecentlyViewed
    .find()
    .limit(3)
    .sort({'date':-1})
    .exec(function(err, recentlyViewed) {
      display.recentlyViewed = recentlyViewed;

      res.render('forum', display);
    });
}

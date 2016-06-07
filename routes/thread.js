var models = require("../models");

exports.view = function(req,res) {
  var newRecentlyViewed = new models.RecentlyViewed({
    'threadName': req.query.thread,
    'threadURL': req.originalUrl
  });
  newRecentlyViewed.save();

  models.Thread
    .findOne({threadName : req.query.thread})
    .exec(function(err, thread) {
      models.Comment
        .find({thread : req.query.thread})
        .exec(function(err, comments) {
          models.RecentlyViewed
            .find()
            .limit(3)
            .sort({'date':-1})
            .exec(function(err, recentlyViewed) {
              var data = {
                "user": thread.user,
                "posted" : thread.posted,
                "threadTitle": thread.threadName,
                "threadContent": thread.content,
                "count": comments.length,
                "comments": comments.map( d =>
                  ({
                    'user': d.user,
                    'posted': d.posted,
                    'comment': d.content
                  }) ),
                "recentlyViewed": recentlyViewed
              }

              res.render('thread', data);
            })
        })
    });
}

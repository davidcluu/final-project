var models = require("../models");

exports.view = function(req,res) {
  models.Thread
    .findOne({threadName : req.query.thread})
    .exec(function(err, thread) {
      models.Comment
        .find({thread : req.query.thread})
        .exec(function(err, comments) {
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
              }) )
          }

          res.render('thread', data);
        })
    });
}

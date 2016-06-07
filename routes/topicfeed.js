var models = require("../models");

exports.view = function(req,res) {
  models.Thread
    .find({subCategory : req.query.topic})
    .exec(function(err, threads) {
      models.RecentlyViewed
        .find()
        .limit(3)
        .sort({'date':-1})
        .exec(function(err, recentlyViewed) {
          var data = {
            'topic-thread': threads.map( d =>
              ({
                'user': d.user,
                'threadName': d.threadName,
                'count': d.count,
                'url': d.subCategory.split(' ').map(d => d.toLowerCase()).join('-')
              }) ),
            'topic': req.query.topic,
            'breadcrumb': req.query.topic,
            'username': 'David Luu',
            'recentlyViewed': recentlyViewed
          }

          res.render('topicfeed', data);
        })
    });
}

var models = require("../models");

exports.view = function(req, res){
  var title = titleCase(req.query.cat)

  models.SubCategory
    .find({category : title})
    .exec(function(err, topic) {
      models.RecentlyViewed
      .find()
      .limit(3)
      .sort({'date':-1})
      .exec(function(err, recentlyViewed) {
        var data = {
          'topic': topic.map( d =>
            ({
              'user': d.user,
              'categoryName': d.subCategoryName,
              'count': d.count,
              'url': d.subCategoryName.split(' ').map(d => d.toLowerCase()).join('-')
            }) ),
          'breadcrumb': title,
          'topicTitle': title,
          'username': 'David Luu',
          'recentlyViewed': recentlyViewed
        }

        res.render('topic', data);
      })
    });
}

function titleCase(str) {
     str = str.toLowerCase().split(' ');

     for(var i = 0; i < str.length; i++){
          str[i] = str[i].split('');
          str[i][0] = str[i][0].toUpperCase();
          str[i] = str[i].join('');
     }
     return str.join(' ');
}

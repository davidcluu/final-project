var models = require("../models");
var display = require("../public/data/forum-topics.json")

exports.view = function(req, res){
  var title = titleCase(req.query.cat)

  models.SubCategory
    .find({category : title})
    .exec(function(err, topic) {
      var data = {
        'topic': topic.map( d =>
          ({
            'user': d.user,
            'categoryName': d.subCategoryName,
            'count': d.count,
            'url': d.subCategoryName.split(' ').map(d => d.toLowerCase()).join('-')
          }) ),
        'topicTitle': title,
        'username': 'David Luu'
      }

      res.render('topic', data);
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

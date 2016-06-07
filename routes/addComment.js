var models = require("../models");

exports.post = function(req, res) {
  var newComment = new models.Comment(req.body);
  newComment.save(function() {
    res.sendStatus(200);
  })
}

var models = require("../models");

exports.post = function(req, res) {
  var newThread = new models.Thread(req.body);
  newThread.save(function(err) {
    res.sendStatus(200);
  })
}

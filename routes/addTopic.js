var models = require("../models");

exports.post = function(req, res) {
  var newSubCategory = new models.SubCategory({
    'category': req.body.category,
    'subCategoryName': req.body.title,
    'user': req.body.username,
  });
  newSubCategory.save(function() {
    res.sendStatus(200);
  })
}

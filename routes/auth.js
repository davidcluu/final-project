var models = require("../models");

exports.createOrLoginFBUser = function(req, res) {
  var profile = req.body

  models.FBUser
    .findOne({"facebookID": profile.id}, function(err,user){
      if(err) console.error(err);

      // User not found
      if(!user) {
        var newUser = new models.FBUser({
          'facebookID': profile.id,
          'name': profile.name
        });
        newUser.save(function(err, user) {
          if(err) console.log(err);    
        });

        verifyLogin();
      }
      // Update user info
      else {
        user.facebookID = profile.id;
        user.name = profile.name;

        user.save();

        verifyLogin();
      }
    })

  function verifyLogin() {
    req.session.name = req.body.name;
    req.session.user_id = req.body.id;
  
    res.sendStatus(200)
  }
}

exports.logoutFBUser = function(req,res) {
  req.session.name = ''
  req.session.user_id = ''

  res.sendStatus(200)
}

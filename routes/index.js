exports.view = function(req, res){

  res.render('index');
}

exports.saveSess = function(req, res){
	sess = req.session;
//In this we are assigning email to sess.email variable.
//email comes from HTML page.
	sess.user_id=req.body.id;

	console.log(sess.user_id);

}
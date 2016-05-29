/* Dependencies */
var express = require('express');
var session = require('express-session');
var handlebars = require('express-handlebars');
var http = require('http');
var path = require('path');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var dotenv = require('dotenv');

var mongoose = require("mongoose");
var pg = require('pg');


/* App */
var app = express();


/* Client Secret */
dotenv.load();


/* Database */
var models = require("./models");
var db = mongoose.connection;
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://127.0.0.1/pollr');
db.on('error', function(){
  console.error('Mongo Error')
});
db.once('open', function(callback) {
    console.log("Mongo: Database connected successfully");
});

var conString = process.env.DATABASE_CONNECTION_URL;
var client = new pg.Client(conString);
client.connect(function(err) {
  if(err) {
    console.error('Postgres Error: Could not connect to database');
  }
  else {
    console.error('Postgres: Database connected successfully');
  }
});


/* Router */
var router = {
  index: require('./routes/index'),
  map: require('./routes/map'),
  //citysearch: require('./routes/citysearch'),
  auth: require('./routes/auth'),
  db: {
    setup: function(req,res,next) {
      req.dbclient = client;
      next();
    }
  }
};


/* HTML Template */
app.engine('html', handlebars({ extname: '.html' }));
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ secret: 'final project',
                  saveUninitialized: true,
                  resave: true}));



/* Port */
app.set('port', process.env.PORT || 3000);


/* Routes */
app.get('/', router.index.view);
app.get('/map', router.map.view);

app.post('/fblogin', router.auth.createOrLoginFBUser);
app.post('/fblogout', router.auth.logoutFBUser);


/* Listen on port */
http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

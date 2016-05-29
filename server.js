/* Dependencies */
var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express-handlebars');
var bodyParser = require('body-parser');
var session = require('express-session');
var dotenv = require('dotenv');
var pg = require('pg');


/* App */
var app = express();


/* Client Secret */
dotenv.load();


/* Database */
var conString = process.env.DATABASE_CONNECTION_URL;

var client = new pg.Client(conString);
client.connect(function(err) {
  if(err) {
    console.error('DB Error: Could not connect to database');
  }
});


/* Router */
var router = {
  index: require('./routes/index'),
  map: require('./routes/map'),
  results: require('./routes/results'),
  //citysearch: require('./routes/citysearch'),
  db: {
    setup: function(req,res,next) {
      req.dbclient = client;
      next();
    }
    //,access: require('./routes/db')
  }
};


/* HTML Template */
app.engine('html', handlebars({ extname: '.html' }));
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: 'final project',
                  saveUninitialized: true,
                  resave: true}));


/* Port */
app.set('port', process.env.PORT || 3000);


/* Routes */
app.get('/', router.index.view);
app.get('/map', router.map.view);
app.get('/results', router.results.view);


/* Listen on port */
http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

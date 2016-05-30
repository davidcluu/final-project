exports.queryPopulationByDistrict = function (req, res) {
  var query =
    "SELECT \"Area\", \"Gender\", \"Population\" " +
    "FROM cogs121_16_raw.hhsa_san_diego_demographics_county_popul_by_gender_2012_norm d " +
    "WHERE d.\"Area\" IN (" + Object.keys(SRAtoCD).map( d => ("'" + d + "'") ).join(", ") + ") " +
    "AND NOT \"Gender\" LIKE 'Any%'"

  req.dbclient.query(query, function(err, result) {
    if(err) tryReconnect(req, res, err)

    var json = {}
    Object.keys(SRAtoCD).forEach( function(d) { json[d] = {}; } )

    result.rows.forEach(function(d){
      json[d.Area][d.Gender] = d.Population
    })

    res.json(json);
  });
}

/* Helper Functions */

function tryReconnect(req, res, err) {
  console.error("DB Query Error");
  console.error(err);
  console.error("Trying reconnect");

  req.dbclient.end();
  req.dbclient.connect(function(err) {
    if(err) {
      console.error('DB Error: Could not connect to database');
      res.sendStatus(500);
      return
    }
  });
}


/* Hardcoded Stuff */

var SRAtoCD = {
  "Central SD" : [53],
  "Mid-City" : [53],
  "Southeast SD" : [51, 52],
  "Alpine" : [51],
  "El Cajon" : [50],
  "Harbison Crest" : [50],
  "Jamul" : [50, 51],
  "La Mesa" : [50, 53],
  "Laguna-Pine Valley" : [50],
  "Lakeside" : [50],
  "Lemon Grove" : [51],
  "Mountain Empire" : [50, 51],
  "Santee" : [50],
  "Spring Valley" : [53],
  "Coastal" : [52, 53],
  "Del Mar-Mira Mesa" : [52],
  "Elliott-Navajo" : [52],
  "Kearny Mesa" : [52, 53],
  "Miramar" : [52],
  "Peninsula" : [52],
  "University" : [49, 52],
  "Carlsbad" : [49],
  "Oceanside" : [49],
  "Pendleton" : [49],
  "San Dieguito" : [49, 50],
  "Vista" : [49],
  "Anza-Borrego Springs" : [50, 51],
  "Escondido" : [50],
  "Fallbrook" : [50],
  "North SD" : [49, 52],
  "Palomar-Julian" : [50],
  "Pauma" : [50],
  "Poway" : [50, 52],
  "Ramona" : [50],
  "San Marcos" : [50],
  "Valley Center" : [50],
  "Chula Vista" : [51],
  "Coronado" : [52],
  "National City" : [51],
  "South Bay" : [51],
  "Sweetwater" : [51, 53]
}

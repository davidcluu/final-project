exports.queryPopulationByAge = function (req, res) {
  var district = parseInt(req.query.district)
  var reducedSRAtoCDKeys = Object.keys(SRAtoCD).filter( d => SRAtoCD[d].indexOf(district) != -1 )

  var query =
    "SELECT \"Area\" AS area, \"Age\" AS age, \"Population\" AS population " +
    "FROM cogs121_16_raw.hhsa_san_diego_demographics_county_popul_by_age_2012_norm d " +
    "WHERE d.\"Area\" IN (" +
      reducedSRAtoCDKeys
        .map( d => ("'" + d + "'") )
        .join(", ")
    + ") " +
    "AND NOT \"Age\" LIKE 'Any%'"

  req.dbclient.query(query, function(err, result) {
    if(err) tryReconnect(req, res, err)

    var temp = {}
    result.rows.forEach( function(d) { temp[d.age] = temp[d.age] ? temp[d.age] + d.population : d.population } )

    var json = Object.keys(temp).map( (d) => ({label: d, count: temp[d]}) )

    res.json(json)
  });
}

exports.queryPopulationByGender = function (req, res) {
  var district = parseInt(req.query.district)
  var reducedSRAtoCDKeys = Object.keys(SRAtoCD).filter( d => SRAtoCD[d].indexOf(district) != -1 )

  var query =
    "SELECT \"Area\" AS area, \"Gender\" AS gender, \"Population\" AS population " +
    "FROM cogs121_16_raw.hhsa_san_diego_demographics_county_popul_by_gender_2012_norm d " +
    "WHERE d.\"Area\" IN (" +
      reducedSRAtoCDKeys
        .map( d => ("'" + d + "'") )
        .join(", ")
    + ") " +
    "AND NOT \"Gender\" LIKE 'Any%'"

  req.dbclient.query(query, function(err, result) {
    if(err) tryReconnect(req, res, err)

    var temp = {}
    result.rows.forEach( function(d) { temp[d.gender] = temp[d.gender] ? temp[d.gender] + d.population : d.population } )

    var json = Object.keys(temp).map( (d) => ({label: d, count: temp[d]}) )

    res.json(json)
  });
}

exports.queryPopulationByRace = function (req, res) {
  var district = parseInt(req.query.district)
  var reducedSRAtoCDKeys = Object.keys(SRAtoCD).filter( d => SRAtoCD[d].indexOf(district) != -1 )

  var query =
    "SELECT \"Area\" AS area, \"Race\" AS race, \"Population\" AS population " +
    "FROM cogs121_16_raw.hhsa_san_diego_demographics_county_popul_by_race_2012_norm d " +
    "WHERE d.\"Area\" IN (" +
      reducedSRAtoCDKeys
        .map( d => ("'" + d + "'") )
        .join(", ")
    + ") " +
    "AND NOT \"Race\" LIKE 'Any%'"

  req.dbclient.query(query, function(err, result) {
    if(err) tryReconnect(req, res, err)

    var temp = {}
    result.rows.forEach( function(d) { temp[d.race] = temp[d.race] ? temp[d.race] + d.population : d.population } )

    var json = Object.keys(temp).map( (d) => ({label: d, count: temp[d]}) )

    res.json(json)
  });
}

exports.queryCrime = function (req, res) {
  var district = parseInt(req.query.district)
  var reducedSRAtoCDKeys = Object.keys(SRAtoCD).filter( d => SRAtoCD[d].indexOf(district) != -1 )

  var query =
    "SELECT zip, COUNT(*) " +
    "FROM cogs121_16_raw.arjis_crimes " +
    "GROUP BY zip";

  req.dbclient.query(query, function(err,result) {
    if(err) tryReconnect(req, res, err)

    var districtTotal = 0
    var total = 0
    result.rows.forEach( function(d) {
      total = total + parseInt(d.count)
      if (CDtoZip[district.toString()].indexOf(parseInt(d.zip)) > -1) {
        districtTotal = districtTotal + parseInt(d.count)
      }
    } )

    var json = [
      {label: ('District ' + district), count: districtTotal},
      {label: 'SD Total', count: total}
    ]

    res.json(json)
  })
}

exports.queryPopulationByEducation = function (req, res) {
  var district = parseInt(req.query.district)
  var reducedSRAtoCDKeys = Object.keys(SRAtoCD).filter( d => SRAtoCD[d].indexOf(district) != -1 )

  var query =
     "SELECT \"Area\" AS area, \"Education\" AS education, \"Population\" AS population " +
    "FROM cogs121_16_raw.hhsa_san_diego_demographics_education_2012_norm d " +
    "WHERE d.\"Area\" IN (" +
      reducedSRAtoCDKeys
        .map( d => ("'" + d + "'") )
        .join(", ")
    + ") " +
    "AND ( \"Education\" LIKE '%- Total%')" +
    "AND NOT \"Education\" LIKE 'Any%'"

  req.dbclient.query(query, function(err, result) {
    if(err) tryReconnect(req, res, err)

    var temp = {}
    result.rows.forEach( function(d) { temp[d.education] = temp[d.education] ? temp[d.education] + d.population : d.population } )

    var json = Object.keys(temp).map( (d) => ({label: d, count: temp[d]}) )

    res.json(json)
  });
}

exports.queryPopulationByTypeEducation = function (req, res) {
  var district = parseInt(req.query.district)
  var reducedSRAtoCDKeys = Object.keys(SRAtoCD).filter( d => SRAtoCD[d].indexOf(district) != -1 )

  var query =
     "SELECT \"Area\" AS area, \"Education\" AS education, \"Population\" AS population " +
    "FROM cogs121_16_raw.hhsa_san_diego_demographics_education_2012_norm d " +
    "WHERE d.\"Area\" IN (" +
      reducedSRAtoCDKeys
        .map( d => ("'" + d + "'") )
        .join(", ")
    + ") " +
    "AND ( \"Education\" LIKE 'Total%')" +
    "AND NOT \"Education\" LIKE 'Any%'"

  req.dbclient.query(query, function(err, result) {
    if(err) tryReconnect(req, res, err)

    var temp = {}
    result.rows.forEach( function(d) { temp[d.education] = temp[d.education] ? temp[d.education] + d.population : d.population } )

    var json = Object.keys(temp).map( (d) => ({label: d, count: temp[d]}) )

    res.json(json)
  });
}

exports.queryPopulationByLanguages = function (req, res) {
  var district = parseInt(req.query.district)
  var reducedSRAtoCDKeys = Object.keys(SRAtoCD).filter( d => SRAtoCD[d].indexOf(district) != -1 )

  var query =
     "SELECT \"Area\" AS area, \"Languages Spoken\" AS languages, \"Population\" AS population " +
    "FROM cogs121_16_raw.hhsa_san_diego_demographics_languages_2012_norm d " +
    "WHERE d.\"Area\" IN (" +
      reducedSRAtoCDKeys
        .map( d => ("'" + d + "'") )
        .join(", ")
    + ") " +
    "AND \"Languages Spoken\" = 'Speak only English' OR \"Languages Spoken\" = 'Speak Spanish - Total' OR \"Languages Spoken\" = 'Speak API language - Total' OR \"Languages Spoken\" = 'Speak other language - Total'" +
    "AND NOT \"Languages Spoken\" LIKE 'Any%'"

  req.dbclient.query(query, function(err, result) {
    if(err) tryReconnect(req, res, err)

    var temp = {}
    result.rows.forEach( function(d) { temp[d.languages] = temp[d.languages] ? temp[d.languages] + d.population : d.population } )

    var json = Object.keys(temp).map( (d) => ({label: d, count: temp[d]}) )

    res.json(json)
  });
}

exports.queryMedicalSpending = function (req, res) {
  var district = parseInt(req.query.district)
  var reducedSRAtoCDKeys = Object.keys(capsSRAtoCD).filter( d => capsSRAtoCD[d].indexOf(district) != -1 )

  var query =
     "SELECT \"SRA\" as area, \"Expenditure Type\" as expenditures, \"Average Amount Spent\" AS amount " +
    "FROM cogs121_16_raw.esri_consumer_expenditure_medical d " +
    "WHERE d.\"SRA\" IN (" +
      reducedSRAtoCDKeys
        .map( d => ("'" + d + "'") )
        .join(", ")
    + ") " +
    "AND (\"Expenditure Type\" LIKE '%Care - Total%')" +
    "AND NOT \"Expenditure Type\" LIKE 'Any%'"

  req.dbclient.query(query, function(err, result) {    console.log(json);
    if(err) tryReconnect(req, res, err)

    var temp = {}
    result.rows.forEach( function(d) { temp[d.expenditures] = temp[d.expenditures] ? temp[d.expenditures] + d.amount : d.amount } )

    var json = Object.keys(temp).map( (d) => ({label: d, count: temp[d]}) )

    console.log(req);

    res.json(json)
  });
}

exports.queryMedicalServicesSpending = function (req, res) {
  var district = parseInt(req.query.district)
  var reducedSRAtoCDKeys = Object.keys(capsSRAtoCD).filter( d => capsSRAtoCD[d].indexOf(district) != -1 )

  var query =
     "SELECT \"SRA\" as area, \"Expenditure Type\" as expenditures, \"Average Amount Spent\" AS amount " +
    "FROM cogs121_16_raw.esri_consumer_expenditure_medical d " +
    "WHERE d.\"SRA\" IN (" +
      reducedSRAtoCDKeys
        .map( d => ("'" + d + "'") )
        .join(", ")
    + ") " +
    "AND \"Expenditure Type\" LIKE 'Medical Care%' AND NOT \"Expenditure Type\" LIKE '%- Total'" +
    "AND NOT \"Expenditure Type\" LIKE 'Any%'"

  req.dbclient.query(query, function(err, result) {    console.log(json);
    if(err) tryReconnect(req, res, err)

    var temp = {}
    result.rows.forEach( function(d) { temp[d.expenditures] = temp[d.expenditures] ? temp[d.expenditures] + d.amount : d.amount } )

    var json = Object.keys(temp).map( (d) => ({label: d, count: temp[d]}) )

    console.log(req);

    res.json(json)
  });
}

exports.queryHealthInsuranceSpending = function (req, res) {
  var district = parseInt(req.query.district)
  var reducedSRAtoCDKeys = Object.keys(capsSRAtoCD).filter( d => capsSRAtoCD[d].indexOf(district) != -1 )

  var query =
     "SELECT \"SRA\" as area, \"Expenditure Type\" as expenditures, \"Average Amount Spent\" AS amount " +
    "FROM cogs121_16_raw.esri_consumer_expenditure_medical d " +
    "WHERE d.\"SRA\" IN (" +
      reducedSRAtoCDKeys
        .map( d => ("'" + d + "'") )
        .join(", ")
    + ") " +
    "AND \"Expenditure Type\" LIKE 'Health Insurance%' AND NOT \"Expenditure Type\" LIKE '%- Total'" +
    "AND NOT \"Expenditure Type\" LIKE 'Any%'"

  req.dbclient.query(query, function(err, result) {    console.log(json);
    if(err) tryReconnect(req, res, err)

    var temp = {}
    result.rows.forEach( function(d) { temp[d.expenditures] = temp[d.expenditures] ? temp[d.expenditures] + d.amount : d.amount } )

    var json = Object.keys(temp).map( (d) => ({label: d, count: temp[d]}) )

    console.log(req);

    res.json(json)
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

var capsSRAtoCD = {
  "CENTRAL SD" : [53],
  "MID-CITY" : [53],
  "SOUTHEAST SD" : [51, 52],
  "ALPINE" : [51],
  "EL CAJON" : [50],
  "HARBISON CREST" : [50],
  "JAMUL" : [50, 51],
  "LA MESA" : [50, 53],
  "LAGUNA-PINE VALLEY" : [50],
  "LAKESIDE" : [50],
  "LEMON GROVE" : [51],
  "MOUNTAIN EMPIRE" : [50, 51],
  "SANTEE" : [50],
  "SPRING VALLEY" : [53],
  "COASTAL" : [52, 53],
  "DEL MAR-MIRA MESA" : [52],
  "ELLIOTT-NAVAJO" : [52],
  "KEARNY MESA" : [52, 53],
  "MIRAMAR" : [52],
  "PENINSULA" : [52],
  "UNIVERSITY" : [49, 52],
  "CARLSBAD" : [49],
  "OCEANSIDE" : [49],
  "PENDLETON" : [49],
  "SAN DIEGUITO" : [49, 50],
  "VISTA" : [49],
  "ANZA-BORREGO SPRINGS" : [50, 51],
  "ESCONDIDO" : [50],
  "FALLBROOK" : [50],
  "NORTH SD" : [49, 52],
  "PALOMAR-JULIAN" : [50],
  "PAUMA" : [50],
  "POWAY" : [50, 52],
  "RAMONA" : [50],
  "SAN MARCOS" : [50],
  "VALLEY CENTER" : [50],
  "CHULA VISTA" : [51],
  "CORONADO" : [52],
  "NATIONAL CITY" : [51],
  "SOUTH BAY" : [51],
  "SWEETWATER" : [51, 53]
}

var CDtoZip = {
  49: [92007, 92008, 92010, 92011, 92054, 92055, 92056, 92057, 92058, 92081, 92083, 92091, 92624, 92672, 92673, 92694],
  50: [91916, 91948, 92096, 92036, 92040, 92059, 92060, 92061, 92066, 92069, 92070, 92082, 92086],
  51: [91906, 91917, 91934, 91950, 91963, 91980, 92173, 92222, 92227, 92231, 92233, 92243, 92249, 92250, 92251, 92257, 92259, 92266, 92273, 92275, 92281, 92283],
  52: [92106, 92107, 92109, 92117, 92118, 92122, 92126, 92128, 92129, 92131, 92132, 92135, 92140, 92145, 92147, 92155],
  53: [91913, 91942, 91977, 92103, 92116, 92134]
}

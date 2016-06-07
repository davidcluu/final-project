/**
 * OnReady
 */

var currentDistrict = -1;

(function() {
  $('#demographics').click(handleDemographics);
  $('#politics').click(handlePolitics);
  $('#health').click(handleHealth);
  $('#crime').click(handleCrime);
  

  $('#search-btn').click(function(e) {
    e.preventDefault();

    var searchVal = $('#search-field').val();
    var cds = SRAtoCD[searchVal];

    if (!cds) {
      console.log('error');
    }
    else {
      console.log()
      $('#6' + cds[0]).click();
    }

    $('#search-field').val('');
  });

  drawMap();
})();


/**
 * Main Draw/Update Function
 */

function drawMap() {
    var parentWidth = $('#map').width(),
      parentHeight = window.innerHeight;

  var margin = 50,
      width = parentWidth - (2 * margin),
      height = parentHeight - (2 * margin);

  var svg = d3.select('#map').append('svg')
            .attr('width', width)
            .attr('height', height);

  queue()
    .defer(d3.json, '/data/sd.json')
    .defer(d3.json, '/data/ca-congress-114.json')
    .await(mapReady);

  function mapReady(err, sd, congress) {
    if (err) console.error(err);

    /* Retrieve features from the sd object */
    var sdgeo = topojson.feature(sd, sd.objects.land);

    /* Calculate the center of sd, guess scale and offset */
    var center = d3.geo.centroid(sdgeo);
    var scale = 150;
    var offset = [width/2, height/2];
    var projection = d3.geo.mercator()
                        .scale(scale)
                        .center(center)
                        .translate(offset);

    var path = d3.geo.path()
                  .projection(projection);

    var path = d3.geo.path()
      .projection(projection);

    /* Use calculated results to fix offset and scale */
    var bounds = path.bounds(sdgeo);
    var hscale = scale*width  / (bounds[1][0] - bounds[0][0]);
    var vscale = scale*height / (bounds[1][1] - bounds[0][1]);
    var scale  = (hscale < vscale) ? hscale : vscale;
    var offset  = [width + margin - (bounds[0][0] + bounds[1][0])/2,
                   height + margin - (bounds[0][1] + bounds[1][1])/2];

    projection = d3.geo.mercator()
                    .center(center)
                    .scale(scale)
                    .translate(offset);

    path = path.projection(projection);

    /* Filter out congress districts we don't want */
    congress.objects.districts.geometries = congress.objects.districts.geometries.filter(filterDistricts)

    /* Define the clipping area */
    svg.append('defs').append('path')
        .attr('id', 'land')
        .datum(sdgeo)
        .attr('d', path);

    svg.append('clipPath')
        .attr('id', 'clip-land')
      .append('use')
        .attr('xlink:href', '#land');

    /* Draw political districts */
    svg.append('g')
        .attr('class', 'districts')
        .attr('clip-path', 'url(#clip-land)')
      .selectAll('path')
        .data(topojson.feature(congress, congress.objects.districts).features)
      .enter()
        .append('path')
          .attr('d', path)
          .attr('id', d => d.id)
          .attr('class', 'district')
          .attr('title', d => d.id)
          .attr('onclick', 'district_onClick(this)')
          .attr('onmouseover', 'district_onMouseOver(this)')
          .attr('onmouseout', 'district_onMouseOut(this)')
          .style('fill', district_defaultFill)
          .style('cursor', 'pointer');

    /* Draw political district boundries */
    svg.append('path')
        .attr('class', 'district-boundaries')
        .datum(topojson.mesh(congress, congress.objects.districts, (a, b) => (a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0)) ))
        .attr('d', path);

    /* Map labels */
    svg.selectAll('.district-label')
      .data(topojson.feature(congress, congress.objects.districts).features)
      .enter().append('text')
        .attr('class', d => ('district-label ' + d.id) )
        .attr('transform', d => ('translate(' + path.centroid(d) + ')') )
        .style('display', 'none')
        .text(d => d.id.toString().slice(-2))
  }

  filterDistricts = (d) => (d.id >= 649 && d.id <= 653);
  $('#init-message').append("<h2>Let\'s get started.</h2><br><p>Click a congressional on the right to see its corresponding statistical data. Data includes political, demographical, health, and crime statistics.</p>");
  $('#help-btn').append("<button id=\"help\" type=\"text\" class=> How did we chose our datasets?");
}


/**
 * Helper Functions
 */

function drawDonut(id, title, data, color, speed) {
  /* Donut Chart */
  var donutWidth = $('#' + id).width(),
      innerWidth = donutWidth / 5,
      donutHeight = donutWidth,
      radius = donutWidth / 2,
      legendRectSize = 18,
      legendSpacing = 4;

  var arc = d3.svg.arc()
              .innerRadius(radius - innerWidth)
              .outerRadius(radius);

  var pie = d3.layout.pie()
    .sort(null)
    .value( d => d.count );

  var svg = d3.select('#' + id)
              .append('svg')
                .attr('width', donutWidth)
                .attr('height', (donutHeight) + ((legendRectSize + legendSpacing) * data.length) + 20)
              .append('g')
                .attr('transform', 'translate(' + (donutWidth / 2) + ',' + (donutHeight / 2) + ')');

  var path = svg.selectAll('path')
                .data(pie(data))
                .enter().append('path')
                  .attr('d', arc)
                  .attr('fill', (_, i) => color(i) )
                  .on('mouseover', d => $('#' + id + ' .title').text(d.data.label) )
                  .on('mouseout', d => $('#' + id + ' .title').text(title) )
                .transition()
                  .duration(speed)
                  .attrTween('d', tweenDonut);

  function tweenDonut(finish) {
    var start = {
      startAngle: 0,
      endAngle: 0
    };
    var i = d3.interpolate(start, finish);
    return d => arc(i(d));
  }

  /* Title */

  svg.append('text')
    .attr('class', 'title')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .text(title);

  /* Legend */

  var legend = svg.selectAll('#' + id + ' .legend')
                  .data(data)
                  .enter().append('g')
                    .attr('class', 'legend')
                    .attr('transform', (d, i) => ('translate(' + -(donutWidth / 2) + ',' + (donutHeight / 2 + (i * (legendRectSize + legendSpacing)) + 20) + ')') );

  legend.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', (d,i) => color(i) )
    .style('stroke', (d,i) => color(i) );

  legend.append('text')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize - legendSpacing)
    .text( d => d.label );
}


/**
 * Interaction Functions
 */

var district_defaultFill = 'rgba(255,255,255,0.3)'
var district_defaultMouseoverFill = {
  6 : {
    49 : 'rgba(0,0,0,0.3)',
    50 : 'rgba(0,0,0,0.3)',
    51 : 'rgba(0,0,0,0.3)',
    52 : 'rgba(0,0,0,0.3)',
    53 : 'rgba(0,0,0,0.3)'
  }
}

var district_mouseoverFill = district_defaultMouseoverFill;

function district_onMouseOver(me) {
  var $me = $(me)
  var geoId = district_getGeoId($me)

  $me.css('fill', district_mouseoverFill[geoId.state][geoId.district]);
  $('.district-label.' + geoId.state + geoId.district)
    .css('display', 'initial');
}

function district_onMouseOut(me) {
  var $me = $(me)
  var geoId = district_getGeoId($me)

  $me.css('fill', district_defaultFill)
  $('.district-label.' + geoId.state + geoId.district)
    .css('display', 'none');
}

function district_onClick(me) {
  var $me = $(me)
  var district = district_getGeoId($me).district

  if ($me.hasClass('currentDistrict')) {
    return;
  }

  $('.currentDistrict').css('cursor', 'pointer')
  $('.currentDistrict').removeClass('currentDistrict')

  $me.css('cursor', '')
  $me.addClass('currentDistrict')

  currentDistrict = district_getGeoId($me).district

  $.post('/getLegislator', { district : district}, function(response) {
    var district = response.legislator.district
    switch (district) {
      case 49:
      case 50:
        $('#rep-cd').text(district + 'th')
        break
      case 51:
        $('#rep-cd').text(district + 'st')
        break
      case 52:
        $('#rep-cd').text(district + 'nd')
        break
      case 53:
        $('#rep-cd').text(district + 'rd')
        break
      default:
        console.error('District not in range!')
    }

    $('#rep-firstname').text(response.legislator.first_name)

    $('#rep-lastname').text(response.legislator.last_name)

    $('#district-population').text(districtPopulation[district]);

    var party = response.legislator.party
    switch (party) {
      case 'D':
        $('#rep-party').text('Democratic')
        break
      case 'R':
        $('#rep-party').text('Republican')
        break
      default:
        console.error('District not in range!')
    }
  });

  queue()
    .defer(d3.json, '/delphiData/getPopulationByAge?district=' + district)
    .defer(d3.json, '/delphiData/getPopulationByGender?district=' + district)
    .defer(d3.json, '/delphiData/getPopulationByRace?district=' + district)
    .defer(d3.json, '/delphiData/getPopulationByEducation?district=' + district)
    .defer(d3.json, '/delphiData/getPopulationByTypeEducation?district=' + district)
    .defer(d3.json, '/delphiData/getPopulationByLanguages?district=' + district)
    .await(chartReady);

  function chartReady(err, data1, data2, data3, data4, data5, data7, data8) {
    if (err) console.error(err);

    $('#chart1').empty()
    $('#chart2').empty()
    $('#chart3').empty()
    $('#chart4').empty()
    $('#chart5').empty()
    $('#chart7').empty()
    
    $('#init-message').empty()

    drawDonut('chart1', 'Age', data1, d3.scale.linear().interpolate(d3.interpolateRgb).domain([0, data1.length - 1]).range(['#48fbd7', '#e584f1']), 2000);
    drawDonut('chart2', 'Gender', data2, d3.scale.linear().interpolate(d3.interpolateRgb).domain([0, data2.length - 1]).range(['#48fbd7', '#e584f1']), 2000);
    drawDonut('chart3', 'Race', data3, d3.scale.linear().interpolate(d3.interpolateRgb).domain([0, data3.length - 1]).range(['#48fbd7', '#e584f1']), 2000);
    drawDonut('chart4', 'Education', data4, d3.scale.linear().interpolate(d3.interpolateRgb).domain([0, data4.length - 1]).range(['#48fbd7', '#e584f1']), 2000);
    drawDonut('chart5', 'Type of Education', data5, d3.scale.linear().interpolate(d3.interpolateRgb).domain([0, data5.length - 1]).range(['#48fbd7', '#e584f1']), 2000);
    drawDonut('chart7', 'Languages', data7, d3.scale.linear().interpolate(d3.interpolateRgb).domain([0, data7.length - 1]).range(['#48fbd7', '#e584f1']), 2000);
  }
}

function district_getGeoId(obj) {
  // obj.attr('class') = "district (district $)"
  var geoid = obj.attr('id')
  var state = geoid.slice(0,-2)
  var district = geoid.slice(-2)

  return { state: parseInt(state), district: parseInt(district) };
}

function handleDemographics() {
  if (currentDistrict == -1)
    return;

  queue()
    .defer(d3.json, '/delphiData/getPopulationByAge?district=' + currentDistrict)
    .defer(d3.json, '/delphiData/getPopulationByGender?district=' + currentDistrict)
    .defer(d3.json, '/delphiData/getPopulationByRace?district=' + currentDistrict)
    .defer(d3.json, '/delphiData/getPopulationByEducation?district=' + currentDistrict)
    .defer(d3.json, '/delphiData/getPopulationByTypeEducation?district=' + currentDistrict)
    .defer(d3.json, '/delphiData/getPopulationByLanguages?district=' + currentDistrict)
    .await(chartReady);

  function chartReady(err, data1, data2, data3, data4, data5, data7) {
    if (err) console.error(err);

    $('#chart1').empty()
    $('#chart2').empty()
    $('#chart3').empty()
    $('#chart4').empty()
    $('#chart5').empty()
    $('#chart7').empty()

    $('#init-message').empty()

    drawDonut('chart1', 'Age', data1, d3.scale.linear().interpolate(d3.interpolateRgb).domain([0, data1.length - 1]).range(['#48fbd7', '#e584f1']), 2000);
    drawDonut('chart2', 'Gender', data2, d3.scale.linear().interpolate(d3.interpolateRgb).domain([0, data2.length - 1]).range(['#48fbd7', '#e584f1']), 2000);
    drawDonut('chart3', 'Race', data3, d3.scale.linear().interpolate(d3.interpolateRgb).domain([0, data3.length - 1]).range(['#48fbd7', '#e584f1']), 2000);
    drawDonut('chart4', 'Education', data4, d3.scale.linear().interpolate(d3.interpolateRgb).domain([0, data4.length - 1]).range(['#48fbd7', '#e584f1']), 2000);
    drawDonut('chart5', 'Type of Education', data5, d3.scale.linear().interpolate(d3.interpolateRgb).domain([0, data5.length - 1]).range(['#48fbd7', '#e584f1']), 2000);
    drawDonut('chart7', 'Languages', data7, d3.scale.linear().interpolate(d3.interpolateRgb).domain([0, data7.length - 1]).range(['#48fbd7', '#e584f1']), 2000);
  }
}

function handlePolitics() {
  if (currentDistrict == -1)
    return;

  queue()
    .defer(d3.json, '/data/affiliations.json')
    .await(chartReady);

  function chartReady(err, data1) {
    if (err) console.error(err);

    $('#chart1').empty()
    $('#chart2').empty()
    $('#chart3').empty()
    $('#chart4').empty()
    $('#chart5').empty()
    $('#chart7').empty()

    $('#init-message').empty()

    var data1_cd = data1[currentDistrict]
    var data1Normalized = []
    $.each(data1_cd, function(d) {
      data1Normalized.push({label: d, count: data1_cd[d] * 1000});
    });

   
    drawDonut('chart1', 'Preference', data1Normalized, d3.scale.linear().interpolate(d3.interpolateRgb).domain([0, data1Normalized.length - 1]).range(['#48fbd7', '#e584f1']), 2000);
  }
}

function handleHealth() {
  if (currentDistrict == -1)
    return;

  queue()
    .defer(d3.json, '/delphiData/getPopulationByAge?district=' + currentDistrict)
    .defer(d3.json, '/delphiData/getPopulationByGender?district=' + currentDistrict)
    .defer(d3.json, '/delphiData/getPopulationByRace?district=' + currentDistrict)
    .await(chartReady);

  function chartReady(err, data1, data2, data3) {
    if (err) console.error(err);

    $('#chart1').empty()
    $('#chart2').empty()
    $('#chart3').empty()
    $('#chart4').empty()
    $('#chart5').empty()
    $('#chart7').empty()

    $('#init-message').empty()

    drawDonut('chart1', 'Age', data1, d3.scale.linear().interpolate(d3.interpolateRgb).domain([0, data1.length - 1]).range(['#48fbd7', '#e584f1']), 2000);
    drawDonut('chart2', 'Gender', data2, d3.scale.linear().interpolate(d3.interpolateRgb).domain([0, data2.length - 1]).range(['#48fbd7', '#e584f1']), 2000);
    drawDonut('chart3', 'Race', data3, d3.scale.linear().interpolate(d3.interpolateRgb).domain([0, data3.length - 1]).range(['#48fbd7', '#e584f1']), 2000);
  }

  console.log('health');
}

function handleCrime() {
  if (currentDistrict == -1)
    return;

  queue()
    .defer(d3.json, '/delphiData/getCrime?district=' + currentDistrict)
    .await(chartReady);

  function chartReady(err, data1) {
    if (err) console.error(err);

    $('#chart1').empty()
    $('#chart2').empty()
    $('#chart3').empty()
    $('#chart4').empty()
    $('#chart5').empty()
    $('#chart7').empty()

    $('#init-message').empty()
   
    drawDonut('chart1', 'Crime', data1, d3.scale.linear().interpolate(d3.interpolateRgb).domain([0, data1.length - 1]).range(['#48fbd7', '#e584f1']), 2000);
  }
}

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

var districtPopulation = {
  '49' : '717,823',
  '50' : '730,427',
  '51' : '743,982',
  '52' : '713,904',
  '53' : '741,909'
}

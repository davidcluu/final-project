/**
 * OnReady
 */

(function() {
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
  }

  filterDistricts = (d) => (d.id >= 649 && d.id <= 653);
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
                  .attrTween('d', tweenDonut)
                  .each('end', function() {console.log('done')} );

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
}

function district_onMouseOut(me) {
  var $me = $(me)
  var geoId = district_getGeoId($me)

  $me.css('fill', district_defaultFill)
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

    var district = response.legislator.party
    switch (district) {
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
    .await(chartReady);

  function chartReady(err, data1, data2, data3) {
    if (err) console.error(err);

    $('#chart1').empty()
    $('#chart2').empty()
    $('#chart3').empty()

    drawDonut('chart1', 'Age', data1, d3.scale.linear().interpolate(d3.interpolateRgb).domain([0, data1.length - 1]).range(['#48fbd7', '#e584f1']), 2000);
    drawDonut('chart2', 'Gender', data2, d3.scale.linear().interpolate(d3.interpolateRgb).domain([0, data2.length - 1]).range(['#48fbd7', '#e584f1']), 2000);
    drawDonut('chart3', 'Race', data3, d3.scale.linear().interpolate(d3.interpolateRgb).domain([0, data3.length - 1]).range(['#48fbd7', '#e584f1']), 2000);
  }
}

function district_getGeoId(obj) {
  // obj.attr('class') = "district (district $)"
  var geoid = obj.attr('id')
  var state = geoid.slice(0,-2)
  var district = geoid.slice(-2)

  return { state: parseInt(state), district: parseInt(district) };
}

/**
 * OnReady
 */

(function() {
  drawMap()
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
          .style('cursor', 'pointer')

    /* Draw political district boundries */
    svg.append('path')
        .attr('class', 'district-boundaries')
        .datum(topojson.mesh(congress, congress.objects.districts, (a, b) => (a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0)) ))
        .attr('d', path);
  }

  function filterDistricts(d) {
    return d.id >= 649 && d.id <= 653
  }
}


/**
 * Helper Functions
 */

function drawDonut(id, data, color, speed) {
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
                .attr('height', donutHeight / 2 + (legendRectSize + legendRectSize) * 6)
              .append('g')
                .attr('transform', 'translate(' + (donutWidth / 2) + ',' + (donutHeight / 2) + ')');

  var path = svg.selectAll('path')
                .data(pie(data))
                .enter().append('path')
                  .attr('d', arc)
                  .attr('fill', (_, i) => color(i) )
                  .on('mouseover', (d) => console.log(d.data.label) )
                  .on('mouseout', (d) => console.log('') )
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

  var legend = svg.selectAll('#' + id + ' .legend')
                  .data(data)
                  .enter().append('g')
                    .attr('class', 'legend')
                    .attr('transform', function(d, i) {
                      var height = legendRectSize + legendSpacing;
                      var dx = -(donutWidth / 2);
                      var dy = donutHeight / 2 + i * height + 20;
                      return 'translate(' + dx + ',' + dy + ')';
                    });

  legend.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', (d,i) => color(i))
    .style('stroke', (d,i) => color(i));

  legend.append('text')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize - legendSpacing)
    .text(function(d) { return d.label });
}


/**
 * Interaction Functions
 */

var district_defaultFill = '#ddd'
var district_defaultMouseoverFill = {
  6 : {
    49 : '#888',
    50 : '#888',
    51 : '#888',
    52 : '#888',
    53 : '#888'
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

    drawDonut('chart1', data1, d3.scale.linear().interpolate(d3.interpolateRgb).domain([0, data1.length - 1]).range(['#48fbd7', '#e584f1']), 2000);
    drawDonut('chart2', data2, d3.scale.linear().interpolate(d3.interpolateRgb).domain([0, data2.length - 1]).range(['#48fbd7', '#e584f1']), 2000);
    drawDonut('chart3', data3, d3.scale.linear().interpolate(d3.interpolateRgb).domain([0, data3.length - 1]).range(['#48fbd7', '#e584f1']), 2000);
  }
}

function district_getGeoId(obj) {
  // obj.attr('class') = "district (district $)"
  var geoid = obj.attr('id')
  var state = geoid.slice(0,-2)
  var district = geoid.slice(-2)

  return { state: parseInt(state), district: parseInt(district) }
}

var width = 960,
    height = 600;

queue()
    .defer(d3.json, "/data/sd.json")
    .defer(d3.json, "/data/ca-congress-114.json")
    .await(ready);

function ready(error, sd, congress) {
  if (error) throw error;

  var sdgeo = topojson.feature(sd, sd.objects.land);

  var center = d3.geo.centroid(sdgeo);
  var scale = 25000;
  var offset = [width/2, height/2];
  var projection = d3.geo.mercator()
                      .scale(scale)
                      .center(center)
                      .translate(offset);

  var path = d3.geo.path()
    .projection(projection);


  var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

  svg.append("defs").append("path")
      .attr("id", "land")
      .datum(sdgeo)
      .attr("d", path);

  svg.append("clipPath")
      .attr("id", "clip-land")
    .append("use")
      .attr("xlink:href", "#land");

  svg.append("g")
      .attr("class", "districts")
      .attr("clip-path", "url(#clip-land)")
    .selectAll("path")
      .data(topojson.feature(congress, congress.objects.districts).features)
    .enter().append("path")
      .attr("d", path)
    .append("title")
      .text(function(d) { return d.id; });

  svg.append("path")
      .attr("class", "district-boundaries")
      .datum(topojson.mesh(congress, congress.objects.districts, function(a, b) { return a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0); }))
      .attr("d", path);

/*  svg.append("path")
      .attr("class", "state-boundaries")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("d", path);*/
}

d3.select(self.frameElement).style("height", height + "px");

function setup() {
  var width = 3000;
  var height = 1000;
  createCanvas(width, height, SVG);
  draw_rainbow_background(0);
  noStroke();
  strokeWeight(1);
  fill(0);

  var vertices = d3.range(100).map(function (d) {
    return [int(Math.random() * width), int(Math.random() * height)];
  });
  var voronoi = d3.geom.voronoi().clipExtent([
    [0, 0],
    [width, height],
  ]);

  // create polygons using d3.js voronoi diagram
  var polygons = voronoi(vertices);

  var full_links = voronoi.links(vertices);
  var inner_polygons = get_inner_polygons(polygons);
  var links = get_links(vertices, full_links, inner_polygons);
  var midpoints = get_midpoints(polygons);

  pop();
  // draw polygons
  for (var j = 0; j < polygons.length; j++) {
    var apolygon = polygons[j];
    var root_vertex = vertices[j];
    var midpoint = midpoints[j];
    if (!inner_polygons[j]) {
      continue;
    }

    //ellipse(midpoint[0], midpoint[1], 5, 5);

    beginShape();
    for (var k = 0; k < apolygon.length; k++) {
      var v = apolygon[k];
      //ellipse(v[0], v[1], 5, 5);

      var vect = createVector(v[0] - midpoint[0], v[1] - midpoint[1]);

      vect.setMag(vect.mag() - 10);

      var vx = vect.x + midpoint[0];
      var vy = vect.y + midpoint[1];

      vertex(vx, vy);
    }
    endShape(CLOSE);
  }

  // draw circles.
}

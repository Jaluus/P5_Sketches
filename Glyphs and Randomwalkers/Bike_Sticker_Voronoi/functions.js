function get_links(vertices, links, inner_polygons) {
  var links_per_root = [];
  for (var i = 0; i < vertices.length; i++) {
    if (!inner_polygons[i]) {
      links_per_root.push([]);
      continue;
    }

    var rv = vertices[i];

    var links_for_root = [];

    for (var j = 0; j < links.length; j++) {
      var ln = links[j];
      if (ln.source[0] == rv[0] && ln.source[1] == rv[1]) {
        links_for_root.push([ln.source, ln.target]);
      }
      if (ln.target[0] == rv[0] && ln.target[1] == rv[1]) {
        links_for_root.push([ln.target, ln.source]);
      }
    }
    links_per_root.push(links_for_root);
  }

  return links_per_root;
}

function draw_rainbow_background() {
  var r = random(255);
  var g = random(255);
  var b = random(255);
  background(r, g, b);
}

function get_inner_polygons(polygons) {
  var is_inner = [];

  for (var k = 0; k < polygons.length; k++) {
    var polygon = polygons[k];
    var is_inner_polygon = true;

    for (var i = 0; i < polygon.length; i++) {
      var v = polygon[i];
      if (v[0] < 1 || v[0] > width - 1 || v[1] < 1 || v[1] > height - 1) {
        is_inner_polygon = true;
        break;
      }
    }
    is_inner.push(is_inner_polygon);
  }

  return is_inner;
}

function get_midpoints(polygons) {
  var midpoints = [];

  for (var k = 0; k < polygons.length; k++) {
    var polygon = polygons[k];

    var x = 0;
    var y = 0;

    for (var i = 0; i < polygon.length; i++) {
      var v = polygon[i];
      x += v[0];
      y += v[1];
    }
    midpoints.push([x / polygon.length, y / polygon.length]);
  }
  return midpoints;
}

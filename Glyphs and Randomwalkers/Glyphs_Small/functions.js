function draw_alignment_dots() {
  push();
  stroke(0);
  strokeWeight(5);

  beginShape(POINTS);
  vertex(0, 0);
  endShape();

  beginShape(POINTS);
  vertex((x_len - 1) * grid_sidelength, (y_len - 1) * grid_sidelength);
  endShape();

  pop();
}

function create_noisegrid_old() {
  x_len = round(cwidth / grid_sidelength);
  y_len = round(cheight / grid_sidelength);

  used_grid = new Array(x_len);
  noise_grid = new Array(x_len);
  allow_grid = new Array(x_len);

  for (var i = 0; i < noise_grid.length; i++) {
    noise_grid[i] = new Array(y_len);
    used_grid[i] = new Array(y_len);
    allow_grid[i] = new Array(y_len);
    for (let j = 0; j < noise_grid[i].length; j++) {
      noise_grid[i][j] = int(map(random(1), 0, 1, 0, 3));
      used_grid[i][j] = false;

      // this is generating the cells
      let subgrid_value =
        i % grid_cellsize < margin_thickness ||
        j % grid_cellsize < margin_thickness
          ? 1
          : 0;

      used_grid[i][j] = false;

      allow_grid[i][j] = subgrid_value;

      if (
        i == 0 ||
        j == 0 ||
        j == noise_grid[i].length - 1 ||
        i == noise_grid.length - 1
      ) {
        used_grid[i][j] = true;
      }
    }
  }
}

function create_noisegrid() {
  used_grid = new Array(x_len);
  noise_grid = new Array(x_len);
  allow_grid = new Array(x_len);

  for (var i = 0; i < noise_grid.length; i++) {
    noise_grid[i] = new Array(y_len);
    used_grid[i] = new Array(y_len);
    allow_grid[i] = new Array(y_len);
    for (let j = 0; j < noise_grid[i].length; j++) {
      noise_grid[i][j] = int(map(random(1), 0, 1, 0, 3));
      used_grid[i][j] = false;
      allow_grid[i][j] = 0;

      if (
        i == 0 ||
        j == 0 ||
        j == noise_grid[i].length - 1 ||
        i == noise_grid.length - 1
      ) {
        used_grid[i][j] = true;
      }
    }
  }

  subdivide_grid(0, 0, x_len - 1, y_len - 1, max_divs, 0);
}

function subdivide_grid(x0, y0, x1, y1, max_divs, depth) {
  if (depth >= max_divs) {
    return;
  }
  let x_mid = (x0 + x1) / 2;
  let y_mid = (y0 + y1) / 2;
  for (let i = x0; i < x1; i++) {
    allow_grid[i][y_mid] = 1;
  }

  for (let j = y0; j < y1; j++) {
    allow_grid[x_mid][j] = 1;
  }

  if (random(1) < non_split_prop) {
    subdivide_grid(x0, y0, x_mid, y_mid, max_divs, depth + 1);
  }
  if (random(1) < non_split_prop) {
    subdivide_grid(x0, y_mid, x_mid, y1, max_divs, depth + 1);
  }
  if (random(1) < non_split_prop) {
    subdivide_grid(x_mid, y0, x1, y_mid, max_divs, depth + 1);
  }
  if (random(1) < non_split_prop) {
    subdivide_grid(x_mid, y_mid, x1, y1, max_divs, depth + 1);
  }
}

function color_gradient_map(x, y) {
  let left = 0;
  let right = 1;
  let top = 0;
  let bottom = 1;
  if ((x + y) / 2 < left) {
    return 0;
  }
  if ((x + y) / 2 > right) {
    return 1;
  }

  return map((x + y) / 2, left, right, 0, 1);
}

function draw_gradient_background(c1, c2) {
  loadPixels();
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let c = lerpColor(c1, c2, color_gradient_map(x / width, y / height));
      let index = (x + y * width) * 4;
      pixels[index + 0] = red(c);
      pixels[index + 1] = green(c);
      pixels[index + 2] = blue(c);
      pixels[index + 3] = 255;
    }
  }
  updatePixels();
}

function draw_gradient_foreground(c1, c2) {
  loadPixels();
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let c = lerpColor(c1, c2, color_gradient_map(x / width, y / height));
      let index = (x + y * width) * 4;
      if (
        pixels[index + 0] <= 200 &&
        pixels[index + 1] <= 200 &&
        pixels[index + 2] <= 200
      ) {
        pixels[index + 0] = red(c);
        pixels[index + 1] = green(c);
        pixels[index + 2] = blue(c);
        pixels[index + 3] = 255;
      }
    }
  }
  updatePixels();
}

function draw_grid() {
  push();
  noFill();

  stroke(0);
  strokeWeight(1);
  noStroke();
  for (let i = 0; i < noise_grid.length; i++) {
    for (let j = 0; j < noise_grid[i].length; j++) {
      push();

      if (allow_grid[i][j] == 1) {
        fill(255, 0, 0);
      }
      if (used_grid[i][j] == true) {
        fill(120, 50, 100);
      }
      translate(
        i * grid_sidelength + grid_sidelength / 2,
        j * grid_sidelength + grid_sidelength / 2
      );

      rect(
        -grid_sidelength / 2,
        -grid_sidelength / 2,
        grid_sidelength,
        grid_sidelength
      );

      pop();
    }
  }
  pop();
}

function create_particles(
  num,
  p_color,
  arror_side,
  follow_prop,
  allow_polarity,
  invis_length,
  vis_length,
  thick_lines,
  line_thickness
) {
  let new_particles = [];
  i = 0;
  while (i < num) {
    //x value start slightly outside the right of canvas, z value how close to viewer
    let loc_x = int(map(random(1), 0, 1, 0, x_len - 1, true));
    let loc_y = int(map(random(1), 0, 1, 0, y_len - 1, true));

    // if the gridspace is already used or not allowed to be used, skip it
    if (
      used_grid[loc_x][loc_y] ||
      allow_grid[loc_x][loc_y] === allow_polarity
    ) {
      continue;
    }

    let loc = createVector(loc_x, loc_y);
    let noise_value = noise_grid[loc_x][loc_y];
    used_grid[loc_x][loc_y] = true;
    let dir = get_dir(noise_value);

    new_particles.push(
      new Particle(
        loc,
        dir,
        noise_value,
        p_color,
        arror_side,
        follow_prop,
        allow_polarity,
        invis_length,
        vis_length,
        thick_lines,
        line_thickness
      )
    );
    i += 1;
  }

  return new_particles;
}

function get_dir(noise_value) {
  let dir;

  if (noise_value == 0) {
    dir = createVector(1, 0);
    return dir;
  }
  if (noise_value == 1) {
    dir = createVector(0, -1);
    return dir;
  }
  if (noise_value == 2) {
    dir = createVector(-1, 0);
    return dir;
  }
  if (noise_value == 3) {
    dir = createVector(0, 1);
    return dir;
  }

  console.log("ERROR", noise_value);
}

function draw_arrow(curr_pos, prev_pos) {
  let heading = p5.Vector.sub(curr_pos, prev_pos);
  let angle = createVector(0, -1, 0).angleBetween(heading);

  push();
  translate(
    curr_pos.x * grid_sidelength + grid_sidelength / 2,
    curr_pos.y * grid_sidelength + grid_sidelength / 2
  );

  rotate(angle);

  line(0, 0, arrow_size, arrow_size);
  line(0, 0, -arrow_size, arrow_size);

  pop();
}

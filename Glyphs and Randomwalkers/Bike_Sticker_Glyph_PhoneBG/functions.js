function draw_alignment_dots() {
  push();
  stroke(0);
  strokeWeight(5);

  beginShape(POINTS);
  vertex(0, 0);
  endShape();

  beginShape(POINTS);
  vertex(x_len * grid_sidelength, y_len * grid_sidelength);
  endShape();

  pop();
}

function create_noisegrid() {
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

      let noise_value = noise(
        i / allow_noise_locality,
        j / allow_noise_locality
      );

      let noise_boolean = round(map(noise_value, 0.1, 1, 0, 1, true));

      let subgrid_value =
        i % grid_cellsize < margin_thickness ||
        j % grid_cellsize < margin_thickness
          ? 1
          : 0;

      used_grid[i][j] = subgrid_value;

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

      if (used_grid[i][j] == true) {
        fill(120, 50, 100);
      }
      if (allow_grid[i][j] == true) {
        //fill(120, 50, 100);
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
  vis_length
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
        vis_length
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

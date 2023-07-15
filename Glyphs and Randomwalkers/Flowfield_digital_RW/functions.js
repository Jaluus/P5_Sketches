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

function create_noisegrid() {
  used_grid = new Array(round(cwidth / grid_sidelength));
  noise_grid = new Array(round(cwidth / grid_sidelength));
  allow_grid = new Array(round(cwidth / grid_sidelength));

  for (var i = 0; i < noise_grid.length; i++) {
    noise_grid[i] = new Array(round(cheight / grid_sidelength));
    used_grid[i] = new Array(round(cheight / grid_sidelength));
    allow_grid[i] = new Array(round(cheight / grid_sidelength));
    for (let j = 0; j < noise_grid[i].length; j++) {
      noise_grid[i][j] = int(map(random(1), 0, 1, 0, 3));
      used_grid[i][j] = false;

      let noise_value = noise(
        i / allow_noise_locality,
        j / allow_noise_locality
      );
      let allow_value = round(map(noise_value, 0.1, 1, 0, 1, true));

      allow_grid[i][j] = allow_value;

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

  x_len = noise_grid.length;
  y_len = noise_grid[0].length;
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

      // if (used_grid[i][j] == true) {
      //   fill(0, 10, 100);
      // }
      if (allow_grid[i][j] == true) {
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
  allow_polarity
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
        allow_polarity
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

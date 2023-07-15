function create_noisegrid() {
  used_grid = new Array(round(cwidth / grid_sidelength));
  noise_grid = new Array(round(cwidth / grid_sidelength));
  for (var i = 0; i < noise_grid.length; i++) {
    noise_grid[i] = new Array(round(cheight / grid_sidelength));
    used_grid[i] = new Array(round(cheight / grid_sidelength));
    for (let j = 0; j < noise_grid[i].length; j++) {
      noise_grid[i][j] =
        int(
          map(
            noise(i / noise_locality, j / noise_locality),
            0.2,
            0.8,
            0,
            7,
            true
          ) / 2
        ) * 2;
      used_grid[i][j] = false;

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
  for (let i = 0; i < noise_grid.length; i++) {
    for (let j = 0; j < noise_grid[i].length; j++) {
      push();
      stroke(0);
      strokeWeight(1);
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

function create_particles() {
  particles = [];
  for (let i = 0; i < num; i++) {
    //x value start slightly outside the right of canvas, z value how close to viewer
    let loc_x = int(map(noise(i, 1), 0.2, 0.8, 0, x_len - 1, true));
    let loc_y = int(map(noise(1, i), 0.2, 0.8, 0, y_len - 1, true));

    if (used_grid[loc_x][loc_y] == true) {
      continue;
    }

    let loc = createVector(loc_x, loc_y);
    let noise_value = noise_grid[loc_x][loc_y];
    used_grid[loc_x][loc_y] = true;
    let dir = get_dir(noise_value);

    let p_color = color(30, 100, 0);

    particles.push(new Particle(loc, dir, p_color, 1));
  }
}

function create_particles_2() {
  particles_2 = [];
  for (let i = 0; i < num; i++) {
    //x value start slightly outside the right of canvas, z value how close to viewer
    let loc_x = int(map(noise(i, 2), 0.2, 0.8, 0, x_len - 1, true));
    let loc_y = int(map(noise(2, i), 0.2, 0.8, 0, y_len - 1, true));

    if (used_grid[loc_x][loc_y] == true) {
      continue;
    }

    let loc = createVector(loc_x, loc_y);
    let noise_value = noise_grid[loc_x][loc_y];
    used_grid[loc_x][loc_y] = true;
    let dir = get_dir(noise_value);

    let p_color = color(0, 100, 100);

    particles_2.push(new Particle(loc, dir, p_color, 0));
  }
}

function get_dir(noise_value) {
  let dir;

  if (noise_value == 0) {
    dir = createVector(0, -1);
    return dir;
  }
  if (noise_value == 1) {
    dir = createVector(1, -1);
    return dir;
  }
  if (noise_value == 2) {
    dir = createVector(1, 0);
    return dir;
  }
  if (noise_value == 3) {
    dir = createVector(1, 1);
    return dir;
  }
  if (noise_value == 4) {
    dir = createVector(0, 1);
    return dir;
  }
  if (noise_value == 5) {
    dir = createVector(-1, 1);
    return dir;
  }
  if (noise_value == 6) {
    dir = createVector(-1, 0);
    return dir;
  }
  if (noise_value == 7) {
    dir = createVector(-1, -1);
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

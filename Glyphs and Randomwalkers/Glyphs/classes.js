class Particle {
  constructor(
    _loc,
    _dir,
    _dir_idx,
    _color,
    _arrow_dir,
    _follow_prop,
    _allow_polarity,
    _invis_length,
    _vis_length,
    _thick_lines,
    _line_thickness
  ) {
    this.loc = _loc;
    this.dir = _dir;
    this.dir_idx = _dir_idx;
    this.last_pos = [this.loc.copy()];
    this.line_pieces = [];
    this.stop = false;
    this.invisible = false;
    this.invis_timer = 0;
    this.vis_timer = 0;
    this.color = _color;
    this.arrow_dir = _arrow_dir;
    this.allow_polarity = _allow_polarity;
    this.follow_prob = _follow_prop;
    this.invis_length = _invis_length;
    this.vis_length = _vis_length;
    this.thick_lines = _thick_lines;
    this.line_thickness = _line_thickness;
  }
  run(show) {
    if (this.stop == false) {
      this.move();
    }
    if (show) {
      this.update();
    }
  }

  check_move(loc) {
    // returns false if you cant move
    return !(
      used_grid[loc.x][loc.y] ||
      allow_grid[loc.x][loc.y] === this.allow_polarity
    );
  }

  move() {
    let new_dir_idx = noise_grid[this.loc.x][this.loc.y];

    if (random(1) < this.follow_prob) {
      this.dir = get_dir(new_dir_idx);
      this.dir_idx = new_dir_idx;
    }

    let new_loc = this.loc.copy().add(this.dir);

    // find a new direction if the new location already used or not allowed
    let retry = 0;
    while (!this.check_move(new_loc) && retry < retries) {
      retry += 1;
      this.dir_idx = (new_dir_idx + retry) % 4;
      this.dir = get_dir(this.dir_idx);
      new_loc = this.loc.copy().add(this.dir);
    }

    this.loc = new_loc;

    // if the new location is used or not allowed, stop the particle
    if (!this.check_move(this.loc)) {
      if (this.invisible === false && this.last_pos.length > 2) {
        this.line_pieces.push(this.last_pos.map((x) => x.copy()));
        this.last_pos = [];
      }

      this.stop = true;
      return 0;
    }

    used_grid[this.loc.x][this.loc.y] = true;

    if (this.invisible == false) {
      this.last_pos.push(this.loc.copy());
      this.vis_timer += 1;
    } else {
      this.invis_timer += 1;
      if (this.invis_timer > this.invis_length) {
        this.invisible = false;
        this.invis_timer = 0;
      }
    }

    if (this.vis_timer > this.vis_length && this.invisible == false) {
      this.vis_timer = 0;
      this.invisible = true;
      this.line_pieces.push(this.last_pos.map((x) => x.copy()));
      this.last_pos = [];
    }
  }
  checkEdges(loc) {
    if (loc.x < 0 || loc.x >= x_len || loc.y < 0 || loc.y >= y_len) {
      this.stop = true;
      return true;
    }
    return false;
  }
  draw_vertex(current_line_piece, idx, dir) {
    var prev = current_line_piece[idx - dir];
    var current = current_line_piece[idx];
    var next = current_line_piece[idx + dir];

    var prev_dir;
    var curr_dir;
    var delta_angle;
    var x_offset;
    var y_offset;
    var x_offset_next;
    var y_offset_next;
    var temp_vec;

    var x_0 = current_line_piece[idx].x * grid_sidelength + grid_sidelength / 2;
    var y_0 = current_line_piece[idx].y * grid_sidelength + grid_sidelength / 2;

    if (next == undefined) {
      prev_dir = p5.Vector.sub(current, prev);
      [x_offset, y_offset] = this.calculate_xy_offset(prev_dir);
      vertex(
        x_0 + (x_offset * grid_sidelength) / 4,
        y_0 + (y_offset * grid_sidelength) / 4
      );
    } else if (prev == undefined) {
      curr_dir = p5.Vector.sub(next, current);
      [x_offset, y_offset] = this.calculate_xy_offset(curr_dir);
      temp_vec = p5.Vector.rotate(curr_dir, -1 * HALF_PI);
      temp_vec.x = round(temp_vec.x) + 0;
      temp_vec.y = round(temp_vec.y) + 0;
      [x_offset_next, y_offset_next] = this.calculate_xy_offset(temp_vec);

      vertex(
        x_0 + (x_offset_next * grid_sidelength) / 4,
        y_0 + (y_offset_next * grid_sidelength) / 4
      );
      vertex(
        x_0 + (x_offset * grid_sidelength) / 4,
        y_0 + (y_offset * grid_sidelength) / 4
      );
    } else {
      prev_dir = p5.Vector.sub(current, prev);
      curr_dir = p5.Vector.sub(next, current);
      delta_angle = curr_dir.angleBetween(prev_dir);
      [x_offset, y_offset] = this.calculate_xy_offset(prev_dir);

      // second case: Right turn, draw one vertices behind the current direction
      // first case: Left turn, draw one vertex on the top left of the current direction
      // third case: Straight line, draw one vertex on the top left of the current direction
      if (delta_angle >= 0) {
        vertex(
          x_0 + (x_offset * grid_sidelength) / 4,
          y_0 + (y_offset * grid_sidelength) / 4
        );
      } else {
        delta_angle = curr_dir.angleBetween(curr_dir);
        [x_offset, y_offset] = this.calculate_xy_offset(curr_dir);
        vertex(
          x_0 + (x_offset * grid_sidelength) / 4,
          y_0 + (y_offset * grid_sidelength) / 4
        );
      }
    }
  }
  calculate_xy_offset(curr_dir) {
    var current_angle_idx = round((curr_dir.heading() / PI) * 2) + 1;
    if (current_angle_idx == 1) {
      return [-1, -1];
    }
    if (current_angle_idx == 0) {
      return [-1, 1];
    }
    if (current_angle_idx == 3) {
      return [1, 1];
    }
    if (current_angle_idx == 2) {
      return [1, -1];
    }
    console.log("error");
  }
  update() {
    push();
    stroke(this.color);
    strokeWeight(this.line_thickness);
    noFill();

    //fill(this.color);
    //noStroke();

    if (this.stop == false) {
      beginShape();
      for (let i = 0; i < this.last_pos.length; i++) {
        vertex(
          this.last_pos[i].x * grid_sidelength + grid_sidelength / 2,
          this.last_pos[i].y * grid_sidelength + grid_sidelength / 2
        );
      }
      endShape();
    }

    // draw each linepiece of the path
    for (let i = 0; i < this.line_pieces.length; i++) {
      let current_line_piece = this.line_pieces[i];

      if (this.thick_lines) {
        for (let i = 0; i < this.line_pieces.length; i++) {
          let current_line_piece = this.line_pieces[i];

          beginShape();
          for (let j = 0; j < current_line_piece.length; j++) {
            this.draw_vertex(current_line_piece, j, 1);
          }
          for (let j = current_line_piece.length - 1; j >= 0; j--) {
            this.draw_vertex(current_line_piece, j, -1);
          }
          endShape(CLOSE);
        }
      } else {
        beginShape();
        for (let j = 0; j < current_line_piece.length; j++) {
          vertex(
            current_line_piece[j].x * grid_sidelength + grid_sidelength / 2,
            current_line_piece[j].y * grid_sidelength + grid_sidelength / 2
          );
        }
        endShape();
      }
    }

    pop();
  }
}

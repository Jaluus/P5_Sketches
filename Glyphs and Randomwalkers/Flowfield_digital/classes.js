class Particle {
  constructor(_loc, _dir, _color, _arrow_dir) {
    this.loc = _loc;
    this.dir = _dir;
    this.last_pos = [this.loc.copy()];
    this.line_pieces = [];
    this.stop = false;
    this.invisible = false;
    this.invis_timer = 0;
    this.vis_timer = 0;
    this.color = _color;
    this.arrow_dir = _arrow_dir;
    // var col;
  }
  run(show) {
    if (this.stop == false) {
      this.move();
    }
    if (show) {
      this.update();
    }
  }
  move() {
    let noise_value = noise_grid[this.loc.x][this.loc.y];

    if (random(1) < follow_prob) {
      this.dir = get_dir(noise_value);
    }

    let new_loc = this.loc.copy().add(this.dir);

    let retry = 0;
    while (
      !this.checkEdges(new_loc) &&
      used_grid[new_loc.x][new_loc.y] &&
      retry < retries
    ) {
      retry += 1;
      this.dir = get_dir((noise_value + retry * 2) % 8);
      new_loc = this.loc.copy().add(this.dir);
    }

    this.loc = new_loc;

    if (this.checkEdges(new_loc) || used_grid[this.loc.x][this.loc.y]) {
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
      if (this.invis_timer > invis_length) {
        this.invisible = false;
        this.invis_timer = 0;
      }
    }

    if (this.vis_timer > vis_length && this.invisible == false) {
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
  update() {
    push();
    stroke(this.color);
    strokeWeight(line_thickness);
    noFill();

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

      beginShape();
      for (let j = 0; j < current_line_piece.length; j++) {
        vertex(
          current_line_piece[j].x * grid_sidelength + grid_sidelength / 2,
          current_line_piece[j].y * grid_sidelength + grid_sidelength / 2
        );
      }
      endShape();

      if (this.arrow_dir === -1) {
        continue;
      }
      // draw an arrow at the end of each linepiece
      if (this.arrow_dir === 1) {
        draw_arrow(current_line_piece[0], current_line_piece[1]);
      } else {
        draw_arrow(
          current_line_piece[current_line_piece.length - 1],
          current_line_piece[current_line_piece.length - 2]
        );
      }
    }
    pop();
  }
}

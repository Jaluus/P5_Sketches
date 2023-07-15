var px_scale = 5;

var x_gridcells = 80;
var y_gridcells = 80;
var grid_sidelength = 2 * px_scale;
var cheight = (y_gridcells + 1) * grid_sidelength; // 1000 is good for a4
var cwidth = (x_gridcells + 1) * grid_sidelength;
console.log(cwidth, cheight);
var max_divs = 3;

var thick_lines = false;

var allow_noise_locality = 70;
var line_thickness = 5;
var vis_length = 2000;
var invis_length = 1;
var retries = 5;

// -1 means no arrow, 0 means at the start, 1 means at the end
var arrow_dir = -1;
var arrow_size = 4;

var num_1a = 100;
var num_1b = 10;
var num_2 = 10;

var p1_follow_prob = 0.2;
var p2_follow_prob = 0.1;

var p1_allow_polarity = 1;
var p2_allow_polarity = 1;

var p1_color;
var p2_color;

var draw_while_running = true;
var save_drawing = true;

var noise_grid;
var used_grid;
var allow_grid;

var particles_1a;
var particles_1b;
var particles_2;

var p1a_finished = false;
var p1b_finished = false;
var p2_finished = false;

var p1b_created = false;
var p2_created = false;

var x_len = x_gridcells + 1;
var y_len = y_gridcells + 1;

function setup() {
  //colorMode(HSB);
  //randomSeed(2);
  //noiseSeed(7);

  pixelDensity(1);

  var flblue = color(63, 176, 254);
  var fgreen = color(76, 221, 83);
  var forange = color(253, 104, 0);
  var fmagenta = color(221, 84, 214);
  var fyellow = color(234, 255, 2);

  var nred = color(215, 57, 51);
  var nblue = color(14, 81, 150);
  var nyellow = color(251, 216, 36);
  var nblack = color(5, 5, 5);
  var nwhite = color(250, 250, 250);
  var ncyan = color(105, 191, 180);

  var nroyal = color(44, 22, 87);

  color_fg_left = flblue;
  color_fg_right = nred;

  color_bg_left = nwhite;
  color_bg_right = nwhite;

  p1_color = color(0, 0, 0);
  p2_color = color(0, 0, 0);

  renderer = createCanvas(cwidth, cheight);
  create_noisegrid();

  particles_1a = create_particles(
    num_1a,
    p1_color,
    arrow_dir,
    p1_follow_prob,
    p1_allow_polarity,
    1,
    10000000,
    thick_lines,
    line_thickness
  );
  draw_grid();
  draw_alignment_dots();
}

function draw() {
  p1a_finished = true;

  // first run all the first particles
  for (let i = 0; i < particles_1a.length; i++) {
    particles_1a[i].run(draw_while_running);
    p1a_finished = p1a_finished && particles_1a[i].stop;
  }

  if (p1a_finished) {
    if (p1b_created == false) {
      console.log("p1b created");
      particles_1b = create_particles(
        num_1b,
        p1_color,
        arrow_dir,
        p1_follow_prob,
        p1_allow_polarity,
        1,
        10000000,
        thick_lines,
        line_thickness
      );
      p1b_created = true;
    }
    p1b_finished = true;
    for (let i = 0; i < particles_1b.length; i++) {
      particles_1b[i].run(draw_while_running);
      p1b_finished = p1b_finished && particles_1b[i].stop;
    }

    if (p1b_finished) {
      if (p2_created == false) {
        console.log("p2 created");
        particles_2 = create_particles(
          num_2,
          p2_color,
          arrow_dir,
          p2_follow_prob,
          p2_allow_polarity,
          invis_length,
          vis_length,
          thick_lines,
          line_thickness
        );
        p2_created = true;
      }
      p2_finished = true;
      for (let i = 0; i < particles_2.length; i++) {
        particles_2[i].run(draw_while_running);
        p2_finished = p2_finished && particles_2[i].stop;
      }
    }
  }

  // finally draw all the particles and stop the loop if all particles are finished
  if (p1a_finished && p1b_finished && p2_finished) {
    noLoop();
    console.log("Done");

    clear();
    draw_alignment_dots();
    for (let i = 0; i < particles_1a.length; i++) {
      particles_1a[i].run(true);
    }

    for (let i = 0; i < particles_1b.length; i++) {
      particles_1b[i].run(true);
    }
    if (save_drawing) {
      save("mySVG_outer.svg");
    }

    clear();
    draw_alignment_dots();
    for (let i = 0; i < particles_2.length; i++) {
      particles_2[i].run(true);
    }

    if (save_drawing) {
      save("mySVG_inner.svg");
    }

    clear();
    //background(255);
    //draw_gradient_background(color_bg_left, color_bg_right);
    for (let i = 0; i < particles_1a.length; i++) {
      particles_1a[i].run(true);
    }

    for (let i = 0; i < particles_1b.length; i++) {
      particles_1b[i].run(true);
    }

    for (let i = 0; i < particles_2.length; i++) {
      particles_2[i].run(true);
    }
    //draw_gradient_foreground(color_fg_left, color_fg_right);
    if (save_drawing) {
      save("mySVG_Full.svg");
    }
  }
}

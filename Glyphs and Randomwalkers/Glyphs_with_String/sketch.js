var encoded_string = " 9567 108510652";

var random_number;

var x_gridcells = 5;
var y_gridcells = 3;
var cell_sidelength = 5;
var grid_sidelength = 10;

var x_len = x_gridcells * cell_sidelength + 1;
var y_len = y_gridcells * cell_sidelength + 1;
var cheight = x_len * grid_sidelength;
var cwidth = y_len * grid_sidelength;

var thick_lines = true;

var allow_noise_locality = 70;
var line_thickness = 5;
var vis_length = 2000;
var invis_length = 1;
var retries = 5;

// -1 means no arrow, 0 means at the start, 1 means at the end
var arrow_dir = -1;
var arrow_size = 4;

var num_1a = x_gridcells * y_gridcells;
var num_1b = 0;
var num_2 = 0;

var p1_follow_prob = 0.2;
var p2_follow_prob = 0.1;

var p1_allow_polarity = 1;
var p2_allow_polarity = 1;

var p1_color;
var p2_color;

var draw_while_running = false;
var save_drawing = false;

var noise_grid;
var used_grid;
var allow_grid;

var particles_1;
var particles_2;
var particles_3;

var p1_finished = false;
var p2_finished = false;
var p3_finished = false;

function setup() {
  //colorMode(HSB);
  //randomSeed(2);
  //noiseSeed(7);
  random_number = random(0, 1);
  strokeCap(SQUARE);
  pixelDensity(1);
  noSmooth();

  var flblue = color(63, 176, 254);
  var fgreen = color(76, 221, 83);
  var forange = color(253, 104, 0);
  var fmagenta = color(221, 84, 214);
  var fyellow = color(234, 255, 2);

  var nred = color(215, 57, 51);
  var nblue = color(14, 81, 150);
  var nyellow = color(251, 216, 36);
  var nblack = color(5, 5, 5);
  var nwhite = color(255, 255, 255);
  var ncyan = color(105, 191, 180);

  var nroyal = color(44, 22, 87);

  color_fg_left = nwhite;
  color_fg_right = nwhite;

  color_bg_left = nblack;
  color_bg_right = nblack;

  p1_color = color(0, 0, 0);
  p2_color = color(0, 0, 0);
  p3_color = color(0, 0, 0);

  renderer = createCanvas(cheight, cwidth, SVG);
  create_noisegrid_old();

  [particles_1, particles_2, particles_3] = create_particles_with_string(
    encoded_string,
    thick_lines,
    line_thickness
  );
  //draw_grid();
}

function draw() {
  p1_finished = true;
  p2_finished = true;
  p3_finished = true;

  // first run all the first particles
  for (let i = 0; i < particles_1.length; i++) {
    particles_1[i].run(draw_while_running);
    particles_2[i].run(draw_while_running);
    particles_3[i].run(draw_while_running);
    p1_finished = p1_finished && particles_1[i].stop;
    p2_finished = p2_finished && particles_2[i].stop;
    p3_finished = p3_finished && particles_3[i].stop;
  }

  // finally draw all the particles and stop the loop if all particles are finished
  if (p1_finished && p2_finished && p3_finished) {
    noLoop();
    console.log("Done");

    clear();
    //draw_grid();

    //draw_gradient_background(color_bg_left, color_bg_right);
    for (let i = 0; i < particles_1.length; i++) {
      particles_1[i].run(true);
    }

    for (let i = 0; i < particles_2.length; i++) {
      particles_2[i].run(true);
    }

    for (let i = 0; i < particles_3.length; i++) {
      particles_3[i].run(true);
    }

    //draw_gradient_foreground(color_fg_left, color_fg_right);
    if (save_drawing) {
      save("mySVG_Full.svg");
    }
  }
}

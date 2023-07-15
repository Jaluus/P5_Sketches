var cheight = 500;
var cwidth = 500;

var noise_locality = 20;
var d = 1;
var line_thickness = 2;
var vis_length = 999;
var invis_length = 2;
var follow_prob = -1;
var retries = 4;

var arrow_size = 0;

var num = 100;
var particles = [];
var particles_2 = [];

var grid_sidelength = 4;
var noise_grid;
var used_grid;

var x_len;
var y_len;

function setup() {
  colorMode(HSB);
  renderer = createCanvas(cwidth, cheight);
  create_noisegrid();
  create_particles();
  create_particles_2();
}

function draw() {
  //renderer.drawingContext.__clearCanvas();
  let p1_finished = true;
  let p2_finished = false;

  //draw_grid();

  for (let i = 0; i < particles.length; i++) {
    particles[i].run(true);
    p1_finished = p1_finished && particles[i].stop;
  }

  if (p1_finished) {
    p2_finished = true;
    for (let i = 0; i < particles_2.length; i++) {
      particles_2[i].run(true);
      p2_finished = p2_finished && particles_2[i].stop;
    }
  }

  if (p2_finished) {
    noLoop();
    for (let i = 0; i < particles.length; i++) {
      particles[i].run(true);
      p1_finished = p1_finished && particles[i].stop;
    }
    for (let i = 0; i < particles_2.length; i++) {
      particles_2[i].run(true);
      p2_finished = p2_finished && particles_2[i].stop;
    }
    console.log("Done");
  }
}

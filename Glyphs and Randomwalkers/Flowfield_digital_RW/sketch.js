var cheight = 300;
var cwidth = 2000;

var allow_noise_locality = 50;
var line_thickness = 6;
var vis_length = 10;
var invis_length = 2;
var retries = 4;

var arrow_size = 0;

var num_1a = 200;
var num_1b = 100;
var num_2 = 0;

var draw_while_running = true;
var save_drawing = false;

var particles_1_a;
var particles_1_b;
var particles_2;

var grid_sidelength = 10;
var noise_grid;
var used_grid;
var allow_grid;

var p1a_finished = false;
var p1b_finished = false;
var p2_finished = false;

var p1b_created = false;
var p2_created = false;

var x_len;
var y_len;

function setup() {
  randomSeed(2);
  noiseSeed(7);

  colorMode(HSB);
  renderer = createCanvas(cwidth, cheight);
  create_noisegrid();

  particles_1_a = create_particles(
    num_1a,
    color(240, 100, 0),
    -1,
    0.002,
    -1,
    1000000,
    1
  );
  //draw_grid();
  draw_alignment_dots();
}

function draw() {
  //renderer.drawingContext.__clearCanvas();
  //background(255);

  p1a_finished = true;

  // first run all the first particles
  for (let i = 0; i < particles_1_a.length; i++) {
    particles_1_a[i].run(draw_while_running);
    p1a_finished = p1a_finished && particles_1_a[i].stop;
  }

  if (p1a_finished) {
    if (p1b_created == false) {
      console.log("p1b created");
      particles_1_b = create_particles(
        num_1b,
        color(240, 100, 0),
        -1,
        0.002,
        -1,
        1000000,
        1
      );
      p1b_created = true;
    }
    p1b_finished = true;
    for (let i = 0; i < particles_1_b.length; i++) {
      particles_1_b[i].run(draw_while_running);
      p1b_finished = p1b_finished && particles_1_b[i].stop;
    }

    if (p1b_finished) {
      if (p2_created == false) {
        console.log("p2 created");
        particles_2 = create_particles(
          num_2,
          color(0, 100, 100),
          -1,
          0.3,
          -1,
          invis_length,
          vis_length
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
    for (let i = 0; i < particles_1_a.length; i++) {
      particles_1_a[i].run(true);
    }

    for (let i = 0; i < particles_1_b.length; i++) {
      particles_1_b[i].run(true);
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
    background();
    draw_alignment_dots();
    for (let i = 0; i < particles_1_a.length; i++) {
      particles_1_a[i].run(true);
    }

    for (let i = 0; i < particles_1_b.length; i++) {
      particles_1_b[i].run(true);
    }

    for (let i = 0; i < particles_2.length; i++) {
      particles_2[i].run(true);
    }
    if (save_drawing) {
      save("mySVG_Full.svg");
    }
  }
}

var settings = {
  cheight: 400,
  cwidth: 400,
  max_depth: 20,
  noise_locality: 1000,
  rect_spacing: 0,
  min_size: 10,
  non_split_chance: 0.001,
  b_multiplier: 9,
  h_multiplier: 3,
  s_value: 100,
  terrace_strength: 1,
  intra_color_offset: 0.01,
  intra_color_offset_probability: 0.5,
  color_offset: 120,
  terrace_offset: 99,
  fix_seed: false,
  noise_seed: 1,
  random_seed: 1,
  stroke_tickness: 1,
};

var ratio = 1;
var timestep = 0;
var seed;

var canvas;

function setup() {
  ratio = window.devicePixelRatio || 1;

  canvas = createCanvas(settings.cwidth, settings.cheight, SVG);
  canvas.parent("canvas_div");
  rectMode(CORNER);
  colorMode(HSB);

  var redraw_button = {
    Redraw: function () {
      loop();
    },
  };

  var download_image_as_png = {
    Download_PNG: function () {
      save("Image.png");
    },
  };

  var download_image_as_svg = {
    Download_SVG: function () {
      save("Image.svg");
    },
  };

  var fit_to_screen = {
    Fit_to_screen: function () {
      settings.cwidth = window.screen.width * ratio;
      settings.cheight = window.screen.height * ratio;
    },
  };

  var update_screen_size = {
    Update_screen_size: function () {
      resizeCanvas(settings.cwidth, settings.cheight);
    },
  };

  let gui = new dat.GUI();
  let settings_folder = gui.addFolder("Settings");
  let seed_folder = gui.addFolder("Seed");
  let size_folder = gui.addFolder("Size");
  settings_folder.add(settings, "max_depth", 1, 100).name("Max Iter");
  settings_folder.add(settings, "min_size", 1, 100).name("Min Rect Size");
  settings_folder
    .add(settings, "noise_locality", 100, 10000)
    .name("Noise Scale");
  settings_folder
    .add(settings, "non_split_chance", 0, 1)
    .step(0.001)
    .name("Non-Split Prob");
  settings_folder
    .add(settings, "b_multiplier", 0, 20)
    .step(1)
    .name("B Multiplier");
  settings_folder
    .add(settings, "h_multiplier", 0, 20)
    .step(1)
    .name("Hue Multiplier");
  settings_folder
    .add(settings, "color_offset", 0, 360)
    .step(1)
    .name("Hue Offset");
  settings_folder
    .add(settings, "intra_color_offset", 0, 1)
    .step(0.01)
    .name("Color Var");
  settings_folder
    .add(settings, "intra_color_offset_probability", 0, 1)
    .step(0.01)
    .name("Color Var Prob");

  seed_folder.add(settings, "fix_seed").name("Fixed Seed");
  seed_folder
    .add(settings, "noise_seed", 1, 1000)
    .step(1)
    .listen()
    .name("Noise Seed");
  seed_folder
    .add(settings, "random_seed", 1, 1000)
    .step(1)
    .listen()
    .name("Random Seed");
  size_folder
    .add(settings, "cwidth", 300, 3000)
    .step(10)
    .name("Width")
    .listen();
  size_folder
    .add(settings, "cheight", 300, 3000)
    .step(10)
    .name("Height")
    .listen();
  size_folder.add(fit_to_screen, "Fit_to_screen").name("Fit to screen");
  size_folder.add(update_screen_size, "Update_screen_size").name("Update Size");
  gui.add(redraw_button, "Redraw").name("Redraw Image");
  gui.add(download_image_as_png, "Download_PNG").name("Download as PNG");
  gui.add(download_image_as_svg, "Download_SVG").name("Download as SVG");

  seed_folder.open();
  settings_folder.open();
  size_folder.open();
}

function myNoise(x, y, z) {
  return noise(x, y, z);
}

function drawRect(x0, y0, x1, y1) {
  let noisePos = myNoise(
    ((x1 - x0) / 2 + x0) / settings.noise_locality,
    ((y1 - y0) / 2 + y0) / settings.noise_locality
  );

  //noisePos = int(map(noisePos, 0, 1, 0, 5)) / 5;

  push();
  //noStroke();
  let s_value = settings.s_value;
  let b_value =
    (((settings.b_multiplier * noisePos * 100 + settings.terrace_offset) %
      100) /
      100) **
      settings.terrace_strength *
    100;

  if (random(1) < settings.intra_color_offset_probability) {
    noisePos += settings.intra_color_offset;
  }
  let h_value =
    (settings.h_multiplier * noisePos * 360 + settings.color_offset) % 360;

  fill(h_value, s_value, b_value);

  let x_size = x1 - x0;
  let y_size = y1 - y0;
  rect(
    x0 + settings.rect_spacing,
    y0 + settings.rect_spacing,
    x_size - 2 * settings.rect_spacing,
    y_size - 2 * settings.rect_spacing
  );

  pop();
}

function draw_line(x0, y0, x1, y1) {
  push();
  strokeWeight(1);
  noStroke();
  line(x0, y0, x1, y1);
  pop();
}

function subDivide(x0, y0, x1, y1, depth, last) {
  if (depth > settings.max_depth) {
    drawRect(x0, y0, x1, y1);
    return 0;
  }

  if (x0 >= x1 || y0 >= y1) {
    return 0;
  }

  if ((random(2) < 1 && last !== "rrr") || last === "lll") {
    if (x1 - x0 < settings.min_size || random(1) < settings.non_split_chance) {
      drawRect(x0, y0, x1, y1);

      return 0;
    }

    let split_x = int(random(0.3, 0.7) * (x1 - x0) + x0);

    let new_last = last.slice(-2) + "r";

    subDivide(split_x, y0, x1, y1, depth + 1, new_last);
    subDivide(x0, y0, split_x, y1, depth + 1, new_last);
    //draw_line(split_x, y0, split_x, y1);
  } else {
    if (y1 - y0 < settings.min_size || random(1) < settings.non_split_chance) {
      drawRect(x0, y0, x1, y1);

      return 0;
    }
    let split_y = int(random(0.3, 0.7) * (y1 - y0) + y0);

    let new_last = last.slice(-2) + "l";

    subDivide(x0, split_y, x1, y1, depth + 1, new_last);
    subDivide(x0, y0, x1, split_y, depth + 1, new_last);
    //draw_line(x0, split_y, x1, split_y);
  }
}

function draw() {
  clear();
  if (!settings.fix_seed) {
    settings.random_seed = int(random(1000));
    settings.noise_seed = int(random(1000));
  }
  randomSeed(settings.random_seed);
  noiseSeed(settings.noise_seed);

  background(0);
  subDivide(0, 0, width, height, 0, "xxx");
  noLoop();
}

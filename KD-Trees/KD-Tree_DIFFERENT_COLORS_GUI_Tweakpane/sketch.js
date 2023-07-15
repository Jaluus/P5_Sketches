var settings = {
  cheight: 400,
  cwidth: 400,
  max_depth: 20,
  noise_locality: 100,
  rect_spacing: 0,
  min_size: 10,
  non_split_chance: 0.001,
  b_multiplier: 9,
  h_multiplier: 3,
  s_value: 100,
  terrace_strength: 1,
  intra_color_offset: 0.01,
  intra_color_offset_probability: 0.5,
  color_offset: 180,
  terrace_offset: 99,
  fix_seed: false,
  noise_seed: 672,
  random_seed: 414,
  stroke_tickness: 1,
  stroke_color: { r: 0, g: 0, b: 0 },
  auto_redraw: true,
  timestep: 1000,
  middle_split: false,
  color_depth: 1000,
};

var stroke_rgb;
var stroke_hue = 0;
var stroke_saturation = 0;
var stroke_brightness = 0;

var ratio = 1;
var timestep = 0;
var seed;

var color_h_values = [
  56, // yellow
  -1, // black
  0, // red
  -2, // white
  240, // blue
];

var canvas;
const pane = new Tweakpane.Pane({ title: "Parameters" });

function setup() {
  ratio = window.devicePixelRatio || 1;

  canvas = createCanvas(settings.cwidth, settings.cheight);
  rectMode(CORNER);
  colorMode(HSB);

  // The GUI

  const size_folder = pane.addFolder({
    title: "Size",
    expanded: true,
  });

  size_folder.addInput(settings, "cheight", {
    label: "Height",
    min: 16,
    max: 4000,
    step: 1,
  });
  size_folder.addInput(settings, "cwidth", {
    label: "Width",
    min: 16,
    max: 4000,
    step: 1,
  });

  const fit_to_screen = size_folder.addButton({
    title: "Fit to Screen",
  });

  fit_to_screen.on("click", () => {
    settings.cwidth = window.screen.width * ratio;
    settings.cheight = window.screen.height * ratio;
    pane.refresh();
  });

  const size_button = size_folder.addButton({
    title: "Resize",
  });
  size_button.on("click", () => {
    resizeCanvas(settings.cwidth, settings.cheight);
    pane.refresh();
  });

  const noise_folder = pane.addFolder({
    title: "Noise",
    expanded: true,
  });

  noise_folder.addInput(settings, "noise_locality", {
    label: "Locality",
    min: 0,
    max: 1000,
    step: 1,
  });
  noise_folder.addInput(settings, "timestep", {
    min: 0,
    max: 2000,
    step: 1,
    label: "Z Step",
  });
  noise_folder.addInput(settings, "noise_seed", {
    min: 1,
    max: 1000,
    step: 1,
    label: "Noise Seed",
  });
  noise_folder.addInput(settings, "random_seed", {
    min: 1,
    max: 1000,
    step: 1,
    label: "Random Seed",
  });

  noise_folder.addButton({ title: "Randomize Seed" }).on("click", () => {
    settings.random_seed = int(second() * 1000 + millis()) ** 2 % 1000;
    settings.noise_seed =
      (int(second() * 1000 + millis()) * settings.random_seed) % 1000;
    pane.refresh();
  });

  const color_folder = pane.addFolder({
    title: "Color",
    expanded: true,
  });

  color_folder.addInput(settings, "b_multiplier", {
    min: 0,
    max: 20,
    step: 0.1,
    label: "Brightness",
  });
  color_folder.addInput(settings, "h_multiplier", {
    min: 0,
    max: 10,
    step: 0.1,
    label: "Hue",
  });
  color_folder.addInput(settings, "s_value", {
    min: 0,
    max: 100,
    step: 1,
    label: "Saturation",
  });
  color_folder.addInput(settings, "terrace_strength", {
    min: 0,
    max: 2,
    step: 0.1,
    label: "Falloff",
  });
  color_folder.addInput(settings, "intra_color_offset", {
    min: 0,
    max: 360,
    step: 1,
    label: "Intra Offset",
  });
  color_folder.addInput(settings, "intra_color_offset_probability", {
    min: 0,
    max: 1,
    step: 0.01,
    label: "Intra Prob",
  });
  color_folder.addInput(settings, "color_offset", {
    min: 0,
    max: 360,
    step: 1,
    label: "Color Offset",
  });
  color_folder.addInput(settings, "terrace_offset", {
    min: 0,
    max: 100,
    step: 1,
    label: "Shadow Offset",
  });
  color_folder.addInput(settings, "color_depth", {
    min: 1,
    max: 1000,
    step: 1,
    label: "Color Depth",
  });
  noise_folder.addButton({ title: "Randomize Colors" }).on("click", () => {
    color_h_values = [
      random(360), // yellow
      random(360), // black
      random(360), // red
      random(360), // white
      random(360), // blue
    ];
    pane.refresh();
  });

  color_folder.addInput(settings, "stroke_color", { label: "Stroke Color" });
  color_folder.addButton({ title: "Randomize Color" }).on("click", () => {
    randomSeed(int(second() * 1000 + millis()) ** 2);
    settings.intra_color_offset = random(360);
    settings.intra_color_offset_probability = random(1);
    settings.color_offset = random(360);
    settings.terrace_offset = random(100);
    settings.terrace_strength = random(2);
    settings.h_multiplier = random(10);
    settings.b_multiplier = random(20);
    //settings.s_value = int(random(100));

    pane.refresh();
  });

  const rect_folder = pane.addFolder({
    title: "Rectangles",
    expanded: true,
  });

  rect_folder.addInput(settings, "min_size", {
    min: 0,
    max: 100,
    step: 1,
    label: "Min Size",
  });
  rect_folder.addInput(settings, "non_split_chance", {
    min: 0,
    max: 1,
    step: 0.001,
    label: "Non-Split Chance",
  });
  rect_folder.addInput(settings, "max_depth", {
    min: 0,
    max: 40,
    step: 1,
    label: "Max Iterations",
  });
  rect_folder.addInput(settings, "stroke_tickness", {
    min: 0,
    max: 5,
    step: 1,
    label: "Stroke Tickness",
  });
  rect_folder.addInput(settings, "middle_split", { label: "Even Split" });

  const auto_redraw_input = pane.addInput(settings, "auto_redraw", {
    label: "Auto Redraw",
  });
  auto_redraw_input.on("change", (ev) => {
    if (ev.value) {
      loop();
    } else {
      noLoop();
    }
  });

  const redraw_button = pane.addButton({
    title: "Redraw",
  });

  redraw_button.on("click", () => {
    draw();
    pane.refresh();
  });

  const save_button_png = pane.addButton({
    title: "Save as PNG",
  });

  save_button_png.on("click", () => {
    save("image.png");
  });
}

function myNoise(x, y, z) {
  return noise(x, y, z);
}

function drawRect(x0, y0, x1, y1) {
  let x_size = x1 - x0;
  let y_size = y1 - y0;

  let noisePos = myNoise(
    ((x_size / 2 + x0) * settings.noise_locality) / 100000,
    ((y_size / 2 + y0) * settings.noise_locality) / 100000,
    settings.timestep / 1000
  );

  let s_value = settings.s_value;
  let b_value =
    (((settings.b_multiplier * noisePos * 100 + settings.terrace_offset) %
      100) /
      100) **
      settings.terrace_strength *
    100;
  
  let b_height = int((settings.b_multiplier * noisePos * 100 + settings.terrace_offset) / 100);

  if (random(1) < settings.intra_color_offset_probability) {
    noisePos += settings.intra_color_offset / 360;
  }

  let h_value = color_h_values[b_height % 5];

  if (h_value >= 0)
  {

    fill(h_value, s_value, b_value);
  }
  else if (h_value == -1)
  {
    fill(0, 0, b_value);
  }
  else if (h_value == -2)
  {
    fill(0, 0, 0);
  }

  rect(
    x0 + settings.rect_spacing,
    y0 + settings.rect_spacing,
    x_size - 2 * settings.rect_spacing,
    y_size - 2 * settings.rect_spacing
  );
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

  let split_length = random(0.3, 0.7);
  if (settings.middle_split) {
    split_length = 0.5;
  }

  if ((random(2) < 1 && last !== "rrr") || last === "lll") {
    if (x1 - x0 < settings.min_size || random(1) < settings.non_split_chance) {
      drawRect(x0, y0, x1, y1);

      return 0;
    }

    let split_x = int(split_length * (x1 - x0) + x0);

    let new_last = last.slice(-2) + "r";

    subDivide(split_x, y0, x1, y1, depth + 1, new_last);
    subDivide(x0, y0, split_x, y1, depth + 1, new_last);
    //draw_line(split_x, y0, split_x, y1);
  } else {
    if (y1 - y0 < settings.min_size || random(1) < settings.non_split_chance) {
      drawRect(x0, y0, x1, y1);
      return 0;
    }
    let split_y = int(split_length * (y1 - y0) + y0);

    let new_last = last.slice(-2) + "l";

    subDivide(x0, split_y, x1, y1, depth + 1, new_last);
    subDivide(x0, y0, x1, split_y, depth + 1, new_last);
    //draw_line(x0, split_y, x1, split_y);
  }
}

function draw() {
  clear();
  strokeWeight(settings.stroke_tickness);
  document.getElementById(
    "defaultCanvas0"
  ).style.borderColor = `rgb(${settings.stroke_color.r},${settings.stroke_color.g},${settings.stroke_color.b})`;
  settings.bg_color;

  // setting the stroke color
  push();
  colorMode(RGB);
  stroke_rgb = color(
    settings.stroke_color.r,
    settings.stroke_color.g,
    settings.stroke_color.b
  );
  pop();
  stroke_hue = hue(stroke_rgb);
  stroke_saturation = saturation(stroke_rgb);
  stroke_brightness = brightness(stroke_rgb);
  stroke(stroke_hue, stroke_saturation, stroke_brightness);

  // setting the random seed
  randomSeed(settings.random_seed);
  noiseSeed(settings.noise_seed);

  subDivide(0, 0, width, height, 0, "xxx");
}

function hideMe() {
  document.getElementById("popup").style.display = "none";
}

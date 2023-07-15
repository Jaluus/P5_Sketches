var vehicles = [];

var food = [];
var poison = [];

var maxFood = 100;
var maxPoision = 100;

var debug = false;

var numV = 100;

var bestVehicle;

var debug = false;

function setup() {
  createCanvas(1000, 600);
  background(51);

  for (var i = 0; i < numV; i++) {
    var vehicle = new Vehicle(random(width), random(height));
    vehicles.push(vehicle);
  }

  for (var i = 0; i < maxFood; i++) {
    food.push(createVector(random(width), random(height)));
  }

  for (var i = 0; i < maxPoision; i++) {
    poison.push(createVector(random(width), random(height)));
  }
}

function draw() {
  background(51);
  let maxLife = 0;
  bestVehicle = null;
  for (var i = vehicles.length - 1; i >= 0; i--) {
    var v = vehicles[i];
    v.boundaries();
    v.behaviors(food, poison);
    v.update();
    v.show();

    if (v.lifetime > maxLife) {
      bestVehicle = v;
    }
    if (v.dead()) {
      //food.push(createVector(v.pos.x, v.pos.y));
      vehicles.splice(i, 1);
      continue;
    }

    var newVehicle = v.clone();

    if (newVehicle) {
      vehicles.push(newVehicle);
    }
  }

  if (random(1) < 0.015 && poison.length < maxPoision) {
    poison.push(createVector(random(width), random(height)));
  }

  if (food.length < maxFood) {
    food.push(createVector(random(width), random(height)));
  }

  for (var i = 0; i < food.length; i++) {
    var foodpt = food[i];
    push();
    fill(0, 255, 0);
    ellipse(foodpt.x, foodpt.y, 4);
    pop();
  }

  for (var i = 0; i < poison.length; i++) {
    var poisonpt = poison[i];
    push();
    fill(255, 0, 0);
    ellipse(poisonpt.x, poisonpt.y, 4);
    pop();
  }

  push();
  fill(0, 0, 255, 100);
  ellipse(bestVehicle.pos.x, bestVehicle.pos.y, 20);
  pop();
}

var vehicles = [];
var hunters = [];
var food = [];
var poison = [];

var meanDNA = []
var popSize = []

var meanHunterDNA = []
var hunterPopSize = []

var maxFood = 100;
var maxPoision = 0;

var debug = false;
var hunterDebug = false

var numV = 100;
var numH = 2;

var bestVehicle;

var time = 0;
var sampleTime = 100

var debug = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(51);
  pixelDensity(1)
  for (var i = 0; i < numV; i++) {
    var vehicle = new Vehicle(random(width), random(height));
    vehicles.push(vehicle);
  }

  for (var i = 0; i < numH; i++) {
    var hunter = new Hunter(random(width), random(height));
    hunters.push(hunter);
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
  push()
  fill(255)
  text("Active Hunters: " + hunters.length,20,15)
  text("Active Prey: " + vehicles.length,20,30)
  text("Elapsed Timesteps: " + time,130,15)
  if(meanDNA[meanDNA.length-1]){
    let latestDNA = meanDNA[meanDNA.length-1]
    text("--Mean Prey DNA--",20,60)
    text("Food attraction: \t" + round(latestDNA[0]*100)/100,20,75)
    text("Hunter attraction: \t" + round(latestDNA[1]*100)/100,20,90)
    text("Food Detection Range: \t" + round(latestDNA[2]*100)/100,20,105)
    text("Hunter Detection Range: \t" + round(latestDNA[3]*100)/100,20,120)
    text("Turn Speed: \t" + round(latestDNA[4]*100)/100,20,135)
    text("Maximum Speed: \t" + round(latestDNA[5]*100)/100,20,150)
  }
  if(meanHunterDNA[meanHunterDNA.length-1]){
    let latestDNA = meanHunterDNA[meanHunterDNA.length-1]
    text("--Mean Hunter DNA--",20,180)
    text("Prey Detection Range: \t" + round(latestDNA[0]*100)/100,20,195)
    text("Turn Speed: \t" + round(latestDNA[1]*100)/100,20,210)
    text("Maximum Speed: \t" + round(latestDNA[2]*100)/100,20,225)
  }

  pop()
  time += 1;
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
      food.push(createVector(v.pos.x, v.pos.y));
      vehicles.splice(i, 1);
      continue;
    }

    var newVehicle = v.clone();

    if (newVehicle) {
      vehicles.push(newVehicle);
    }
  }

  for (var i = hunters.length - 1; i >= 0; i--) {
    var h = hunters[i];
    h.boundaries();
    h.behaviors(vehicles);
    h.update();
    h.show();

    // if (h.lifetime > maxLife) {
    //   bestVehicle = h;
    // }
    if (h.dead()) {
      food.push(createVector(h.pos.x, h.pos.y));
      hunters.splice(i, 1);
      continue;
    }

    var newHunter = h.clone();

    if (newHunter) {
      hunters.push(newHunter);
    }
  }

  if (random(1) < 0.015 && poison.length < maxPoision) {
    poison.push(createVector(random(width), random(height)));
  }

  if (random(1) < 0.05) {
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

  if(bestVehicle){
    push();
    fill(0, 0, 255, 100);
    ellipse(bestVehicle.pos.x, bestVehicle.pos.y, 20);
    pop();
  }


  if(time % sampleTime == 1){
    //collection Hunter DNA
    let collectedDNA = [0,0,0,0,0,0];
    for (let i =0; i < vehicles.length; i++){
      let v = vehicles[i]
      for (let j = 0; j < v.dna.length;j++){
        collectedDNA[j] += v.dna[j]/vehicles.length
      }
    }
    meanDNA.push(collectedDNA)
    popSize.push(vehicles.length)

    //collection Hunter DNA
    collectedDNA = [0,0,0];
    for (let i = 0; i < hunters.length; i++){
      let h = hunters[i]
      for (let j = 1; j < h.dna.length;j++){
        collectedDNA[j-1] += h.dna[j]/hunters.length
      }
    }  
    meanHunterDNA.push(collectedDNA)
    hunterPopSize.push(hunters.length)
  }
}

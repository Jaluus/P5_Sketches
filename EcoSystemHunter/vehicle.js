var mr = 0.4;
var fnut = 0.6;

function Vehicle(x, y, givenDNA, ancestors = 0, health = 1) {
  this.pos = createVector(x, y);
  //this.target = createVector(x, y);
  this.vel = p5.Vector.random2D();
  this.acc = createVector();

  this.health =  min(health,1);
  this.reproductionRate = 0.002;
  this.pickupRange = 4;

  this.foodBuffer = false

  //stats
  this.ancestors = ancestors;
  this.numChildren = 0;
  this.lifetime = 0;
  this.currentTarget = null;

  this.dna = [];
  if (givenDNA == undefined) {
    this.dna[0] = random(0, 2); //food weight
    this.dna[1] = random(-2, 0); //hunter Weight
    this.dna[2] = random(40, 100); //food vision distance
    this.dna[3] = random(40, 100); //hunter vision distance
    this.dna[4] = random(0.1, 0.4); //turnForce
    this.dna[5] = random(1, 4); //maxSpeed
  } else {
    this.dna = givenDNA.slice()
    this.mutate()
  }
}

Vehicle.prototype.mutate = function () {

  if (random(1) < mr) {
    this.dna[0] += random(-0.1, 0.1);
  }

  if (random(1) < mr) {
    this.dna[1] += random(-0.1, 0.1);
  }

  if (random(1) < mr) {
    this.dna[2] += random(-10, 10);
    if(this.dna[2] < 10){
      this.dna[2] = 10
    }
  }

  if (random(1) < mr) {
    this.dna[3] += random(-10, 10);
    if(this.dna[3] < 10){
      this.dna[3] = 10
    }
  }

  if (random(1) < mr) {
    this.dna[4] += random(-0.05, 0.05);
  }

  if (random(1) < mr) {
    this.dna[5] += random(-0.5, 0.5);
    if (this.dna[5] < 0.1) {
      this.dna[5] = 0.1;
    }
  }
}

Vehicle.prototype.update = function () {
  this.health -= this.dna[5] / 4000 + 0.0005;
  this.lifetime += 1;

  this.acc.normalize().mult(this.dna[4])
  this.acc.limit(this.dna[4]);
  this.vel.add(this.acc);
  this.vel.normalize().mult(this.dna[5]);
  this.pos.add(this.vel);
  this.acc.mult(0);
};

Vehicle.prototype.dead = function () {
  return this.health < 0;
};

Vehicle.prototype.show = function () {
  push();

  let gr = color(0, 255, 0);
  let rd = color(0, 0, 0);
  let col = lerpColor(rd, gr, this.health);

  fill(col);
  noStroke();
  translate(this.pos.x, this.pos.y);
  rotate(this.vel.heading() - PI / 2);
  triangle(-3, -3, 0, 6, 3, -3);

  if (debug) {
    noFill();
    stroke("green");
    ellipse(0, 0, this.dna[2] * 2);
    stroke("red");
    ellipse(0, 0, this.dna[3] * 2);
  }

  pop();
};

Vehicle.prototype.boundaries = function () {
  let desired = null;
  var d = 0; //Distance from the edge

  if (this.pos.x < d) {
    desired = createVector(this.dna[5], this.vel.y);
  } else if (this.pos.x > width - d) {
    desired = createVector(-this.dna[5], this.vel.y);
  }

  if (this.pos.y < d) {
    desired = createVector(this.vel.x, this.dna[5]);
  } else if (this.pos.y > height - d) {
    desired = createVector(this.vel.x, -this.dna[5]);
  }

  if (desired !== null) {
    desired.normalize();
    desired.mult(this.dna[5]);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.dna[4]);
    this.applyForce(steer);
  }
};

Vehicle.prototype.behaviors = function (a, b) {
  var fSteer = this.eat(a, fnut, this.dna[2]);
  var hSteer = this.eat(b, 0, this.dna[3]); // flee the Hunter

  fSteer.mult(this.dna[0]);
  hSteer.mult(this.dna[1]);

  resSteer = p5.Vector.add(fSteer,hSteer).normalize().mult(this.dna[4])

  this.applyForce(resSteer);
};

Vehicle.prototype.clone = function () {
  let repoProp = map(this.health, 0, 1, 0, this.reproductionRate);
  if(this.foodBuffer){
    this.foodBuffer = false;
    this.numChildren += 1;
    this.health -= 0.3;
    return new Vehicle(
      this.pos.x,
      this.pos.y,
      this.dna,
      this.ancestors + 1,
      1
    );
  }
  if (random(1) < repoProp && this.vel.mag() && this.health > 0.6) {
    this.numChildren += 1;
    this.health -= 0.3
    return new Vehicle(
      this.pos.x,
      this.pos.y,
      this.dna,
      this.ancestors + 1,
      this.health + 0.3
    );
  }
  return null;
};

Vehicle.prototype.eat = function (list, nut, perception) {
  var record = Infinity;
  var closestIndex = -1;
  for (var i = list.length - 1; i >= 0; i--) {
    var d = this.pos.dist(list[i]);

    //Eat if you wander over stuff
    if (d < this.pickupRange) {
      if(nut > 0){
        list.splice(i, 1);
      }
      this.health += nut;
      if (this.health > 1) {
        this.health = 1;
        this.foodBuffer = true;
      }
      continue;
    }

    if (d < record && d < perception) {
      record = d;
      closestIndex = i;
    }
  }

  if (list[closestIndex]) {
    this.currentTarget = list[closestIndex]
    return this.seek(this.currentTarget);
  }

  this.currentTarget = null;
  return createVector();
};

Vehicle.prototype.seek = function (t, perception) {
  var desired = p5.Vector.sub(t, this.pos);
  var d = desired.mag();
  //var speed = map(d, 0, perception, this.dna[5] / 2, this.dna[5], true); // the closer the slower!
  desired.setMag(this.dna[5]);
  var steer = p5.Vector.sub(desired, this.vel);
  steer.limit(this.dna[4]);
  return steer;
};

Vehicle.prototype.applyForce = function (f) {
  this.acc.add(f);
};

var mr = 0.4;
var fnut = 0.2;
var pnut = -0.6;

function Vehicle(x, y, givenDNA, ancestors = 0, health = 1) {
  this.pos = createVector(x, y);
  //this.target = createVector(x, y);
  this.vel = p5.Vector.random2D();
  this.acc = createVector();

  this.health = health;
  this.reproductionRate = 0.005;
  this.pickupRange = 4;

  //stats
  this.ancestors = ancestors;
  this.numChildren = 0;
  this.lifetime = 0;

  this.dna = [];
  if (givenDNA == undefined) {
    this.dna[0] = random(-2, 2); //food weight
    this.dna[1] = random(-2, 2); //poison Weight
    this.dna[2] = random(0, 70); //food vision distance
    this.dna[3] = random(0, 70); //poison vision distance
    this.dna[4] = random(0.1, 0.4); //turnForce
    this.dna[5] = random(3, 7); //maxSpeed
  } else {
    this.dna[0] = givenDNA[0]; //food weight
    if (random(1) < mr) {
      this.dna[0] += random(-0.1, 0.1);
    }
    this.dna[1] = givenDNA[1]; // poison Weight
    if (random(1) < mr) {
      this.dna[1] += random(-0.1, 0.1);
    }
    this.dna[2] = givenDNA[2]; //food vision distance
    if (random(1) < mr) {
      this.dna[2] += random(-10, 10);
    }
    this.dna[3] = givenDNA[3]; //poison vision distance
    if (random(1) < mr) {
      this.dna[3] += random(-10, 10);
    }
    this.dna[4] = givenDNA[4]; //turnForce
    if (random(1) < mr) {
      this.dna[4] += random(-0.05, 0.05);
    }
    this.dna[5] = givenDNA[5]; //maxSpeed
    if (random(1) < mr) {
      this.dna[5] += random(-0.5, 0.5);
      if (this.dna[5] < 0.1) {
        this.dna[5] = 0.1;
      }
    }
  }
}

Vehicle.prototype.update = function () {
  this.health -= this.dna[5] / 1000;

  this.lifetime += 1;

  this.acc.limit(this.dna[4]);
  this.vel.add(this.acc);
  this.vel.limit(this.dna[5]);
  this.pos.add(this.vel);
  this.acc.mult(0);
};

Vehicle.prototype.dead = function () {
  return this.health < 0;
};

Vehicle.prototype.show = function () {
  push();

  let gr = color(0, 255, 0);
  let rd = color(255, 0, 0);
  let col = lerpColor(rd, gr, this.health);

  fill(col);
  noStroke();
  translate(this.pos.x, this.pos.y);
  rotate(this.vel.heading() - PI / 2);
  triangle(-3, -3, 0, 6, 3, -3);

  if (debug) {
    noFill();
    stroke("green");
    line(0, 0, 0, this.dna[0] * 10);
    ellipse(0, 0, this.dna[2] * 2);
    stroke("red");
    line(0, 0, 0, this.dna[1] * 10);
    ellipse(0, 0, this.dna[3] * 2);
  }

  pop();
};

Vehicle.prototype.arrive = function (t) {
  var desired = p5.Vector.sub(t, this.pos);
  var d = desired.mag();
  var speed = this.dna[5];
  if (d < 100) {
    // 100 maxbe sensory range?
    var speed = map(d, 0, 100, 0, this.dna[5]);
  }
  desired.setMag(speed);
  var steer = p5.Vector.sub(desired, this.vel);
  steer.limit(this.dna[4]);
  return steer;
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
  var aSteer = this.eat(a, fnut, this.dna[2]);
  var bSteer = this.eat(b, pnut, this.dna[3]);

  aSteer.mult(this.dna[0]);
  bSteer.mult(this.dna[1]);

  this.applyForce(aSteer);
  this.applyForce(bSteer);
};

Vehicle.prototype.clone = function () {
  let repoProp = map(this.health, 0, 1, 0, this.reproductionRate);
  if (random(1) < repoProp && this.vel.mag() && this.health > 0.5) {
    this.numChildren += 1;
    return new Vehicle(
      this.pos.x,
      this.pos.y,
      this.dna,
      this.ancestors + 1,
      this.health
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
      list.splice(i, 1);
      this.health += nut;
      if (this.health > 1) {
        this.health = 1;
      }
      continue;
    }

    if (d < record && d < perception) {
      record = d;
      closestIndex = i;
    }
  }

  if (list[closestIndex]) {
    return this.seek(list[closestIndex]);
  }

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

var mr = 0.4;
var vnut = 1;

function Hunter(x, y, givenDNA, ancestors = 0, health = 1) {
  this.pos = createVector(x, y);
  this.vel = p5.Vector.random2D();
  this.acc = createVector();

  this.health = min(health,1);
  this.reproductionRate = 0.001;
  this.pickupRange = 8;

  this.overFeed = 0

  //stats
  this.ancestors = ancestors;
  this.numChildren = 0;
  this.lifetime = 0;
  this.currentTarget = null;

  this.dna = [];
  if (givenDNA == undefined) {
    this.dna[0] = random(0.0007,0.001); //reroduction rate
    this.dna[1] = random(70, 200); //food vision distance
    this.dna[2] = random(0.3,0.6); //turnForce
    this.dna[3] = random(5, 7); //maxSpeed
  } else {
    this.dna = givenDNA.slice()
    this.mutate()
  }
}

Hunter.prototype.mutate = function () {

  if(random(1) < mr){
    this.dna[0] += random(-0.0001,0.0001);
  }

  if (random(1) < mr) {
    this.dna[1] += random(-20, 20);
  }

  if (random(1) < mr) {
    this.dna[2] += random(-0.05, 0.05);
  }

  if (random(1) < mr) {
    this.dna[3] += random(-1, 1);
    if (this.dna[3] < 0.1) {
      this.dna[3] = 0.1;
    }
  }
}

Hunter.prototype.update = function () {
  this.health -= this.dna[3] / 3000 + 0.001;
  this.lifetime += 1;

  this.acc.normalize().mult(this.dna[2])
  this.acc.limit(this.dna[2]);
  this.vel.add(this.acc);
  this.vel.normalize().mult(this.dna[3]);
  this.pos.add(this.vel);
  this.acc.mult(0);
};

Hunter.prototype.dead = function () {
  if(this.health < 0){
    return true;
  }
  // if(this.lifetime > 2000 && this.numChildren > 3){
  //   return true;
  // }
  return false
};

Hunter.prototype.show = function () {
  push();

  let gr = color(255, 0, 0);
  let rd = color(0, 0, 0);
  let col = lerpColor(rd, gr, this.health);

  fill(col);
  noStroke();
  translate(this.pos.x, this.pos.y);
  rotate(this.vel.heading() - PI / 2);
  triangle(-6, -6, 0, 12, 6, -6);
  pop()
  if (hunterDebug) {
    push()
    noFill();
    stroke("green");
    if(this.currentTarget){
      line(this.pos.x, this.pos.y, this.currentTarget.x, this.currentTarget.y);
    }
    stroke("red");
    ellipse(this.pos.x, this.pos.y, this.dna[1] * 2);
    pop()
  }

};

Hunter.prototype.boundaries = function () {
  let desired = null;
  var d = 0; //Distance from the edge

  if (this.pos.x < d) {
    desired = createVector(this.dna[3], this.vel.y);
  } else if (this.pos.x > width - d) {
    desired = createVector(-this.dna[3], this.vel.y);
  }

  if (this.pos.y < d) {
    desired = createVector(this.vel.x, this.dna[3]);
  } else if (this.pos.y > height - d) {
    desired = createVector(this.vel.x, -this.dna[3]);
  }

  if (desired !== null) {
    desired.normalize();
    desired.mult(this.dna[3]);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.dna[2]);
    this.applyForce(steer);
  }
};

Hunter.prototype.behaviors = function (a) {
  var vSteer = this.eat(a, vnut, this.dna[1]);

  this.applyForce(vSteer);
};

Hunter.prototype.clone = function () {
  let repoProp = map(this.health, 0, 1, 0,  this.dna[0]);
  if (this.overFeed > 10){
    this.overFeed = 0
    this.numChildren += 1;
    this.health -= 0.3
    return new Hunter(
      this.pos.x,
      this.pos.y,
      this.dna,
      this.ancestors + 1,
      this.health + 0.3
    );
  }
  if (random(1) < repoProp && this.vel.mag() && this.health > 0.6) {
    this.numChildren += 1;
    this.health -= 0.3
    return new Hunter(
      this.pos.x,
      this.pos.y,
      this.dna,
      this.ancestors + 1,
      this.health + 0.3
    );
  }
  return null;
};

Hunter.prototype.eat = function (list, nut, perception) {
  var record = Infinity;
  var closestIndex = -1;
  for (var i = list.length - 1; i >= 0; i--) {
    var d = this.pos.dist(list[i].pos);

    //Eat if you wander over stuff
    if (d < this.pickupRange) {
      list.splice(i, 1);
      this.health += nut;
      if (this.health > 1) {
        if (this.health > 1.6){
          this.overFeed += 1;
        }
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
    this.currentTarget = list[closestIndex].pos
    return this.seek(this.currentTarget);
  }
  this.currentTarget = null;
  return createVector();
};

Hunter.prototype.seek = function (t, perception) {
  var desired = p5.Vector.sub(t, this.pos);
  var d = desired.mag();
  //var speed = map(d, 0, perception, this.dna[5] / 2, this.dna[5], true); // the closer the slower!
  desired.setMag(this.dna[3]);
  var steer = p5.Vector.sub(desired, this.vel);
  steer.limit(this.dna[2]);
  return steer;
};

Hunter.prototype.applyForce = function (f) {
  this.acc.add(f);
};

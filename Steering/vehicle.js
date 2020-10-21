function Vehicle(x,y){
    this.pos = createVector(random(width),random(height));
    this.target = createVector(x,y);
    this.vel = createVector();
    this.acc = createVector();
    this.r = 8;
    this.maxSpeed = 10;
    this.maxForce = 1;
}

Vehicle.prototype.update = function() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
}

Vehicle.prototype.show = function() {
    push()
    stroke(255);
    strokeWeight(4)
    point(this.pos.x,this.pos.y)
    pop()
}

Vehicle.prototype.behaviors = function() {
    var arrive = this.arrive(this.target); // return the force needed
    
    var mouse = createVector(mouseX,mouseY)
    var flee = this.flee(mouse);

    flee.mult(5)
    arrive.mult(1)

    this.applyForce(flee)
    this.applyForce(arrive);
}

Vehicle.prototype.arrive = function (t) {
    var desired = p5.Vector.sub(t,this.pos);
    var d = desired.mag()
    var speed = this.maxSpeed;
    if ( d < 100 ) { // 100 maxbe sensory range?
        var speed = map(d,0,100,0,this.maxSpeed)
    }
    desired.setMag(speed)
    var steer = p5.Vector.sub(desired,this.vel)
    steer.limit(this.maxForce)
    return steer;
}

Vehicle.prototype.flee = function (t) {
    var desired = p5.Vector.sub(t,this.pos);
    var d = desired.mag()
    if (d<50){
        desired.setMag(this.maxSpeed)
        desired.mult(-1);
        var steer = p5.Vector.sub(desired,this.vel)
        steer.limit(this.maxForce)
        return steer;
    }
    return createVector(0,0);
}

Vehicle.prototype.applyForce = function(f) {
    this.acc.add(f);
}
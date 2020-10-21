function Vehicle(x,y){
    this.pos = createVector(random(width),random(height));
    this.target = createVector(x,y);
    this.vel = createVector();
    this.acc = createVector();
    this.r = 6;
    this.maxSpeed = 5;
    this.maxForce = 0.2;
    this.health = 1

    this.dna = []
    this.dna[0] = random(-5,5)
    this.dna[1] = random(-5,5)
}

Vehicle.prototype.update = function() {
    this.health -= 0.001
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
}

Vehicle.prototype.dead = function() {
    return (this.health < 0)
}

Vehicle.prototype.show = function() {
    push()

    let gr = color(0,255,0)
    let rd = color(255,0,0)
    let col = lerpColor(rd,gr,this.health)

    fill(col)
    noStroke()
    translate(this.pos.x,this.pos.y)
    rotate(this.vel.heading() - PI/2)
    triangle(-5,-5,0,10,5,-5)
    stroke("green")
    line(0,0,0,this.dna[0] * 10)
    stroke("red")
    line(0,0,0,this.dna[1] * 10)
    pop()
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

Vehicle.prototype.behaviors = function(a,b) {
    var aSteer = this.eat(a,0.1);
    var bSteer = this.eat(b,-0.5);

    aSteer.mult(this.dna[0])
    bSteer.mult(this.dna[1])

    this.applyForce(aSteer)
    this.applyForce(bSteer)
}

Vehicle.prototype.eat = function(list,nut){
    var record = Infinity;
    var closestIndex = -1
    for (var i = 0; i<list.length;i++){
        d = this.pos.dist(list[i])
        if ( d < record ){
            record = d;
            closestIndex = i
        }
    }

    if( record < 5 ){
        list.splice(closestIndex,1)
        this.health += nut
    }

    if ( list[closestIndex] ){
        return this.seek(list[closestIndex]);
    }

    return createVector()
}

Vehicle.prototype.seek = function (t) {
    var desired = p5.Vector.sub(t,this.pos);

    desired.setMag(this.maxSpeed)

    var steer = p5.Vector.sub(desired,this.vel)
    steer.limit(this.maxForce)
    return steer
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
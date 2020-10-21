var vehicles = []

var food = []
var poison = []

var numV = 2

function setup() {
  createCanvas(500, 300);
  background(51)
  
  for (var i = 0; i < numV;i++){
    var vehicle = new Vehicle(random(width),random(height))
    vehicles.push(vehicle);
  }

  for(var i = 0; i< 10; i++){
    food.push(createVector(random(width),random(height)))
  }

  for(var i = 0; i< 10; i++){
    poison.push(createVector(random(width),random(height)))
  }

}

function draw() {
  background(51)
  var target = createVector(mouseX,mouseY)
  for (var i = vehicles.length-1; i >=0;i--){
    var v = vehicles[i]
    v.behaviors(food,poison)
    v.update()
    v.show()

    if (v.dead()){
      vehicles[i].splice(i,1)
    }

  }

  for (var i = 0; i< food.length; i++) {
    var foodpt = food[i]
    push()
    fill(0,255,0)
    ellipse(foodpt.x,foodpt.y,5)
    pop()
  }

  for (var i = 0; i< poison.length; i++) {
    var poisonpt = poison[i]
    push()
    fill(255,0,0)
    ellipse(poisonpt.x,poisonpt.y,5)
    pop()
  }

}
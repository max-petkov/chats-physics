// TODO Create a chain between circle and rectangle -> Maybe use Matter.Composites
// https://brm.io/matter-js/docs/classes/Composites.html
// https://brm.io/matter-js/demo/#constraints
// https://github.com/liabru/matter-js/blob/master/examples/constraints.js

// TODO
// 1. Add resize event
// 2. Add ScrollEvent (maybe with GSAP Observer on scroll)


function CustomerExperience() {
  this.element = document.querySelector("section");
  this.width = this.element.getBoundingClientRect().width;
  this.height = this.element.getBoundingClientRect().height;

  this.engine = Matter.Engine.create();
  this.engine.gravity.y = 0.3
  this.world = this.engine.world;
  this.composite = Matter.Composite;
  this.composites = Matter.Composites;
  this.body = Matter.Body;
  this.bodies = Matter.Bodies;
  this.constraint = Matter.Constraint;
  this.mouseConstraint = Matter.MouseConstraint;
  this.mouse = Matter.Mouse;
  this.runner = Matter.Runner.create();
  this.events = Matter.Events;
  this.render = Matter.Render.create({
    element: this.element,
    engine: this.engine,
    options: {
      width: this.width,
      height: this.height,
      showAngleIndicator: true,
      // wireframes: false,
      // background: "#ff0000",
    },
  });

  Matter.Render.run(this.render);
  Matter.Runner.run(this.runner, this.engine);

  this.createWalls();
  this.createChats();
  this.mouseControl();

  this.events.on(this.runner, "tick", function(e) {
    const bodies = this.composite.allBodies(this.world).filter(body => body.label !== "wall");
    const rect = bodies[0];
    const circ = bodies[1];
    
    const avatar = document.querySelector(".avatar");
    const bubble = document.querySelector(".bubble");

    bubble.style.top = rect.position.y + "px";
    bubble.style.left = rect.position.x + "px";
    bubble.style.transform = `translate(-50%, -50%) rotate(${rect.angle}rad)`;

    avatar.style.top = circ.position.y + "px";
    avatar.style.left = circ.position.x + "px";
    avatar.style.transform = `translate(-50%, -50%) rotate(${circ.angle}rad)`;


  }.bind(this))
}

CustomerExperience.prototype.createChats = function() {
  const x = 200;
  const y = 400;
  const w = 270;
  const h = 75.2;
  const r = 20;
  const gap = 8;

  const rect = this.bodies.rectangle(x, y, w, h, {label: "rect", chamfer: {radius: [16,16,16,4]}});
  const circ = this.bodies.circle(Math.abs(x - (w / 2) - (r + gap)), y, r, {label: "circ"});

  const constraint = Matter.Constraint.create({
      bodyA: rect,
      bodyB: circ,
  });

  Matter.Composite.add(this.world, [rect, circ, constraint]);
}

CustomerExperience.prototype.createWalls = function() {
  const options = {
    isStatic: true,
    label: "wall",
    render: { fillStyle: "transparent", strokeStyle: "transparent" },
  };
  const top = this.bodies.rectangle(0, -150, 2 * this.width, 300, options);
  const bottom = this.bodies.rectangle(0, this.height + 25, 2 * this.width, 60, options);
  const left = this.bodies.rectangle(-150, 0, 300, 2 * this.height, options);
  const right = this.bodies.rectangle(this.width + 148, 0, 300, 2 * this.height, options);

  this.composite.add(this.world, [top, bottom, left, right]);
}

CustomerExperience.prototype.mouseControl = function() {
  const mouse = this.mouse.create(this.render.canvas);
  const mouseConstraint = this.mouseConstraint.create(this.engine, {
      mouse: mouse,
      constraint: {
          angularStiffness: -1,
          stiffness: 1,
          render: {
              visible: false
          }
      }
  });

  this.composite.add(this.world, mouseConstraint);
  this.render.mouse = mouse;
}

// Invoke
new CustomerExperience();
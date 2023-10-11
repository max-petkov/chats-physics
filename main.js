// TODO Create a chain between circle and rectangle -> Maybe use Matter.Matter.Composites
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
  this.engine.gravity.y = 0.5
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
      wireframes: false,
    },
  });

  Matter.Render.run(this.render);
  Matter.Runner.run(this.runner, this.engine);

  this.createWalls();
  this.createChats();
  this.mouseControl();

  this.events.on(this.runner, "tick", function(e) {
    const bodies = this.composite.allBodies(this.world).filter(body => body.label !== "wall");

    bodies.forEach(body => {
      const avatar = document.querySelector(`[data-avatar="${body.label}"]`);
      const bubble = document.querySelector(`[data-bubble="${body.label}"]`);

      if(avatar) {
        avatar.style.top = body.position.y + "px";
        avatar.style.left = body.position.x + "px";
        avatar.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
      }

      if(bubble) {
        bubble.style.top = body.position.y + "px";
        bubble.style.left = body.position.x + "px";
        bubble.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
      }
    });
  }.bind(this))
}

CustomerExperience.prototype.createChats = function() {
  const chats = document.querySelectorAll(".chats-container");

  chats.forEach(chat => {
    const group = this.body.nextGroup(true);
    const avatar = chat.firstElementChild;
    const bubble = chat.lastElementChild;

    const borderWidth = parseFloat(getStyle(bubble, "border-width").split("px").join("")) * 2;
    const padding = parseFloat(getStyle(bubble, "padding").split("px").join("")) / 2;
    const w = bubble.scrollWidth + borderWidth;
    const h = bubble.scrollHeight + borderWidth + padding;
    const r = parseFloat(avatar.getBoundingClientRect().height) / 2;
    const gap = 8;

    const x = randomNumber(w - (r * 2) - gap, window.innerWidth - (w - (r * 2) - gap));
    const y = h;
    
    const rect = this.bodies.rectangle(x, y, w, h, {
      label: bubble.getAttribute("data-bubble"), 
      chamfer: {radius: [16,16,16,4]},
      collisionFilter: {
        group: group
      },
      friction: 0.3
    });

    const circ = this.bodies.circle(0, 0, r, {
      label: avatar.getAttribute("data-avatar"), 
      collisionFilter: {
        group: group
      },
      friction: 0.3
    });
  
    const constraint = Matter.Constraint.create({
        bodyA: circ,
        bodyB: rect,
        pointB: { x: -1 * (w / 2) - (r + gap), y: (h / 2) - r },
        length: 0
    });
  
    Matter.Composite.add(this.world, [rect, circ, constraint]);
  });
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
          render: {
              visible: false
          }
      }
  });

  this.composite.add(this.world, mouseConstraint);
  this.render.mouse = mouse;
}

function getStyle(el, style) {
  return getComputedStyle(el).getPropertyValue(style);
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Invoke
new CustomerExperience();
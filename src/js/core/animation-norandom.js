/*
===============================================================
CANVAS ANIMATION TUTORIAL (*canvasAnimation)
===============================================================
This file is a self-contained lesson on how to animate shapes on an HTML5
<canvas>. It is used by the canvas-keyboard-response trial defined in
src/js/core/trial.js, but everything about *how the animation works* lives
here so it can be read top-to-bottom like a lesson: each numbered step below
builds on the one before it.

The big picture:
  1. A <canvas> is just a grid of pixels with a drawing context (`ctx`) that
     gives you methods like `ctx.arc()` (circles), `ctx.fillRect()`
     (rectangles), and `ctx.lineTo()` (arbitrary paths, e.g. triangles).
  2. "Animation" is just: clear the canvas, move things a little bit, redraw
     them, and repeat -- fast enough (~60 times per second) that it looks
     like smooth motion. The browser gives us `requestAnimationFrame()` to
     do the "repeat, ~60 times per second" part.
  3. Each shape is a plain JS object holding its position (x, y), velocity
     (vx, vy = pixels moved per frame, in each direction), size, and color.
     Every frame we do `x += vx` and `y += vy` -- that's the entire
     "trajectory" of the object.
  4. "Bouncing" off a wall or another shape is nothing magical: it is just
     flipping the sign of a velocity component (vx or vy) at the right
     moment so the shape starts moving the other way.

Unlike animation-randomtraj.js, every shape here moves with the exact same
fixed trajectory (options.fixedVx / options.fixedVy) -- there is no random
speed or direction to configure.

Table of Contents:
    Step 1. Create the shapes (fixed trajectory/speed)
    Step 2. Draw each shape type (circle / square / triangle)
    Step 3. Move shapes + bounce off the canvas walls
    Step 4. Bounce shapes off each other
    Step 5. The animation loop itself (start/stop)
===============================================================
*/

/*
createCanvasAnimation(ctx, canvasWidth, canvasHeight, options)

Sets everything up and returns `{ start, stop }`:
  - call `.start()` once to begin animating
  - call `.stop()` when you're done (e.g. when the jsPsych trial ends) so the
    animation loop doesn't keep running forever in the background.

`options` lets you configure the demo without editing this file:
    numShapes   (default 6) how many shapes to animate
    shapeSize   (default 50) pixel "diameter" of each shape
    fixedVx     pixels moved per frame along x, for every shape
    fixedVy     pixels moved per frame along y, for every shape
*/
function createCanvasAnimation(ctx, canvasWidth, canvasHeight, options) {
    options = options || {};

    var numShapes = options.numShapes || 6;
    var shapeSize = options.shapeSize || 50;
    var fixedVx = options.fixedVx;
    var fixedVy = options.fixedVy;

    var shapeColors = ['#4C72B0', '#DD8452', '#55A868', '#C44E52', '#8172B2', '#937860'];
    var shapeTypesToUse = ['circle', 'square', 'triangle'];

    /*--------------------------- Step 1: Create the shapes ---------------------------
      Each shape is just a plain object. `x`/`y` is its center point, `vx`/`vy`
      is how many pixels it moves per frame along each axis, and `size` is used
      both for drawing (how big to draw it) and for collision detection (we
      treat every shape as if it had a circular hitbox of radius size/2 -- see
      Step 4 for why this simplification is convenient).

      Every shape starts with the exact same velocity (fixedVx, fixedVy) --
      that's the whole "trajectory" for this file, no randomness involved.
    -------------------------------------------------------------------------------*/
    var shapes = [];
    for (var i = 0; i < numShapes; i++) {
        // Keep starting positions away from the very edge so nothing spawns
        // already overlapping a wall.
        var margin = shapeSize;
        shapes.push({
            type: shapeTypesToUse[i % shapeTypesToUse.length],
            x: margin + Math.random() * (canvasWidth - margin * 2),
            y: margin + Math.random() * (canvasHeight - margin * 2),
            vx: fixedVx,
            vy: fixedVy,
            size: shapeSize,
            color: shapeColors[i % shapeColors.length],
        });
    }

    /*--------------------------- Step 2: Draw each shape type ---------------------------
      These are the only three functions that know how to put pixels on
      screen. Everything else in this file just does math on x/y/vx/vy and
      then calls one of these to render the result.
    -----------------------------------------------------------------------------------*/
    function drawCircle(shape) {
        ctx.beginPath();
        // arc(centerX, centerY, radius, startAngle, endAngle)
        ctx.arc(shape.x, shape.y, shape.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = shape.color;
        ctx.fill();
    }

    function drawSquare(shape) {
        // fillRect draws from its top-left corner, so we offset by half the
        // size to keep (shape.x, shape.y) as the *center* of the square,
        // matching how circle/triangle are centered.
        ctx.fillStyle = shape.color;
        ctx.fillRect(
            shape.x - shape.size / 2,
            shape.y - shape.size / 2,
            shape.size,
            shape.size,
        );
    }

    function drawTriangle(shape) {
        var radius = shape.size / 2;
        // Three points spaced 120 degrees apart around the center give an
        // equilateral triangle. -90 degrees (i.e. -Math.PI/2) puts the first
        // point straight up, purely so it looks "upright".
        var angles = [-90, 30, 150].map(function (deg) {
            return (deg * Math.PI) / 180;
        });
        ctx.beginPath();
        ctx.moveTo(
            shape.x + radius * Math.cos(angles[0]),
            shape.y + radius * Math.sin(angles[0]),
        );
        ctx.lineTo(
            shape.x + radius * Math.cos(angles[1]),
            shape.y + radius * Math.sin(angles[1]),
        );
        ctx.lineTo(
            shape.x + radius * Math.cos(angles[2]),
            shape.y + radius * Math.sin(angles[2]),
        );
        ctx.closePath();
        ctx.fillStyle = shape.color;
        ctx.fill();
    }

    function drawShape(shape) {
        if (shape.type === 'circle') {
            drawCircle(shape);
        } else if (shape.type === 'square') {
            drawSquare(shape);
        } else if (shape.type === 'triangle') {
            drawTriangle(shape);
        }
    }

    /*--------------------------- Step 3: Move + bounce off walls ---------------------------
      "Moving" is just adding velocity to position every frame. "Bouncing" off
      a wall is just flipping the sign of vx or vy once the shape's edge
      reaches that wall, and nudging it back inside so it doesn't get stuck
      slightly past the boundary.
    --------------------------------------------------------------------------------------*/
    function updatePosition(shape) {
        shape.x += shape.vx;
        shape.y += shape.vy;
    }

    function bounceOffWalls(shape) {
        var radius = shape.size / 2;

        if (shape.x - radius <= 0) {
            shape.x = radius;
            shape.vx = Math.abs(shape.vx);   // force moving right
        } else if (shape.x + radius >= canvasWidth) {
            shape.x = canvasWidth - radius;
            shape.vx = -Math.abs(shape.vx);  // force moving left
        }

        if (shape.y - radius <= 0) {
            shape.y = radius;
            shape.vy = Math.abs(shape.vy);   // force moving down
        } else if (shape.y + radius >= canvasHeight) {
            shape.y = canvasHeight - radius;
            shape.vy = -Math.abs(shape.vy);  // force moving up
        }
    }

    /*--------------------------- Step 4: Bounce off each other ---------------------------
      To keep collision detection simple, we treat every shape (even the
      square and triangle) as a circle with radius = size/2 for the purposes
      of "did these two shapes touch?". This is a common simplification for
      teaching purposes -- it's not pixel-perfect for the corners of a square
      or triangle, but it's easy to reason about and looks convincing.

      Two circles are touching/overlapping when the distance between their
      centers is less than the sum of their radii.
    --------------------------------------------------------------------------------------*/
    function resolveCollision(a, b) {
        var dx = b.x - a.x;
        var dy = b.y - a.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        var minDistance = a.size / 2 + b.size / 2;

        if (distance === 0 || distance >= minDistance) {
            return; // not touching, nothing to do
        }

        // (a) Push the shapes apart along the line connecting their centers,
        // so they don't stay stuck inside each other on the next frame.
        var nx = dx / distance; // unit vector pointing from a -> b
        var ny = dy / distance;
        var overlap = minDistance - distance;
        a.x -= (nx * overlap) / 2;
        a.y -= (ny * overlap) / 2;
        b.x += (nx * overlap) / 2;
        b.y += (ny * overlap) / 2;

        // (b) Reflect velocity along that same line (the "collision
        // normal"). This is the standard equal-mass elastic collision
        // formula: it swaps the component of each shape's velocity that
        // points along the line between the centers, and leaves the sideways
        // component untouched -- which is what makes a head-on collision
        // bounce straight back, and a glancing collision mostly slide past.
        var relativeVx = a.vx - b.vx;
        var relativeVy = a.vy - b.vy;
        var velocityAlongNormal = relativeVx * nx + relativeVy * ny;

        // If this is positive, the shapes are moving toward each other; if
        // negative, they're already moving apart (e.g. we resolved this same
        // pair last frame) and shouldn't bounce again.
        if (velocityAlongNormal > 0) {
            a.vx -= velocityAlongNormal * nx;
            a.vy -= velocityAlongNormal * ny;
            b.vx += velocityAlongNormal * nx;
            b.vy += velocityAlongNormal * ny;
        }
    }

    function checkAllCollisions() {
        // Compare every pair of shapes exactly once (that's why the inner
        // loop starts at i + 1, not 0).
        for (var i = 0; i < shapes.length; i++) {
            for (var j = i + 1; j < shapes.length; j++) {
                resolveCollision(shapes[i], shapes[j]);
            }
        }
    }

    /*--------------------------- Step 5: The animation loop ---------------------------
      This is where everything comes together. Every call to `animate()`:
        1. Wipes the canvas clean (otherwise old frames would smear together).
        2. Moves every shape.
        3. Bounces anything that hit a wall.
        4. Bounces anything that hit another shape.
        5. Draws every shape in its new position.
        6. Asks the browser to call `animate()` again before the next repaint
           (requestAnimationFrame -> smooth ~60fps loop).

      requestAnimationFrame() returns an id we can pass to
      cancelAnimationFrame() -- that's how `stop()` below is able to halt the
      loop when the caller is done with it.
    --------------------------------------------------------------------------*/
    var animationFrameId = null;

    function animate() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        shapes.forEach(updatePosition);
        shapes.forEach(bounceOffWalls);
        checkAllCollisions();
        shapes.forEach(drawShape);

        animationFrameId = requestAnimationFrame(animate);
    }

    return {
        start: function () {
            animate();
        },
        stop: function () {
            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        },
    };
}

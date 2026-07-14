/*
===============================================================
CANVAS ANIMATION TUTORIAL (*canvasAnimation) -- BEGINNER VERSION
===============================================================
This file is a self-contained lesson on how to animate a shape on an HTML5
<canvas>. It is used by the canvas-keyboard-response trial defined in
src/js/core/trial.js, but everything about *how the animation works* lives
here so it can be read top-to-bottom like a lesson: each numbered step below
builds on the one before it.

The big picture:
  1. A <canvas> is just a grid of pixels with a drawing context (`ctx`) that
     gives you methods like `ctx.arc()` (circles), `ctx.fillRect()`
     (rectangles), and `ctx.lineTo()` (arbitrary paths, e.g. triangles).
  2. "Animation" is just: clear the canvas, move the shape a little bit,
     redraw it, and repeat -- fast enough (~60 times per second) that it
     looks like smooth motion. The browser gives us `requestAnimationFrame()`
     to do the "repeat, ~60 times per second" part.
  3. The shape is a plain JS object holding its position (x, y), velocity
     (vx, vy = pixels moved per frame, in each direction), size, and color.
     Every frame we do `x += vx` and `y += vy` -- that's the entire
     "trajectory" of the object.
  4. Here, vx/vy aren't picked directly -- they're worked out from two
     hardcoded points (a start position and an end position) and how long (in
     milliseconds) we want the trip to take. See Step 1.

Table of Contents:
    Step 0. (alternative, disabled) Set velocity/direction directly
    Step 1. Create the shape (hardcoded start position -> end position)
    Step 2. Draw the shape (circle / square / triangle)
    Step 3. Move the shape each frame (wall-bouncing available, but disabled)
    Step 4. The animation loop itself (start/stop)
===============================================================
*/

/*
createCanvasAnimation(ctx, canvasWidth, canvasHeight, options)

Sets everything up and returns `{ start, stop }`:
  - call `.start()` once to begin animating
  - the animation stops itself automatically once `durationMs` milliseconds
    have elapsed -- see Step 4 -- so you don't *have* to call `.stop()`
  - you can still call `.stop()` yourself at any time (e.g. if the jsPsych
    trial ends early) to stop it sooner; calling it after the animation has
    already stopped itself is harmless

`options` lets you configure the demo without editing this file:
    shapeType    (default 'circle')   which shape to draw -- 'circle',
                                       'square', or 'triangle'
    shapeSize    (default 50)         pixel "diameter" of the shape
    shapeColor   (default '#4C72B0')  fill color of the shape
    durationMs   (default 3000)       how long (in milliseconds) the trip
                                       from the start position to the end
                                       position should take -- see Step 1
*/
function createCanvasAnimation(ctx, canvasWidth, canvasHeight, options) {
    options = options || {};

    var shapeType = options.shapeType || 'circle';
    var shapeSize = options.shapeSize || 50;
    var shapeColor = options.shapeColor || '#ff0400';
    var durationMs = options.durationMs || 3000;

    /* ==========================================================================
       STEP 0 (ALTERNATIVE) -- pick velocity/direction directly -- disabled

       Step 1 below works backward from a start point, an end point, and a
       duration to figure out vx/vy for you. That's convenient, but it hides
       what vx/vy actually mean. If you'd rather set the shape's velocity and
       direction of travel directly, comment out Step 1's shape-creation code
       and uncomment this block instead -- it makes the same `shape` object,
       just by picking vx/vy yourself instead of deriving them.

    var startX = 60;
    var startY = 60;

    // vx/vy are pixels moved per frame, along each axis. The *sign* sets the
    // direction: positive vx moves right, negative vx moves left; positive
    // vy moves down, negative vy moves up. The *magnitude* sets the speed.
    var vx = 4;  // move rightward 4px per frame
    var vy = 2;  // move downward 2px per frame

    var shape = {
        type: shapeType,
        x: startX,
        y: startY,
        vx: vx,
        vy: vy,
        size: shapeSize,
        color: shapeColor,
    };

    ========================================================================== */

    /*--------------------------- Step 1: Create the shape ---------------------------
      The shape is just a plain object. `x`/`y` is its center point, `vx`/`vy`
      is how many pixels it moves per frame along each axis, and `size` is used
      both for drawing (how big to draw it) and for its hitbox if you turn wall
      bouncing back on in Step 3.

      Instead of picking a direction/speed, we just hardcode where the shape
      starts and where it ends up, and how long (in milliseconds) the trip
      should take. Edit the START_/END_ numbers below to change the path, or
      pass `durationMs` in options to change the speed.

      requestAnimationFrame calls us about FRAMES_PER_SECOND times per second,
      so "how many frames the trip takes" is just the duration in seconds
      multiplied by that frame rate -- and "how far to move each frame" is
      just the total distance divided by that many frames.
    -------------------------------------------------------------------------------*/
    var startX = 60;
    var startY = 60;
    var endX = canvasWidth - 60;
    var endY = canvasHeight - 60;

    var FRAMES_PER_SECOND = 60; // requestAnimationFrame's usual target rate
    var framesToTravel = (durationMs / 1000) * FRAMES_PER_SECOND;

    // vx/vy = "how far to go" divided by "how many frames to take" --
    // that's the per-frame step size that gets us from start to end.
    var vx = (endX - startX) / framesToTravel;
    var vy = (endY - startY) / framesToTravel;

    var shape = { // this is known as a javascript "plain object"
        type: shapeType,
        x: startX,
        y: startY,
        vx: vx,
        vy: vy,
        size: shapeSize,
        color: shapeColor,
    };

    /*--------------------------- Step 2: Draw the shape ---------------------------
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

    var BOUNDS_BORDER_WIDTH = 2; // pixels

    function drawCanvasBounds() {
        // Canvas strokes are centered *on* the path you draw, not inside it --
        // so a stroke drawn right at the edge (x=0) would have half its width
        // clipped off-canvas. Insetting by half the border width keeps the
        // whole border on-screen and pixel-aligned (no blurry anti-aliasing).
        var inset = BOUNDS_BORDER_WIDTH / 2;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = BOUNDS_BORDER_WIDTH;
        ctx.strokeRect(
            inset,
            inset,
            canvasWidth - BOUNDS_BORDER_WIDTH,
            canvasHeight - BOUNDS_BORDER_WIDTH,
        );
    }

    /*--------------------------- Step 3: Move the shape each frame ---------------------------
      "Moving" is just adding velocity to position every frame -- that's all
      `updatePosition` does. Once the shape reaches its hardcoded end position
      it just keeps going (and would eventually move off-canvas), because wall
      bouncing is switched off by default in this beginner version -- but in
      practice `durationMs` runs out (see Step 4) and stops the animation
      loop before that becomes visible, since `vx`/`vy` are sized so the trip
      finishes right around then.
    ----------------------------------------------------------------------------------------*/
    function updatePosition(shape) {
        shape.x += shape.vx;
        shape.y += shape.vy;
    }

    /* ==========================================================================
       WALL BOUNCING -- disabled right now

       To make the shape bounce off the canvas edges instead of flying off
       screen, uncomment the `bounceOffWalls` function below, AND uncomment
       the `bounceOffWalls(shape);` line inside `animate()` in Step 4.

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

    ========================================================================== */

    /*--------------------------- Step 4: The animation loop ---------------------------
      This is where everything comes together. requestAnimationFrame() hands
      its callback a timestamp (milliseconds since the page loaded) for free
      -- we save the timestamp of the very first frame as `startTimestamp`,
      and every later frame just checks "how long ago was that?" to know
      when `durationMs` has run out.

      Every call to `animate()`:
        1. Checks whether `durationMs` has elapsed since the first frame; if
           so, it stops scheduling new frames and returns early -- no more
           moving or drawing happens after this point.
        2. Otherwise, wipes the canvas clean (otherwise old frames would
           smear together) and redraws the canvas-bounds border (`clearRect`
           would otherwise wipe it out every frame too).
        3. Moves the shape.
        4. (optionally) bounces it if it hit a wall -- see Step 3.
        5. Draws the shape in its new position.
        6. Asks the browser to call `animate()` again before the next repaint
           (requestAnimationFrame -> smooth ~60fps loop).

      requestAnimationFrame() returns an id we can pass to
      cancelAnimationFrame() -- that's how `stop()` below is able to halt the
      loop early too, e.g. if the caller wants to cut the animation short.
    --------------------------------------------------------------------------*/
    var animationFrameId = null;
    var startTimestamp = null;

    function animate(timestamp) {
        if (startTimestamp === null) {
            startTimestamp = timestamp;
        }

        if (timestamp - startTimestamp >= durationMs) {
            // Time's up -- stop here instead of scheduling another frame.
            animationFrameId = null;
            return;
        }

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        drawCanvasBounds();

        updatePosition(shape);
        // bounceOffWalls(shape); // uncomment along with Step 3 above
        drawShape(shape);

        animationFrameId = requestAnimationFrame(animate); // this is where the loop is. It calls itself at the end of every frame.
    }

    return {
        start: function () {
            animationFrameId = requestAnimationFrame(animate);
        },
        stop: function () {
            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        },
    };
}

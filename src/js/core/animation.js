function createAnimation(
    ctx, 
    canvas_height,
    canvas_width,
    settings,
) {

    /* General Variables */

    var startx = 60;
    var starty = 60;

    var endx = canvas_width - 60;
    var endy = canvas_height - 60;

    var velocityx = 75; //pixels per frame
    var velocityy = 50;


    /* Define shape */

    var mainShape = {
        type: settings.thisShape,
        size: settings.shapeSize,
        color: settings.shapeColor,
        x: startx,
        y: starty,
        vx: velocityx,
        vy: velocityy   
    }; 


    /* Drawing Shape */

    function drawCircle(shape) {
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, (shape.size/2), 0, (2*Math.PI));
        ctx.fillStyle = shape.color;
        ctx.fill();
    };// end drawCircle

    function updatePosition(shape) {
        shape.x += shape.vx;
        shape.y += shape.vy;
    };//end updatePosition

    



//create, draw, move (wipe & draw)//

/* time tracking variables */


    var startTimeStamp = null;
    var animationFrameId = null;


    function animate(timeStamp) {
        if(startTimeStamp == null) {
            startTimeStamp = timeStamp; 
        }; //start mechanism
        if(timeStamp - startTimeStamp >= settings.animatonLength) {
            animationFrameId = null;
        }; //stop mechanism for time
        if(shape.x >= endx || shape.y >= endy) {
            animationFrameId = null;
        }; // stop mechanism for location

        ctx.clearRect(0,0, canvas_width, canvas_height); //wipes the current frame by clearing context
        updatePosition(mainShape);
        drawCircle(mainShape);
        console.log(timeStamp);
        animationFrameId = requestAnimationFrame(animate); // convention for animating loop (recursion!)
    };//end animate

    return {
        start: function() {
            animationFrameId = requestAnimationFrame(animate);
        }, //end start
        stop: function () {
            if(animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            };
        }, //end stop
    }; //end return

}; //end createAnimation

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
        ctx.drawPath();
        ctx.arc(shape.x, shape.y, (shape.size/2), 0, (2*Math.PI));
        ctx.fillStyle = shape.color;
        ctx.fill();
    };// end drawCircle

    function updatePosition(shape) {
        shape.x += shape.vx;
        shape.y += shape.vy;
    }//end updatePosition

    



//create, draw, move (wipe & draw) 
} //end createAnimation
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

    var velocityx = 7.5/10; //pixels per frame
    var velocityy = 5.0/10;


    function elevateCanvas() {
        var border_width = 100;
        var inset_displacement = border_width/2 
        ctx.lineWidth = border_width;
        ctx.strokeStyle = "#00BFFF"
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        
        ctx.strokeRect(inset_displacement, inset_displacement, canvas_width-border_width, canvas_height-border_width);
        ctx.fill();
        ctx.fillStyle = "green"
        ctx.fillRect(inset_displacement, inset_displacement, canvas_width-border_width, canvas_height-border_width);
        ctx.fill();

        tree1 = new Image();
        tree1.src = "C:/Users/mcpro/OneDrive/Documents/WAVE LAB/Code/canvas-animation/src/assets/stimuli/evergreen_tree.png";
        ctx.drawImage(tree1, w/4, h/4, shape.size, shape.size);

        tree2 = new Image();
        tree2.src = "C:/Users/mcpro/OneDrive/Documents/WAVE LAB/Code/canvas-animation/src/assets/stimuli/evergreen_tree.png";
        ctx.drawImage(tree2, canvas_width- w/2,  canvas_height - h/2, shape.size, shape.size);

        tree3 = new Image();
        tree3.src = "C:/Users/mcpro/OneDrive/Documents/WAVE LAB/Code/canvas-animation/src/assets/stimuli/evergreen_tree.png";
        ctx.drawImage(tree3, w/8,  h/8, shape.size, shape.size);


    };


    function bounceOffWalls(shape) {
        var radius = shape.size/2;
        if(shape.x - radius <= 0) {
            shape.vx = Math.abs(shape.vx)
            shape.x = shape.x + shape.vx + radius; 
        } else if(shape.x + radius >= canvas_width) {
            shape.vx = -1*Math.abs(shape.vx);
            shape.x = shape.x - radius - shape.vx;
        };
        if(shape.y - radius <= 0) {
            shape.vy = Math.abs(shape.vy);
            shape.y = shape.y + shape.vy + radius;
        } else if (shape.y + radius >= canvas_height) {
            shape.vy = -1 * Math.abs(shape.vy);
            shape.y = shape.y - radius - shape.vy;
        };
    }; //end 


    /* Define shape */

    var shape = {
        type: settings.thisShape,
        size: settings.shapeSize,
        color: settings.shapeColor,
        x: startx,
        y: starty,
        vx: velocityx,
        vy: velocityy   
    }; 

    var shape2 = {
        type: settings.thisShape,
        size: settings.shapeSize,
        color: settings.shapeColor,
        x: (canvas_width - startx),
        y: (canvas_height - starty),
        vx: (-1 * velocityx),
        vy: (-1 * velocityy) 
    }

    /* Drawing Shape */

    function drawCircle(shape) {
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, (shape.size/2), 0, (2*Math.PI));
        ctx.fillStyle = shape.color;
        ctx.fill();
    };// end drawCircle

    function drawSquare(shape) {
        ctx.beginPath();
        ctx.rect(shape.x, shape.y, shape.size, shape.size*2);
        ctx.shadowBlur = 50;
        ctx.shadowOffsetY = 20;
        ctx.shadowColor = "black";
        ctx.fillStyle = shape.color;
        ctx.fill();
    };//end drawSquare

    var imgPath = "C:/Users/mcpro/OneDrive/Documents/WAVE LAB/Code/canvas-animation/src/assets/stimuli/The Sun Face Emoji.png"
    var imgPath2 = "C:/Users/mcpro/OneDrive/Documents/WAVE LAB/Code/canvas-animation/src/assets/stimuli/Dark Blue Moon Emoji.png"

    function drawPNG(shape, imgPathway) {
        base_img = new Image();
        base_img.src = imgPathway;
        ctx.beginPath();
        ctx.shadowBlur = 50;
        ctx.shadowOffsetY = 20;
        ctx.shadowColor = "yellow";
        ctx.drawImage(base_img, shape.x, shape.y, shape.size, shape.size);
    };

    /* fxn drawsomthing(shape, ..)
        ctx begin path
        ctx move to 
        ctx line to 
    

    */ 



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
        elevateCanvas();
        updatePosition(shape);
        updatePosition(shape2);
        bounceOffWalls(shape);
        bounceOffWalls(shape2);
        if(shape.type == "circle") {
            drawCircle(shape);
        } else if(shape.type == "square") {
            drawSquare(shape);
        } else {
            drawPNG(shape, imgPath);
            drawPNG(shape2, imgPath2);
        }
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

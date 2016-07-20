//** A simple game engine **
function TimerClass( targetFPS, updateFunction) {
    /**
     * Private
     */
    // Pausing
    var paused = false;
    var tPause = undefined;
    // Animationrequests
    var requestId;
    // Timing
    var tFrame = 1000 / targetFPS;
    var tLeftover = 0;
    var tLast = performance.now();
    /**
      * Public
      */
    this.logicFrames = 0;
    /**
     * Methods
     */
    function requestHandler() {
        requestAnimationFrame( requestHandler);
        updateFunction.call();
    }
    this.update = function() {
        var tNow = performance.now();
        var tSinceUpdate = tNow - tLast + tLeftover;
        // Amount of frames to calculate this pass
        this.logicFrames = Math.floor( tSinceUpdate / tFrame);
        // Leftover due to fractional amount of frames
        tLeftover = tSinceUpdate - this.logicFrames * tFrame;
        tLast = performance.now();
    }
    this.start = function() {
        tLast = performance.now();
        requestId = requestAnimationFrame( requestHandler);
    }
}

function VisualClass(canvasId, width, height) {
    /**
     * Private
     */
    var display = { canvas: undefined,
                    ctx: undefined};
    /**
     * Methods
     */
    this.init = function() {
        display.canvas = document.getElementById(canvasId);
        display.ctx = display.canvas.getContext('2d');
        display.canvas.width = width; // this sets pixel amount to correct
        display.canvas.height = height; // no blurring
        //display.width = display.canvas.width;
        //display.height = display.canvas.height;
    }
    this.clear = function() {
        display.ctx.clearRect( 0, 0, display.width, display.height);
    }
    this.color = function( fillstyle){
        display.ctx.fillStyle = fillstyle;
    };
    this.rectangle = function( x, y, w, h) {
        var vertexArray = [[x,y],[x+w,y],[x+w,y+h],[x, y+h]];
        display.ctx.beginPath();
        display.ctx.moveTo(vertexArray[0][0], vertexArray[0][1]);
        for (var i=1; i<vertexArray.length; i++){
            display.ctx.lineTo(vertexArray[i][0], vertexArray[i][1]);
        }
        display.ctx.closePath();
        display.ctx.fill();
    };
    this.text = function( text, x, y) {
        display.ctx.fillText( text, x, y);
    };
    this.setFont = function( fontString) {
        display.ctx.font = fontString;
    };
    this.setColor = function( color){
        display.ctx.fillStyle = color;
    };
    this.drawImage = function( key, x, y) {
        display.ctx.drawImage(ImageClass.images[key], x, y);
    }
    this.setAlpha = function( a) {
        display.ctx.save();
        display.ctx.globalAlpha = a;
        //display.ctx.drawImage(ImageClass.images[key], x, y);
    };
    this.setRotation = function( x, y, angle) {
        display.ctx.save();
        display.ctx.translate( x, y);
        display.ctx.rotate( angle * Math.PI / 180);
        //display.ctx.translate( x, y);
    }
    this.restore = function() {
        display.ctx.restore();
    };
    this.drawImageStretch = function ( key, x, y, w, h) {
        display.ctx.drawImage(ImageClass.images[key], 0, 0, ImageClass.images[key].width, ImageClass.images[key].height, x,y, w, h);
    };
    this.drawImageStretchDelta = function ( key, x, y, w, h) {
        display.ctx.drawImage(ImageClass.images[key], 0, 0, ImageClass.images[key].width, ImageClass.images[key].height, x,y, ImageClass.images[key].width + w, ImageClass.images[key].height + h);
    };

    /**
     * Constructor
     */
    //this.init();
}


function ImageClass( canvasId) {
    ImageClass.images = [];
    //Stores images but dows not draw
    /**
     * Private
     */
    var images = ImageClass.images;
    var unloaded = 0;
    var loaded = 0;
    /**
     * Public
     */
    this.loaded = true;
    /**
     * Methods
     */
    this.imageWidth = function( key) {
        if (key in images)
            return images[key].width;
        else
            console.log("Unknown image key "+key);
    }
    this.imageHeight = function( key) {
        if (key in images)
            return images[key].height;
        else
            console.log("Unknown image key "+key);
    }
    this.getImage = function( key) {
        if (key in images)
            return images[key];
        else
            console.log("Unknown image key "+key);
    }
    this.loadImage = function( key, source) {
        images[key] = new Image();
        unloaded++;
        images[key].onload = function(){ loaded++;unloaded--;this.loaded = true;}.bind(this); //NB loaded refers to image specific
        images[key].onerror = function(){ console.log("Unable to load "+source);};
        images[key].src = source;
        this.loaded = false;
    }.bind(this);

    this.preLoad = function( callBack) {
        var loadStart = new Date().getTime();
        var imageHandle = this;
        var loadInterval = setInterval( function() {
            timeNow = new Date().getTime();
            if (imageHandle.loaded == true){
                clearInterval( loadInterval);
                callBack();
            }else if (timeNow - loadStart > 4000){
                clearInterval( loadInterval);
                console.log("Unable to load images");
            }
        }, 200);
    };
}



function InputClass() {

    /**
     * Public
     */
    this.UP = 38;
    this.DOWN = 40;
    this.LEFT = 37;
    this.RIGHT = 39;
    /**
     * Private
     */
    var pressed = {};
    var released = {};
    var hit = {};
    /**
     * Methods
     */
    this.pollKeys = function() {
        // Returns currently pressed keys (i.e. keys that have not been lifted up)
        //var result = [];
        var keys = Object.keys( pressed);
        //var keysR = Object.keys( released);
        /*for (var i = pressed.length; i>0; --i) {
            if (keysR.indexOf(keysP[i]) == -1) {
                result.push( keysP[i]);
                keysP.splice( i, 1);
                keysP.splice( i, 1);
            }
        }*/
        //pressed = {};
        return keys;
    }
    this.pollHits = function(){
        // Returns key hit once. Then waits until key is lifted
        var keys = Object.keys( hit);
        return keys;
    }

    function onKeyDown( event) {
        if (pressed[ event.keyCode] == undefined && released[ event.keyCode] != false){
            pressed[ event.keyCode] = true;
            if (released[ event.keyCode] == undefined || released[ event.keyCode] == true) {
                hit[ event.keyCode] = true;
            }
            released[ event.keyCode] = false;
        }
    }
    function onKeyUp( event) {
        delete pressed[ event.keyCode];
        pressed[ -event.keyCode] = true; //Key "ups" denoted with negative code
        released[ event.keyCode] = true; //By keeping track of this, a long press will not result in an autofeed of characters
    }
    /**
     * Constructor
     */
    window.addEventListener('keyup', function(event) { onKeyUp(event); }, false);
    window.addEventListener('keydown', function(event) { onKeyDown(event); }, false);
};

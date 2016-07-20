"use strict";
var GAME = new (function() {
    /**
     * Private
     */
    var WIDTH = 800;
    var HEIGHT = 600;
    var stopped = true;
    var timer = new TimerClass( 40, run);
    var visual = new VisualClass('screen', WIDTH, HEIGHT);
    var images = new ImageClass();
    var input = new InputClass();
    var pong = new PongGame();
    var stateFlags = { 'countDown': false};
    // Sprite Sticker handler
    var hSpriteSticker = new (function() {
        var stickers = [];
        this.add = function( key, x, y, tLive, tFade) {
            var tNow = Date.now();
            var newSticker = {'key':key, 'x':x, 'y':y, 'tStart':tNow, 'tLive':tNow+tLive, 'tFade':tNow+tLive+tFade, 'alpha': 1};
            stickers.push( newSticker);
        }
        this.update = function() {
            var tNow = Date.now();
            var amount = stickers.length;
            for (var i = 0; i < amount; i++) {
                var o = stickers[ i];
            //stickers.forEach( function( o) {
                if (tNow > o.tFade) {
                    //kill sticker
                    //delete o;
                    delete stickers[i];
                    stickers.splice( i, 1);
                    amount--;
                    i--;
                }else if ( tNow > o.tLive) {
                    o.alpha = 1 - (tNow - o.tLive) / (o.tFade - o.tLive);
                }
            }
            
        };
        // Draw stickers with alpha and size stretch
        this.render = function() {
            stickers.forEach( function( o) {
                visual.setAlpha( o.alpha);
                var add = (1-o.alpha)*60;
                //visual.setRotation( o.x, o.y, 20-o.alpha*20);
                visual.drawImageStretchDelta(o.key, o.x-add/2-images.imageWidth( o.key)/2, o.y-add/2-images.imageHeight( o.key)/2, add, add);
                //visual.drawImageStretchDelta(o.key, -images.imageWidth( o.key)/2-add/2, -images.imageHeight( o.key)/2-add/2, add, add);
            });
            visual.restore();
        };
    })();
    // Coutndown handler
    var hCountDown = new (function() {
        var number = 3;
        var running = false;
        var tNextTick = undefined;
        var callback = undefined;
        this.start = function( cal) {
            callback = cal;
            number = 3;
            running = true;
            tNextTick = Date.now() + 900;
        }
        this.update = function() {
            if (running) {
                var tNow = Date.now();
                if (tNow > tNextTick) {
                    tNextTick = tNow + 900;
                    hSpriteSticker.add('t'+number, 400, 300, 400, 200);
                    number --;
                    if (number < 0) {
                        // End timer, run callback
                        running = false;
                        callback(); 
                    }
                }
            }
        }
    })();
    function startCountDown( callBack) {
        stateFlags[ countDown] = true;
        
    }
    function PongGame() {
        /**
         * Private
         */
        function Player( id, name, x, keyUp, keyDown, keySpecial) {
            //PRIVATE
            var width = 30;
            var height = 150;
            var y = 300-height/2;
            //PUBLIC
            this.handleInput = function( key) {
                if (key == keyUp){
                    y -= 5;
                }else if (key == keyDown) {
                    y += 5;
                }
                // Clamp paddle inside screen
                if ( y < 0) y = 0;
                if ( y > HEIGHT-height) y = HEIGHT-height;
            }
            this.update = function() {
            }
            this.render = function() {
                //visual.rectangle(x - width / 2, y - height / 2, width, height);
                visual.drawImageStretch('pad', x-width/2, y, width, height);
            };
        };
        function Ball() {
            var x = WIDTH / 2;
            var y = HEIGHT / 2;
            var width = 50;
            var height = 50;
            var velocity = [3.1,3.9];
            var angularVelocity = 0;
            var angle = 0;
            this.update = function() {
                // Velocity and bounds
                // NB. because the ball iss drawn with rotation, it's origin is at center
                x += velocity[0];
                if (x<=width/2) {
                    x = width/2;
                    velocity[0] = - velocity[0];
                    angularVelocity = velocity[1];
                }
                if (x>=WIDTH-width/2) {
                    x = WIDTH-width/2;
                    velocity[0] = - velocity[0];
                    angularVelocity = -velocity[1];
                }
                y += velocity[1];
                if (y<=height/2) {
                    y = height/2;
                    velocity[1] = - velocity[1];
                    angularVelocity = -velocity[0];
                }
                if (y>=HEIGHT-height/2) {
                    y = HEIGHT-height/2;
                    velocity[1] = - velocity[1];
                    angularVelocity = velocity[0];
                }
                // Angular velocity
                angle += angularVelocity;
            }
            this.render = function() {
                visual.setRotation( x, y, angle);
                visual.drawImageStretch('ball', -width/2, -height/2, width, height);
                visual.restore();
            };
        }
        var players = [];
        players.push( new Player( 0, "P1", 0, input.UP, input.DOWN, input.SPACE));
        players.push( new Player( 1, "P2", 800, input.UP, input.DOWN, input.SPACE));
        var balls = [];
        balls.push( new Ball());
        /**
         * Public
         */
        /**
         * Methods
         */
        this.render = function() {
            //Background
            visual.drawImage('bg',0,0);
            //visual.color('black');
            //visual.rectangle( 0, 0, WIDTH, HEIGHT);
            //HUD
            visual.color('white');
            visual.text( 'SCORE: ', 180,30);
            //Players
            visual.color('white');
            players.forEach( function( o) {o.render()});
            //Ball
            balls.forEach( function( o) {o.render()});
            // Stickers
            hSpriteSticker.render();


        };
        this.update = function() {
            // Coundown
            hCountDown.update();
            if (stopped == false) {
                // Input
                var inputs = input.pollKeys();
                inputs.forEach( function( key) {
                    players.forEach( function( o) { o.handleInput( key)});
                });
                    //var key = inputs.pop(); // NB actualyl deletes key from input's array
                    /*if ( key == 38){ // Up key (rotation)
                        players[0].input( key);
                    }else if( key == -40) { // Release Down key (move normal speed)
                    }*/
                // Ball
                balls.forEach( function( o) {o.update()});
            }
            // Stickers
            hSpriteSticker.update();
        };
        /**
         * Constructor
         */
        this.init = function() {
            //hSpriteSticker.add('t0', 50, 50, 1000, 1000, 1);
        }
    }
    /**
     * Public
     */
    this.init = function() {
        visual.init();
        visual.setFont("14px Impact");
        pong.init();
        //visual.rectangle(0, 0, 90, 90);
        console.log('Game Initialized');
        // Load images
        images.loadImage('bg', './img/bg.jpg');
        images.loadImage('pad', './img/maila.png');
        images.loadImage('ball', './img/ball.png');
        images.loadImage('t3', './img/t_3.png');
        images.loadImage('t2', './img/t_2.png');
        images.loadImage('t1', './img/t_1.png');
        images.loadImage('t0', './img/t_start.png');

        images.preLoad( function(){
            //bumpH.init();
            timer.start();
            hCountDown.start( function(){ stopped = false;});
        });
    };
    /**
     * Methods
     */
    // MAIN LOOP
    function run() {
        timer.update();
		for (var f = 0; f < timer.logicFrames; ++f){
            pong.update();
        }
        pong.render();
    };
    /**
     * Constructor & wrapped return object
     */
    return {
        init: this.init
    };
});

window.onload = GAME.init();

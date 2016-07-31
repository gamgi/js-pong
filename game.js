"use strict";
var GAME = new (function() {
    /**
     * Private
     */
    var WIDTH = 800;
    var HEIGHT = 600;
    var stopped = true;
    var timer = new TimerClass( 50, run);
    var visual = new VisualClass('screen', WIDTH, HEIGHT);
    var images = new ImageClass();
    var input = new InputClass();
    var pong = new PongGame();
    var stateFlags = { 'countDown': false};
    // Sprite Sticker handler
    var hSpriteSticker = new (function() {
        var stickers = [];
        this.add = function( key, x, y, tLive, tFade, scale) {
            if (scale === undefined) {
                scale = 60;
            }
            var tNow = Date.now();
            var newSticker = {'key':key, 'x':x, 'y':y, 'tStart':tNow, 'tLive':tNow+tLive, 'tFade':tNow+tLive+tFade, 'alpha': 1, 'scale':scale};
            stickers.push( newSticker);
        }

        this.addAnim = function( key, x, y, tLive, tFade, tFrame, frame, angle) {
                    //hSpriteSticker.addAnim('explosion1', x, y, 400, 200, 4, 100);
            if (angle == undefined){
                angle = 0;
            }
            var tNow = Date.now();
            var newSticker = {'key':key, 'x':x, 'y':y, 'tStart':tNow, 'tLive':tNow+tLive, 'tFade':tNow+tLive+tFade, 'alpha': 1, 'scale':1, 'anim':true, 'tFrame':tFrame, 'frame':frame, 'angle':angle};
            stickers.push( newSticker);
        }
        this.update = function() {
            var tNow = Date.now();
            var amount = stickers.length;
            for (var i = 0; i < amount; i++) {
                var o = stickers[ i];
                // Fading
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
                // Animation
                if (o.anim) {
                    if (tNow > o.tStart) {
                        o.frame = Math.floor((tNow-o.tStart)/o.tFrame);
                        o.frame = Math.min( images.imageFrames( o.key), o.frame);
                        // TODO clamp
                    }
                }

            }
            
        };
        // Draw stickers with alpha and size stretch
        this.render = function() {
            stickers.forEach( function( o) {
                visual.setAlpha( o.alpha);
                var add = (1-o.alpha)*o.scale;
                //visual.setRotation( o.x, o.y, 20-o.alpha*20);
                if (o.anim) {
                    // TODO get roation working with these anims
                    //visual.setRotation( o.x, o.y, o.angle);
                    visual.drawImageFrame(o.key, o.x, o.y,  o.frame);
                    //visual.restore();
                } else{
                    visual.drawImageStretchDelta(o.key, o.x-add/2-images.imageWidth( o.key)/2, o.y-add/2-images.imageHeight( o.key)/2, add, add);
                }
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
            this.getCollisionBox = function() {
                return {'x':x, 'y':y, 'x2':x+width, 'y2':y+height};
            }
            this.update = function() {
            }
            this.render = function() {
                //visual.rectangle(x - width / 2, y - height / 2, width, height);
                visual.drawImageStretch('pad', x, y, width, height);
            };
        };
        function Ball() {
            var x = WIDTH / 2;
            var y = HEIGHT / 2;
            var width = 50;
            var height = 50;
            var velocity = [-6.1,2.9];
            var angularVelocity = 0;
            var angle = 0; 
            /**
             * Methods
             */
            function checkCollision( box) {
                if (( x >= box.x-width/2 && x <= box.x2+width/2) && ( y >= box.y-height/2 && y <= box.y2+height/2)){
                    if (velocity[0] < 0) { //Approeaching from right
                        x = box.x2+width/2+1;
                        velocity[0] = - velocity[0];
                        angularVelocity = velocity[1];
                    }else if(velocity[0] > 0) {
                        x = box.x-width/2-1;
                        velocity[0] = - velocity[0];
                        angularVelocity = -velocity[1];
                    }
                    //stopped = true;
                    return true;
                }
                return false;
            }
            /**
             * Public
             */
            this.update = function() {
                // NB. because the ball iss drawn with rotation, it's origin is at center
                // Velocity and bounds
                x += velocity[0];
                // Out of bounds
                if (x<=-width/2) {
                    stopped = true;
                    hSpriteSticker.add('t_player_scores', 400, 300, 10, 800, 60);
                    hSpriteSticker.add('t_b', 400, 300, 10, 1000, 90);
                    hCountDown.start( function(){ x = 400; y = 300; stopped = false;});
                }
                if (x>=WIDTH+width/2) {
                    stopped = true;
                    hSpriteSticker.add('t_player_scores', 400, 300, 10, 800, 60);
                    hSpriteSticker.add('t_a', 400, 300, 10, 1000, 90);
                    hCountDown.start( function(){ x = 400; y = 300; stopped = false;});
                }
                y += velocity[1];
                if (y<=height/2) {
                    y = height/2;
                    velocity[1] = - velocity[1];
                    angularVelocity = -velocity[0];
                    hSpriteSticker.addAnim('explosion1', x-75, y+5, 50, 250, 50, 0,180);
                }
                if (y>=HEIGHT-height/2) {
                    y = HEIGHT-height/2;
                    velocity[1] = - velocity[1];
                    angularVelocity = velocity[0];
                    // Wall hit explosion
                    //hSpriteSticker.addAnim('explosion1', x, y-100, 600, 200, 1, 4, 200);
                    hSpriteSticker.addAnim('explosion1', x, y-100, 50, 250, 50, 0);
                }
                // Angular velocity
                angle += angularVelocity;


                // Collision with players
                players.forEach( function( p) {
                    checkCollision( p.getCollisionBox());
                });
            }
            this.render = function() {
                visual.setRotation( x, y, angle);
                visual.drawImageStretch('ball', -width/2, -height/2, width, height);
                visual.restore();
            };
        }
        var players = [];
        players.push( new Player( 0, "P1", -15, input.UP, input.DOWN, input.SPACE));
        players.push( new Player( 1, "P2", 800-15, input.UP, input.DOWN, input.SPACE));
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
        images.loadImage('t_player_scores', './img/t_player_scores.png');
        images.loadImage('t_a', './img/t_a.png');
        images.loadImage('t_b', './img/t_b.png');
        images.loadAnimImage('explosion1', './img/explosion2.png', 200, 4);

        images.preLoad( function(){
            //bumpH.init();
            timer.start();
            hCountDown.start( function(){ 
                // Match starts
        //this.addAnim = function( key, x, y, tLive, tFade, scale, tFrame, speed) {
                //hSpriteSticker.addAnim('explosion1', 100, 100, 1000,1800, 1, 4, 20);
        //this.addAnim = function( key, x, y, tLive, tFade, tFrame, speed) {
                //hSpriteSticker.addAnim('explosion1', 100, 100, 1800,100, 500,  500);
                //hSpriteSticker.addAnim('explosion1', 50, 50, 1000, 0, 500, 0);
        //this.addAnim = function( key, x, y, tLive, tFade, tFrame, frame) {
                stopped = false;
            });
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

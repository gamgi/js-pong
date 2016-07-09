GAME = (function() {
    /**
     * Private
     */
    var WIDTH = 800;
    var HEIGHT = 600;
    var timer = new TimerClass( 40, run);
    var visual = new VisualClass('screen', WIDTH, HEIGHT);
    var images = new ImageClass();
    var input = new InputClass();
    var pong = new PongGame();
    var stateFlags = { 'countDown': false};
    // Sprite Sticker handler
    var hSpriteSticker = new (function() {
        var stickers = [];
        this.sticker = function( key, tLive, tFade) {
            var tNow = Date.now();
            var newSticker = {'key':key, 'tStart':tNow, 'tLive':tNow+tLive, 'tFade':tNow+tFade, 'alpha': 1};
            stickers.push( newSticker);
        }
        this.update = function() {
            var tNow = Date.now();
            var amount = stickers.length;
            for (var i = 0; i < amount; i++) {
                var o = stickers[ amount];
            //stickers.forEach( function( o) {
                if (tNow > o.tFade) {
                    //kill sticker
                    o.delete();
                    stickers.splice( i, 1);
                    amount--;
                    i--;
                }else if ( tNow > tLive) {
                    o['alpha'] = (tNow - tFade) / (tFade - tLive);
                }
            }
            
        };
    })();
    // Coutndown handler
    var hCountDown = (function() {
        var numer = 3;
        var running = false;
        var tNextTick = undefined;
        var callback = undefined;
        this.start = function( n, cal) {
            callback = cal;
            number = n;
            running = true;
            tNextTick = new Date.now() + 900;
        }
        this.update = function() {
            if (running) {
                if (Date.now() > tNextTick) {
                    tNextTick = new Date.now() + 900;
                    number --;
                    if (number == 0) {
                        cal(); 
                    }else if (number < 0) {
                        // End timer, run callback
                        running = false;
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
            var y = 300;
            //PUBLIC
            this.render = function() {
                //visual.rectangle(x - width / 2, y - height / 2, width, height);
                visual.drawImage('pad',x-width/2,y-height/2);
            };
        };
        function Ball() {
            var x = WIDTH / 2;
            var y = HEIGHT / 2;
            var width = 50;
            var height = 50;
            var velocity = [3.1,3.9];
            this.update = function() {
                x += velocity[0];
                if (x<=0) {
                    x = 0;
                    velocity[0] = - velocity[0];
                }
                if (x>=WIDTH-width) {
                    x = WIDTH-width;
                    velocity[0] = - velocity[0];
                }
                y += velocity[1];
                if (y<=0) {
                    y = 0;
                    velocity[1] = - velocity[1];
                }
                if (y>=HEIGHT-height) {
                    y = HEIGHT-height;
                    velocity[1] = - velocity[1];
                }
            }
            this.render = function() {
                visual.drawImage('ball',x,y);
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


        };
        this.update = function() {
            // Input
            var inputs = input.pollKeys();
            while ( inputs.length != 0) {
                var key = inputs.pop();
                if ( key == 38){ // Up key (rotation)
                }else if( key == -40) { // Release Down key (move normal speed)
                }
            }
            // Ball
            balls.forEach( function( o) {o.update()});
            // Stickers
            hSpriteSticker.update();
        };
        /**
         * Constructor
         */
        this.init = function() {
            visual.setFont("14px Impact");
        }
    }
    /**
     * Public
     */
    this.init = function() {
        visual.init();
        pong.init();
        //visual.rectangle(0, 0, 90, 90);
        console.log('Game Initialized');
        // Load images
        images.loadImage('bg', './img/bg.jpg');
        images.loadImage('pad', './img/maila.png');
        images.loadImage('ball', './img/ball_small.png');
        images.loadImage('t3', './img/t_3.png');
        images.loadImage('t2', './img/t_2.png');
        images.loadImage('t1', './img/t_1.png');
        images.loadImage('t0', './img/t_start.png');

        images.preLoad( function(){
            //bumpH.init();
            timer.start();
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
}());

window.onload = GAME.init();

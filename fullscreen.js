// FETCH CANVAS


// WINDOW WATCH
/*var fullScreenEnabled = false;
function fullscreenCheck( event ) {
    fullScreenEnabled = (fullScreenEnabled?false:true);
    console.log(fullScreenEnabled);
    //if ( document.fullscreenEnabled || document.mozFullScreenEnabled) {
    //until mozilla bug has been fixed
    if (fullScreenEnabled == true){
        GAME.screenExpand();
    }else{
        GAME.screenContract();
    }
};

document.addEventListener("fullscreenchange", fullscreenCheck, false);
document.addEventListener("mozfullscreenchange", fullscreenCheck, false);*/

function toggleFullScreen() {
    var canvas = document.getElementById("screen");
    if (!document.mozFullScreen && !document.webkitFullScreen) {
        if (canvas.mozRequestFullScreen) {
            canvas.mozRequestFullScreen();
        } else {
            canvas.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    }
}

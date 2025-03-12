import Game from '/src/game.js';
import Course from '/src/course.js';
var golf = new Game();
var course = new Course();

window.addEventListener('load', function() {

var UI = {};
UI.shotButton = document.getElementById('shotButton');
UI.scoreCard = document.getElementById('scoreCard');
UI.scoreDisplay = document.getElementById('scoreDisplay');

var rect = UI.shotButton.getBoundingClientRect();
UI.shotButtonRadius = (rect.right - rect.left) / 2;
UI.shotButtonX = rect.left + UI.shotButtonRadius;
UI.shotButtonY = rect.top + UI.shotButtonRadius;
UI.shotButtonTouch = false;
UI.useTouchEvents = false;

UI.updateScoreCard = function(course) {
    var rows = '<tr><th>Hole</th><th style="width:60px;">Par</th><th style="width:60px;">Player</th></tr>';
    var totals = {par:0, strokes:0};
    for(var i=0; i<course.holes.length; i++) {
        var h = course.holes[i];
        totals.par += h.par;
        totals.strokes += h.strokes;
        rows +='<tr><td>'+ (i+1) + ' ' + h.name+ '</td><td>'+h.par+
        '</td><td>'+(h.strokes == 0 ? '': h.strokes)+'</td></tr>';
    }
    rows +='<tr><th>Total</th><th>'+totals.par+'</th><th>'+totals.strokes+'</th></th>'
    document.getElementById('scoreTable').innerHTML = rows;
}

UI.loadNext = function() {
    golf.clear();
    UI.shotButton.innerHTML = '';
    course.current++;
    UI.scoreDisplay.firstChild.innerHTML = 'Stroke 0';
    UI.scoreCard.style.display = 'none';
    course.currentHole.build(golf);
    
    golf.paused = false;
}

golf.init().then(() => {
    golf.run();
    UI.scoreCard.style.display = 'none';
    UI.loadNext();
    UI.updateScoreCard(course);
});

golf.addEventListener("hole", function() {
    golf.paused = true;
    course.currentHole.complete = true;
    UI.scoreCard.style.display = 'block'
    UI.shotButton.innerHTML = '<br />Next';
});

golf.addEventListener("stop", function() {
    UI.shotButton.style.borderStyle = 'solid'
});

golf.addEventListener("move", function() {
    UI.shotButton.style.borderStyle = 'dashed'
});

window.addEventListener("resize", function () {
    golf.engine.resize();
});


UI.shotButton.addEventListener("touchstart", function() {
    UI.useTouchEvents = true;
    UI.shotButtonTouch = true;
    if (course.currentHole.complete) {
        UI.shotButtonTouch = false;
        UI.loadNext();
    }
    else if (golf.ball.stopped) {
        golf.swing();
    }
});

UI.shotButton.addEventListener("touchmove", function(e) {
	var t = e.touches[0]; 
	var dist = Math.sqrt( Math.pow((t.clientX-UI.shotButtonX), 2) + Math.pow((t.clientY-UI.shotButtonY), 2) );

	if (dist > UI.shotButtonRadius) {
		UI.shotButtonTouch = false;
		//console.log('touch exited button');
        golf.disposeAimLine();
        golf.renderAimLine = false;
	}
});

UI.shotButton.addEventListener("touchend", function() {
	if (UI.shotButtonTouch) {
        if (golf.ball.stopped && !course.currentHole.complete && !golf.paused && golf.impulseTime != 0 ) {
            //console.log("touchend")
            golf.strike();
            UI.shotButton.style.borderStyle = 'dashed'
            course.currentHole.strokes++;
            UI.scoreDisplay.firstChild.innerHTML = 'Stroke ' + course.currentHole.strokes;
            UI.updateScoreCard(course);
        }      
    }
});

UI.shotButton.addEventListener("mousedown", function() {
    if (UI.useTouchEvents) {
        return;
    }
    if (course.currentHole.complete) {
        UI.loadNext();
    }
    else if (golf.ball.stopped) {
        golf.swing();
    }
});



UI.shotButton.addEventListener("mouseup", function() {
    if (UI.useTouchEvents) {
        return;
    }
    if (golf.ball.stopped && !course.currentHole.complete && !golf.paused && golf.impulseTime != 0 ) {
        golf.strike();
        UI.shotButton.style.borderStyle = 'dashed'
        course.currentHole.strokes++;
        UI.scoreDisplay.firstChild.innerHTML = 'Stroke ' + course.currentHole.strokes;
        UI.updateScoreCard(course);
    }     
});

UI.shotButton.addEventListener("mouseout", function() {
    golf.disposeAimLine();
    golf.renderAimLine = false;
});

UI.shotButton.addEventListener("dragstart", function(e) {
    e.preventDefault();
    return false;
});

// click seems to respond to touch or mouse
document.getElementById('reset').addEventListener("click", function() {
    golf.ball.mesh.setAbsolutePosition(golf.strikePosition);
    golf.ball.stop();
    golf.paused = false;
    course.currentHole.strokes--;
    UI.scoreCard.style.display = 'none';
});

document.getElementById('x').addEventListener("click", function() {
    golf.paused = false;
    UI.scoreCard.style.display = 'none';
});

document.getElementById('scoreDisplay').addEventListener("click", function() {
    UI.scoreCard.style.display =  scoreCard.style.display == 'block' ? 'none':'block';
    golf.paused = scoreCard.style.display == 'block';
});
})

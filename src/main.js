import Game from '/src/game.js';
import Course from '/src/course.js';
var golf = new Game();
var course = new Course();

window.addEventListener('load', function() {


var shotButton = document.getElementById('shotButton');
var scoreCard = document.getElementById('scoreCard');
var scoreDisplay = document.getElementById('scoreDisplay');


function updateScoreCard(course) {
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

function loadNext() {
    golf.clear();
    shotButton.innerHTML = '';
    course.current++;
    scoreDisplay.firstChild.innerHTML = 'Stroke 0';
    scoreCard.style.display = 'none';
    course.currentHole.build(golf);
    
    golf.paused = false;
}

golf.init().then(() => {
    golf.run();
    scoreCard.style.display = 'none';
    loadNext();
    updateScoreCard(course);
});




golf.addEventListener("hole", function() {
    golf.paused = true;
    course.currentHole.complete = true;
    scoreCard.style.display = 'block'
    shotButton.innerHTML = '<br />Next';
});
golf.addEventListener("stop", function() {
    shotButton.style.borderStyle = 'solid'
});

golf.addEventListener("move", function() {
    shotButton.style.borderStyle = 'dashed'
});

window.addEventListener("resize", function () {
    golf.engine.resize();
});

shotButton.addEventListener("dragstart", function(e) {
    e.preventDefault();
    return false;
});

shotButton.addEventListener("mousedown", function() {
if (course.currentHole.complete) {
    loadNext();
}
else if (golf.ball.stopped) {
    golf.swing();
}
});

shotButton.addEventListener("mouseout", function() {
    golf.disposeAimLine();
    golf.renderAimLine = false;
});

shotButton.addEventListener("mouseup", function() {
    if (golf.ball.stopped && !course.currentHole.complete && !golf.paused && golf.impulseTime != 0 ) {
        golf.strike();
        shotButton.style.borderStyle = 'dashed'
        course.currentHole.strokes++;
        scoreDisplay.firstChild.innerHTML = 'Stroke ' + course.currentHole.strokes;
        updateScoreCard(course);
    }
});

document.getElementById('x').addEventListener("click", function() {
    golf.paused = false;
    scoreCard.style.display = 'none';
});

document.getElementById('scoreDisplay').addEventListener("click", function() {
    scoreCard.style.display =  scoreCard.style.display == 'block' ? 'none':'block';
    golf.paused = scoreCard.style.display == 'block';
});
})

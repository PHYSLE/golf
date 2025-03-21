import Game from '/src/game.js';
import Course from '/src/course.js';
var golf = new Game();
var course = new Course();

window.addEventListener('load', function() {

var UI = {};
UI.shotButton = document.getElementById('shotButton');
UI.scoreCard = document.getElementById('scoreCard');
UI.scoreDisplay = document.getElementById('scoreDisplay');
UI.parDisplay = document.getElementById('parDisplay');

var rect = UI.shotButton.getBoundingClientRect();
UI.shotButtonRadius = (rect.right - rect.left) / 2;
UI.shotButtonX = rect.left + UI.shotButtonRadius;
UI.shotButtonY = rect.top + UI.shotButtonRadius;
UI.shotButtonTouch = false;
UI.useTouchEvents = false;
UI.persistence = {current:[],best:[]}

UI.getCookie = function(name) {
    var nameEQ = "_phy_mp=";
    var cookies = document.cookie.split(';');
	var val = null;
    for(var i=0; i < cookies.length;i++) {
        var c = cookies[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) {
			val = c.substring(nameEQ.length,c.length);
			break;
		}
    }

    return val ? atob(val) : null;
}

UI.setCookie = function (reset=false,hard=false) {
    var days=365;
	var d = new Date();
    var data = hard ? {current:[],best:[]} : {current:[],best:UI.persistence.best};
    if (!reset) {
        for(var i=0; i<course.holes.length; i++) {
            if (course.holes[i].complete) {
                data.current.push(course.holes[i].strokes)
            }
        }
    }
    var value = JSON.stringify(data);
	d.setTime(d.getTime() + (days*24*60*60*1000));
	document.cookie = ("_phy_mp=" + btoa(value) + '; expires=' + d.toUTCString() + "; path=/");
};


UI.updateScoreCard = function(course) {
    var rows = '<tr><th>Hole</th><th style="width:50px;">Par</th>'
    if (UI.persistence.best && UI.persistence.best.length>0) {
        rows += '<th style="width:50px;">Best</th>'
    }
    rows += '<th style="width:50px;">Player</th></tr>';
    var totals = {par:0, strokes:0, best:0};
    for(var i=0; i<course.holes.length; i++) {
        var h = course.holes[i];
        totals.par += h.par;
        totals.strokes += h.strokes;
        rows +='<tr><td>'+ (i+1) + ' ' + h.name+ '</td><td>'+h.par+'</td>'
        if (UI.persistence.best && UI.persistence.best.length>i) {
            rows +='<td>'+UI.persistence.best[i]+'</td>';
            totals.best += UI.persistence.best[i];
        }
        rows +='<td>'+(h.strokes == 0 ? '': h.strokes)+'</td></tr>';
    }
    rows +='<tr><th>Total</th><th>'+totals.par+'</th>';
    if (totals.best > 0) {
        rows += '<th>'+totals.best+'</th>';
    }
    rows += '<th>'+totals.strokes+'</th></th>'
    document.getElementById('scoreTable').innerHTML = rows;
}

UI.loadNext = async function() {
    golf.clear();

    UI.shotButton.innerHTML = '';
    course.current++;
    console.log('hole=' + course.current)
    UI.scoreDisplay.innerHTML = 'Stroke 0';
    UI.parDisplay.innerHTML = 'Par ' + course.currentHole.par;
    UI.scoreCard.style.display = 'none';
    try {
        course.currentHole.build(golf);
    }
    catch(error) {
        alert('Could not load hole '+ course.current + '. ' + error)
    }

    golf.paused = false;
}

golf.init().then(() => {
    golf.run();
    UI.scoreCard.style.display = 'none';
    var c = UI.getCookie();
    console.log("cookie json=" + c);
    if (c) UI.persistence = JSON.parse(c);

    if (UI.persistence && UI.persistence.current.length > 0) {
        // if the course is not already complete, load player's progress 
        if (UI.persistence.current.length < course.holes.length) { 
            for(var i=0; i<UI.persistence.current.length; i++) {
                var hole = course.holes[i];
                hole.strokes = UI.persistence.current[i];
                hole.complete = true;
            }
            course.current = UI.persistence.current.length
        }
    }
    UI.loadNext();
    UI.updateScoreCard(course);
});

golf.addEventListener("hole", function() {
    console.log("hole event")
    if (golf.paused) {
        // fix issue with multiple hole events?
        console.log("duplicate hole event")
        return;
    }

    course.currentHole.complete = true;
    golf.paused = true;
    

    if (course.holes.length == course.current) {
        var previous = UI.persistence.best.reduce((sum, a) => sum + a, 0);
        var current = course.holes.reduce((sum, h) => sum + h.strokes, 0);
        var best = (previous == 0 || current <= previous);
        //console.log(previous, current, best)
        if (best) {
            UI.persistence.best = [];
            for(var i=0; i<course.holes.length; i++) {
                UI.persistence.best.push(course.holes[i].strokes);
            }
        }

        UI.setCookie();
        UI.updateScoreCard(course);
        UI.scoreCard.style.display = 'block';
        UI.shotButton.style.display = 'none';
    }
    else { 
        UI.setCookie();
        UI.shotButton.innerHTML = '<br />Next';
    }
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

document.body.addEventListener("touchstart", function(e) {
    e.preventDefault(); // should prevent selection via long touch?
})

UI.shotButton.addEventListener("touchstart", function(e) {
    e.preventDefault();
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
            UI.scoreDisplay.innerHTML = 'Stroke ' + course.currentHole.strokes;
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

        UI.scoreDisplay.innerHTML = 'Stroke ' + course.currentHole.strokes;
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
document.getElementById('scoreWrapper').addEventListener("click", function() {
    UI.shotButton.style.display =  scoreCard.style.display == 'block' ? 'block':'none';
    UI.scoreCard.style.display =  scoreCard.style.display == 'block' ? 'none':'block';

    golf.paused = scoreCard.style.display == 'block';
});

document.getElementById('reset').addEventListener("click", function() {
   UI.setCookie(true);
   document.location='index.html';
});

document.getElementById('back').addEventListener("click", function() {
    golf.ball.mesh.setAbsolutePosition(golf.strikePosition);
    golf.ball.stop();
    golf.paused = false;
    course.currentHole.strokes--;
    UI.scoreCard.style.display = 'none';
    UI.shotButton.style.display = 'block';
});

document.getElementById('clear').addEventListener("click", function() {
    if (confirm('Clear all saved data?')) {
        UI.setCookie(true,true);
        document.location='index.html';
    }
});

document.getElementById('x').addEventListener("click", function() {
    golf.paused = false;
    UI.scoreCard.style.display = 'none';
    UI.shotButton.style.display = 'block';
});


})

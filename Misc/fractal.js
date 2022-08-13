var width = 700;
var height = 500;
var lines;
var startPoint = { x: 200, y: 530 }
var distConst = 0

window.onload = function init(){
	
	
	var canvas = document.getElementById("myCanvas");
	width = window.innerWidth - 50;
	height = window.innerHeight - 50;
	canvas.width = width;
	canvas.height = height;
	distConst = Math.sqrt(12);
	
	lines = [{ x: 800, y: 530 }, { x: 500, y: 10 }, { x: 200, y: 530 }]
	window.addEventListener("mousedown", iterate());
	render();
}

function iterate(){
	var lastPoint = startPoint;
	var newLines = [];
	
	lines.forEach(currentPoint => {
		generateLines(currentPoint, lastPoint, newLines);
		lastPoint = currentPoint;
	});
	
	lines = newLines;
	render();
}

function generateLines(currentPoint, lastPoint, newLines){
	
	var xDistance = currentPoint.x - lastPoint.x;
	var yDistance = currentPoint.y - lastPoint.y;
	
	var midpoint = {x: lastPoint.x + (xDistance / 2), y: lastPoint.y + (yDistance / 2)}
	
	var thirdpoint = {x: lastPoint.x + (xDistance / 3), y: lastPoint.y + (yDistance / 3)}
	var twothirdpoint = {x: lastPoint.x + (2 * xDistance / 3), y: lastPoint.y + (2 * yDistance / 3)}
	newLines.push(thirdpoint);
	
	var yChange = xDistance / distConst;
	var xChange = -yDistance / distConst;
	
	newLines.push({x: midpoint.x + xChange, y: midpoint.y + yChange});
	newLines.push(twothirdpoint);
	newLines.push(currentPoint);
}

function render(){
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
  
    lines.forEach(line => {
	    ctx.lineTo(line.x, line.y);
    });
	  	  
	ctx.stroke();
}
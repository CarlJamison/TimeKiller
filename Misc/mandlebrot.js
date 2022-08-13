var scale = 0.004;
var width = 700;
var height = 500;
var xCenter = 0;
var yCenter = 0;
var xCorner = 0;
var yCorner = 0;
var maxChecks = 20;

window.onload = function init(){
	window.addEventListener("mousedown", onClick);
	
	var canvas = document.getElementById("myCanvas");
	var w = window.innerWidth - 50;
	var h = window.innerHeight - 50;
	width = Math.floor(w / scale);
	height = Math.floor(h / scale);
	canvas.width = width * scale;
	canvas.height = height * scale;
	
	render();
	
	window.addEventListener("keydown" ,function(event){
        switch(event.key) {
            case "c":
                maxChecks *= 2;
				render();
                break;
            case "r":
                scale = 0.004;
				xCenter = 0;
				yCenter = 0;
				render();
                break;
        }
    });
}

function render(){
	var canvas = document.getElementById("myCanvas");
	var myCanvasContext = canvas.getContext("2d");
	
	yCorner = yCenter - (canvas.height / 2 * scale);
	xCorner = xCenter - (canvas.width / 2 * scale);
	  
	for (j = 0; j < canvas.height; j++)
	{
	  for (i = 0; i < canvas.width; i++)
	  {
		 var value = getValue(j, i);
		 
		 var color = Math.floor(255 * value / 21);
		 myCanvasContext.fillStyle = "rgb(" + color + ", " + color + ", " + color + ")";
		 myCanvasContext.fillRect(i, j, 1, 1);
	   }
	 }
}

function getValue(row, column){
	var yC = (row * scale) + yCorner;
	var xC = (column * scale) + xCorner;
	
	var x = 0;
	var y = 0;
	
	for(var i = 0; i < maxChecks; i++){
		
		let xtemp = x * x - y * y + xC;
        y = 2 * x * y + yC;
        x = xtemp;
		
		if((x * x + y * y) > 4){
			return i;
		}
	}
	
	return maxChecks;
	
}

function onClick(event){
	var canvas = document.getElementById("myCanvas");
    var rect = canvas.getBoundingClientRect();
    var y = event.clientY - rect.top;
    var x = event.clientX;
	
	yCenter = y * scale + yCorner;
	xCenter = x * scale + xCorner;
	scale /= 2
	render();
}
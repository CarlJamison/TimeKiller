var scale = 2;
var width = 700;
var height = 500;
var reached = [];
var instruction = [];
var cost = [];
var paths = [];
var max = 0.0
var imgData;
var paths = [];
var mode = "COST";
var costField;

window.onload = function init(){
	window.addEventListener("mousedown", onClick);
	window.addEventListener("mousemove", draw);
	
	window.addEventListener("keydown" ,function(event){
        switch(event.key) {
            case "a":
                //paths.push(Math.floor(Math.random() * height * width))
                break;
			case "q":
				if(mode != "COST"){
					mode = "COST";
					generateImage();
				}
                break;
			case "w":
                if(mode != "TOTAL_COST"){
					mode = "TOTAL_COST";
					generateImage();
				}
                break;
			case "e":
				if(mode != "PATHS"){
					mode = "PATHS";
					generateImage();
				}
				break;
			case "r":
				if(mode != "COMBINED"){
					mode = "COMBINED";
					generateImage();
				}
				break;
        }
    });

	width = Math.floor((window.innerWidth - 20) / scale);
	height = Math.floor((window.innerHeight - 20) / scale);

	var canvas = document.getElementById("myCanvas");
	canvas.width = width * scale;
	canvas.height = height * scale;

	costField = [];
	for (var i = 0; i < height; i++) {
		costField[i] = [];
		for (var j = 0; j < width; j++) {
			costField[i][j] = Math.random();
		}
	}
	render(Math.floor(height / 2), Math.floor(width / 2));
}

function generateImage(){
		
	var canvas = document.getElementById("myCanvas");
	var ctx = canvas.getContext("2d");

	if(mode == "COST"){
		for(var i = 0; i < width; i++){
			for(var j = 0; j < height; j++){
				
				var value = 256 * costField[j][i];
			
				ctx.fillStyle = "rgb(" + value + ", " + value + ", " + value + ")";
				ctx.fillRect(i * scale, j * scale, scale, scale);
			}
		}
	}else if(mode == "TOTAL_COST"){
		for(var i = 0; i < width; i++){
			for(var j = 0; j < height; j++){
				
				var value = 256 - (cost[i + (j * width)] / max * 256)
			
				ctx.fillStyle = "rgb(" + value + ", " + value + ", " + value + ")";
				ctx.fillRect(i * scale, j * scale, scale, scale);
			}
		}
	}else if(mode == "PATHS"){
		var hitList = [];
		for(var i = 0; i < width * height; i++){
			hitList[i] = 0
		}
		for(var i = 0; i < width * height; i++){
			var nextInstruction = instruction[i];
			while(instruction[nextInstruction]){
				hitList[nextInstruction]++;
				nextInstruction = instruction[nextInstruction];
			}
		}

		var maxInst = 0;
		hitList.forEach(h => maxInst = h > maxInst ? h : maxInst);
		for(var i = 0; i < width; i++){
			for(var j = 0; j < height; j++){
				var value = 256 * Math.pow(hitList[i + (j * width)] / maxInst, .25);
				ctx.fillStyle = "rgb(" + value + ", " + value + ", " + value + ")";
				ctx.fillRect(i * scale, j * scale, scale, scale);
			}
		}
	}else if(mode == "COMBINED"){
		var hitList = [];
		for(var i = 0; i < width * height; i++){
			hitList[i] = 0
		}
		for(var i = 0; i < width * height; i++){
			var nextInstruction = instruction[i];
			while(instruction[nextInstruction]){
				hitList[nextInstruction]++;
				nextInstruction = instruction[nextInstruction];
			}
		}

		var maxInst = 0;
		hitList.forEach(h => maxInst = h > maxInst ? h : maxInst);
		for(var i = 0; i < width; i++){
			for(var j = 0; j < height; j++){
				var value = 256 * Math.sqrt(hitList[i + (j * width)] / maxInst) + (256 - (cost[i + (j * width)] / max * 256))
				value = value > 255 ? 255 : value;
				ctx.fillStyle = "rgb(" + value + ", " + value + ", " + value + ")";
				ctx.fillRect(i * scale, j * scale, scale, scale);
			}
		}
	}
	
	imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function draw(event){
	var canvas = document.getElementById("myCanvas");
	var ctx = canvas.getContext("2d");
	ctx.putImageData(imgData, 0, 0);
    var rect = canvas.getBoundingClientRect();
	var r = Math.floor((event.clientY - rect.top) / scale);
	var c = Math.floor(event.clientX / scale);

	ctx.fillStyle = "rgb(" + 255 + ", " + 255 + ", " + 255 + ")";

	var instCoord = (r * width) + c;
	while(instruction[instCoord]){
		var col = instCoord % width;
		var row = Math.floor(instCoord / width);

		ctx.fillRect(col * scale, row * scale, scale, scale);
		instCoord = instruction[instCoord];
	}
}

//No longer used
function runFrame(){
	var canvas = document.getElementById("myCanvas");
	var ctx = canvas.getContext("2d");
	ctx.putImageData(imgData, 0, 0);
	ctx.fillStyle = "rgb(" + 255 + ", " + 255 + ", " + 255 + ")";
	if(!paths.length){
		paths = [Math.floor(Math.random() * height * width)];
	}

	paths.forEach(p => {
		var r = Math.random();
		p+= r < 0.33 ? 1 : r > 0.67 ? -1 : 0
		var c = Math.random();
		p+= c < 0.33 ? width : c > 0.67 ? -width : 0
		var instCoord = p;
		while(instruction[instCoord]){
			var col = instCoord % width;
			var row = Math.floor(instCoord / width);

			ctx.fillRect(col * scale, row * scale, scale, scale);
			instCoord = instruction[instCoord];
		}	
	});
}

function onClick(event){
	var canvas = document.getElementById("myCanvas");
    var rect = canvas.getBoundingClientRect();
    var y = event.clientY - rect.top;
    var x = event.clientX;
	
	var iStart = Math.floor(y / scale);
	var jStart = Math.floor(x / scale);
	render(iStart, jStart);
}

function render(iStart, jStart){
	var r = height;
	var c = width;
	
	max = 0.0;
	
	ready = [];
	cost = []
	instruction = [];
	done = [];
	reached = [];
	
	ready.push(iStart * c + jStart);
	cost[iStart * c + jStart] = 0;
	
	for(var i = 0; i < r; i++) {
		for(var iC = 0; iC < c; iC++) {
		
			//Get min
			var minValue = cost[ready[0]];
			var min = ready[0];
			
			ready.forEach(x => {
				if(cost[x] < minValue) {
					min = x;
					minValue = cost[x];
				}
			});
			
			var index = ready.indexOf(min);
			ready.splice(index, 1);
			done[min] = true;
			
			var cR = Math.floor(min / c);
			var cC = min % c;
			
			if(cR > 0) {
				addInstruction((cR - 1) * c + cC, minValue + costField[cR - 1][cC], min, ready, done);
			}
			
			if(cR + 1 < r) {
				addInstruction((cR + 1) * c + cC, minValue + costField[cR + 1][cC], min, ready, done);
			}
			
			if(cC > 0) {
				addInstruction(cR * c + cC - 1, minValue + costField[cR][cC - 1], min, ready, done);
			}
			
			if(cC + 1 < c) {
				addInstruction(cR * c + cC + 1, minValue + costField[cR][cC + 1], min, ready, done);
			}
			
			if(cR > 0 && cC > 0) {
				addInstruction((cR - 1) * c + cC - 1, minValue + (Math.sqrt(2) * costField[cR - 1][cC - 1]), min, ready, done);
			}
			
			if(cR + 1 < r && cC + 1 < c) {
				addInstruction((cR + 1) * c + cC + 1, minValue + (Math.sqrt(2) * costField[cR + 1][cC + 1]), min, ready, done);
			}
			
			if(cR + 1 < r && cC > 0) {
				addInstruction((cR + 1) * c + cC - 1, minValue + (Math.sqrt(2) * costField[cR + 1][cC - 1]), min, ready, done);
			}
			
			if(cR > 0 && cC + 1 < c) {
				addInstruction((cR - 1) * c + cC + 1, minValue + (Math.sqrt(2) * costField[cR - 1][cC + 1]), min, ready, done);
			}
			
			max = minValue;
		}
	}

	generateImage();
	//window.setInterval(runFrame, 100);
}
	
function addInstruction(newVal, currentCost, min, ready, done) {
	if(done[newVal]) return;
	var included = reached[newVal];
	
	if(!included){
		ready.push(newVal);
		instruction[newVal] = min;
		cost[newVal] = currentCost;
		reached[newVal] = true;
	}else{
		if(currentCost < cost[newVal]){
			instruction[newVal] = min;
			cost[newVal] = currentCost;
		}
	}
}
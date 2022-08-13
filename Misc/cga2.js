var scale = 5;
var width = 700;
var height = 500;
var reached = [];

window.onload = function init(){
	window.addEventListener("mousedown", onClick);
	
	var canvas = document.getElementById("myCanvas");
	var w = window.innerWidth;
	var h = window.innerHeight;
	width = Math.floor(w / scale);
	height = Math.floor(h / scale);
	canvas.width = width * scale;
	canvas.height = height * scale;
	
	var iStart = Math.floor(height / 2);
	var jStart = Math.floor(width / 2);
	render(iStart, jStart);
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
	
	var canvas = document.getElementById("myCanvas");
	var r = height;
	var c = width;
	
	var ctx = canvas.getContext("2d");
	
	var costField = [];
	for (var i = 0; i < height; i++) {
		costField[i] = [];
		for (var j = 0; j < width; j++) {
			costField[i][j] = Math.random();
		}
	}
	
	var max = 0.0;
	
	ready = [];
	cost = []
	instruction = [];
	done = [];
	reached = [];
	
	ready.push(iStart * c + jStart);
	cost[iStart * c + jStart] = 0;
	
	var rtc = r * c;
	
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
				addInstruction((cR - 1) * c + cC, minValue + costField[cR - 1][cC], min, ready, done, cost, instruction);
			}
			
			if(cR + 1 < r) {
				addInstruction((cR + 1) * c + cC, minValue + costField[cR + 1][cC], min, ready, done, cost, instruction);
			}
			
			if(cC > 0) {
				addInstruction(cR * c + cC - 1, minValue + costField[cR][cC - 1], min, ready, done, cost, instruction);
			}
			
			if(cC + 1 < c) {
				addInstruction(cR * c + cC + 1, minValue + costField[cR][cC + 1], min, ready, done, cost, instruction);
			}
			
			if(cR > 0 && cC > 0) {
				addInstruction((cR - 1) * c + cC - 1, minValue + (Math.sqrt(2) * costField[cR - 1][cC - 1]), min, ready, done, cost, instruction);
			}
			
			if(cR + 1 < r && cC + 1 < c) {
				addInstruction((cR + 1) * c + cC + 1, minValue + (Math.sqrt(2) * costField[cR + 1][cC + 1]), min, ready, done, cost, instruction);
			}
			
			if(cR + 1 < r && cC > 0) {
				addInstruction((cR + 1) * c + cC - 1, minValue + (Math.sqrt(2) * costField[cR + 1][cC - 1]), min, ready, done, cost, instruction);
			}
			
			if(cR > 0 && cC + 1 < c) {
				addInstruction((cR - 1) * c + cC + 1, minValue + (Math.sqrt(2) * costField[cR - 1][cC + 1]), min, ready, done, cost, instruction);
			}
			
			max = minValue;
		}
	}
	
	for(var i = 0; i < width; i++){
		for(var j = 0; j < height; j++){
			
			var value = 256 - (cost[i + (j * width)] / max * 256)
		
			ctx.fillStyle = "rgb(" + value + ", " + value + ", " + value + ")";
			ctx.fillRect(i * scale, j * scale, scale, scale);
		}
	}
}
	
function addInstruction(newVal, currentCost, min, ready, done, cost, instruction) {
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
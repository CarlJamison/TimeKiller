var scale = 2;
var width = 700;
var height = 500;
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
	
	ready.push( { id: iStart * c + jStart, cost: 0 });
	cost[iStart * c + jStart] = 0;
	
	while(ready.length){
		var minValue = Infinity;
		var index = 0;
		
		ready.forEach((x, i) => {
			if(x.cost < minValue) {
				minValue = x.cost;
				index = i;
			}
		});
		
		var min = ready[index].id;
		ready[index] = ready[ready.length - 1]
		ready.pop();
		
		var cR = Math.floor(min / c);
		var cC = min % c;

		for(var i = -1; i <= 1; i++){
			for(var j = -1; j <= 1; j++){
				var distance = Math.abs(i) + Math.abs(j)
				if(distance > 0 && cR + i > -1 && cR + i < r && cC + j > -1 && cC + j < c){
					var norm = distance == 1 ? 1 : Math.sqrt(2);
					addInstruction((cR + i) * c + cC + j, minValue + (norm * costField[cR + i][cC + j]), min);
				}
			}
		}
		
		max = minValue;
	}

	generateImage();
}
	
function addInstruction(newVal, newCost, min) {
	var existingCost = cost[newVal];
	
	if(existingCost == null){
		ready.push({ id: newVal, cost: newCost });
		instruction[newVal] = min;
		cost[newVal] = newCost;
	}else if(existingCost > newCost){
		ready.find(x => x.id == newVal).cost = newCost;
		instruction[newVal] = min;
		cost[newVal] = newCost;
	}
}
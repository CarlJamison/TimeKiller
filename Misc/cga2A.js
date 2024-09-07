const scale = 2;
var instruction = [];
var cost = [];
var paths = [];
var max = 0.0;
var paths = [];
var mode = "COST";
const DIRECTIONS = [{r: -1, c: 0}, {r: -1, c: 1}, {r: 0, c: 1}, {r: 1, c: 1}, 
	{r: 1, c: 0}, {r: 1, c: -1}, {r: 0, c: -1}, {r: -1, c: -1}];

const width = Math.floor(window.innerWidth / scale);
const height = Math.floor(window.innerHeight / scale);

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
canvas.width = width * scale;
canvas.height = height * scale;
var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

const costField = Array.from(Array(height), () => Array.from(Array(width), Math.random));

addEventListener("mousedown", onClick);
addEventListener("mousemove", draw);
addEventListener("keydown", event => {
	switch(event.key) {
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

render(Math.floor(height / 2), Math.floor(width / 2));

function generateImage(){

	if(mode == "COST"){
		for(var i = 0; i < width; i++){
			for(var j = 0; j < height; j++){
				
				var value = 256 * costField[j][i];

				ctx.fillStyle = `rgb(${value},${value},${value}`;
				ctx.fillRect(i * scale, j * scale, scale, scale);
			}
		}
	}else if(mode == "TOTAL_COST"){
		for(var i = 0; i < width; i++){
			for(var j = 0; j < height; j++){
				
				var value = 256 - (cost[i + (j * width)] / max * 256)
			
				ctx.fillStyle = `rgb(${value},${value},${value}`;
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
				ctx.fillStyle = `rgb(${value},${value},${value}`;
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
				ctx.fillStyle = `rgb(${value},${value},${value}`;
				ctx.fillRect(i * scale, j * scale, scale, scale);
			}
		}
	}

	imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

}

function draw(event){
	ctx.putImageData(imgData, 0, 0);
    var rect = canvas.getBoundingClientRect();
	var r = Math.floor((event.clientY - rect.top) / scale);
	var c = Math.floor(event.clientX / scale);

	ctx.fillStyle = "rgb(255, 255, 255)";

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
	let start = Date.now();
	const r = height;
	const c = width;
	
	ready = [{ id: iStart * c + jStart, cost: 0 }];
	cost = [];
	cost[iStart * c + jStart] = 0;
	instruction = [];
	
	while(ready.length){
		const min = ready.reduce(
			(min, x, index) => x.cost < min.cost ? {index, cost: x.cost, id: x.id} : min, { cost: Infinity });

		ready[min.index] = ready[ready.length - 1];
		ready.pop();
		
		const cR = Math.floor(min.id / c);
		const cC = min.id % c;

		DIRECTIONS.forEach(d => {
			const norm = (Math.abs(d.r) + Math.abs(d.c)) == 1 ? 1 : Math.sqrt(2);
			if(cR + d.r > -1 && cR + d.r < r && cC + d.c > -1 && cC + d.c < c){
				addInstruction((cR + d.r) * c + cC + d.c, min.cost + (norm * costField[cR + d.r][cC + d.c]), min.id);
			}
		});
		
		max = min.cost;
	}
	generateImage();
	console.log(Date.now() - start);
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
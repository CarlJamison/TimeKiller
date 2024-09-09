var instruction = [];
var cost = [];
var paths = [];
var max = 0.0;
var paths = [];
var mode = "q";
const DIRECTIONS = [{r: -1, c: 0}, {r: -1, c: 1}, {r: 0, c: 1}, {r: 1, c: 1}, 
	{r: 1, c: 0}, {r: 1, c: -1}, {r: 0, c: -1}, {r: -1, c: -1}];

const canvas = document.getElementById("myCanvas");
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
const imgData = ctx.getImageData(0, 0, width, height);
const buf = new Uint32Array(imgData.data.buffer);

const costField = Array.from(Array(height * width), Math.random);

addEventListener("mousedown", onClick);
addEventListener("mousemove", draw);
addEventListener("keydown", event => {
	if("qwer".indexOf(event.key) > -1 && mode != event.key){
		mode = event.key;
		generateImage()
	}
});

render(Math.floor(height / 2), Math.floor(width / 2));

function generateImage(){

	if(mode == "q"){
		for(let i = 0; i < height * width; i++){
			var value = Math.floor(256 * costField[i]).toString(16).padStart(2, '0');;
			buf[i] = `0xFF${value}${value}${value}`;
		}
	}else if(mode == "w"){
		for(let i = 0; i < height * width; i++){
			const value = Math.floor(256 - (cost[i] / max * 256)).toString(16).padStart(2, '0');
			buf[i] = `0xFF${value}${value}${value}`;
		}
	}else if(mode == "e"){
		let hitList = Array(width * height).fill(0);
		for(let i = 0; i < width * height; i++){
			for(let nextInstruction = i; nextInstruction = instruction[nextInstruction]; hitList[nextInstruction]++){}
		}

		let maxInst = hitList.reduce((max, h) => max = h > max ? h : max, 0);
		for(let i = 0; i < height * width; i++){
			const value = Math.floor(256 * Math.pow(hitList[i] / maxInst, .2))
				.toString(16).padStart(2, '0');
			buf[i] = `0xFF${value}${value}${value}`;
		}
	}else if(mode == "r"){
		let hitList = Array(width * height).fill(0);
		for(let i = 0; i < width * height; i++){
			for(let nextInstruction = i; nextInstruction = instruction[nextInstruction]; hitList[nextInstruction]++){}
		}

		let maxInst = hitList.reduce((max, h) => max = h > max ? h : max, 0);
		for(let i = 0; i < height * width; i++){
			const raw = 256 * Math.sqrt(hitList[i] / maxInst) + (256 - (cost[i] / max * 256))
			const value = Math.floor(Math.min(255, raw)).toString(16).padStart(2, '0');
			buf[i] = `0xFF${value}${value}${value}`;
		}
	}

	ctx.putImageData(imgData,0,0);
}

function draw(event){
	ctx.putImageData(imgData,0,0);
    var rect = canvas.getBoundingClientRect();
	var r = Math.floor(event.clientY - rect.top);
	var c = Math.floor(event.clientX);

	ctx.fillStyle = "rgb(255, 255, 255)";

	var instCoord = (r * width) + c;
	while(instruction[instCoord]){
		var col = instCoord % width;
		var row = Math.floor(instCoord / width);

		ctx.fillRect(col, row, 1, 1);
		instCoord = instruction[instCoord];
	}
}

function onClick(event){
    var rect = canvas.getBoundingClientRect();
    var y = event.clientY - rect.top;
    var x = event.clientX;
	render(y, x);
}

function render(iStart, jStart){
	let start = Date.now();
	
	ready = [{ id: iStart * width + jStart, cost: 0 }];
	cost = [];
	cost[iStart * width + jStart] = 0;
	instruction = [];
	
	while(ready.length){
		const min = ready.reduce(
			(min, x, index) => x.cost < min.cost ? {index, cost: x.cost, id: x.id} : min, { cost: Infinity });

		ready[min.index] = ready[ready.length - 1];
		ready.pop();
		
		const cR = Math.floor(min.id / width);
		const cC = min.id % width;

		DIRECTIONS.forEach(d => {
			if(cR + d.r > -1 && cR + d.r < height && cC + d.c > -1 && cC + d.c < width){
				let index = (cR + d.r) * width + cC + d.c;
				let norm = (Math.abs(d.r) + Math.abs(d.c)) == 1 ? 1 : Math.sqrt(2);
				addInstruction(index, min.cost + (norm * costField[index]), min.id);
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
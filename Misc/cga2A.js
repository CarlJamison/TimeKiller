var instruction = [];
var cost = [];
var paths = [];
var max = 0.0;
var paths = [];
var mode = "w";
const DIRECTIONS = [{r: -1, c: 0}, {r: -1, c: 1}, {r: 0, c: 1}, {r: 1, c: 1}, 
	{r: 1, c: 0}, {r: 1, c: -1}, {r: 0, c: -1}, {r: -1, c: -1}];

const canvas = document.getElementById("myCanvas");
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;
const boundTop = canvas.getBoundingClientRect().top;
const ctx = canvas.getContext("2d");
ctx.fillStyle = "rgb(255, 255, 255)";
const imgData = ctx.getImageData(0, 0, width, height);
const buf = new Uint32Array(imgData.data.buffer);

const costField = Array.from(Array(height * width), Math.random);

addEventListener("mousedown", e => renderMap(e.clientY - boundTop, e.clientX));
addEventListener("mousemove", draw);
addEventListener("keydown", event => {
	if("qwer".indexOf(event.key) > -1 && mode != event.key){
		mode = event.key;
		generateImage();
	}
});

renderMap(0, 0);

function generateImage(){

	if(mode == "q"){
		costField.forEach((v, i) => render(i, v));
	}else if(mode == "w"){
		cost.forEach((v, i) => render(i, 1 - (v / max)))
	}else if(mode == "e" || mode == "r"){
		let hitList = Array(width * height).fill(0);
		for(let i = 0; i < width * height; i++){
			for(let nextInst = i; nextInst = instruction[nextInst]; hitList[nextInst]++){}
		}

		let maxInst = hitList.reduce((max, h) => max = h > max ? h : max, 0);

		if(mode == "e"){
			hitList.forEach((v, i) => render(i, (v / maxInst) ** .2))
		}else{
			hitList.forEach((v, i) => render(i, Math.min(1, (v / maxInst) ** .5 + 1 - cost[i] / max)));
		}
	}

	ctx.putImageData(imgData,0,0);
}

function render(i, raw){
	let value = Math.floor(256 * raw).toString(16).padStart(2, '0')
	buf[i] = `0xFF${value}${value}${value}`;
}

function draw(event){
	ctx.putImageData(imgData,0,0);

	var instCoord = ((event.clientY - boundTop) * width) + event.clientX;
	while(instCoord = instruction[instCoord]){
		var col = instCoord % width;
		var row = Math.floor(instCoord / width);
		ctx.fillRect(col, row, 1, 1);
	}
}

function renderMap(iStart, jStart){
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
		
		const r = Math.floor(min.id / width);
		const c = min.id % width;

		DIRECTIONS.forEach(d => {
			if(r + d.r > -1 && r + d.r < height && c + d.c > -1 && c + d.c < width){
				let index = (r + d.r) * width + c + d.c;
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
var instruction = [];
var cost = [];
var hitList = [];
var mode = "r";
const DIRECTIONS = [{r: -1, c: 0}, {r: -1, c: 1}, {r: 0, c: 1}, {r: 1, c: 1}, 
	{r: 1, c: 0}, {r: 1, c: -1}, {r: 0, c: -1}, {r: -1, c: -1}]
	.map(d => ({...d, norm: (Math.abs(d.r) + Math.abs(d.c)) == 1 ? 1 : Math.sqrt(2)}));

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
	if("qwer".indexOf(event.key) > -1) mode = event.key;
	generateImage();
});

renderMap(0, 0);

function generateImage(){

	let max = cost.reduce((m, h) => h > m ? h : m, 0);
	if(mode == "q"){
		costField.forEach((v, i) => render(i, v));
	}else if(mode == "w"){
		cost.forEach((v, i) => render(i, 1 - (v / max)))
	}else if(mode == "e"){
		hitList.forEach((v, i) => render(i, (v / (hitList.length - 1)) ** .2))
	}else if(mode == "r"){
		hitList.forEach((v, i) => render(i, Math.min(1, (v / (hitList.length - 1)) ** .5 + 1 - cost[i] / max)));
	}

	ctx.putImageData(imgData,0,0);
}

function render(i, raw){
	let value = Math.floor(256 * raw).toString(16).padStart(2, '0')
	buf[i] = `0xFF${value}${value}${value}`;
}

function draw(event){
	ctx.putImageData(imgData,0,0);

	let instCoord = ((event.clientY - boundTop) * width) + event.clientX;
	while(instCoord = instruction[instCoord]){
		let col = instCoord % width;
		let row = Math.floor(instCoord / width);
		ctx.fillRect(col, row, 1, 1);
	}
}

function renderMap(iStart, jStart){
	let start = Date.now();
	
	const ready = [{ id: iStart * width + jStart, cost: 0 }];
	cost = [];
	cost[iStart * width + jStart] = 0;
	instruction = [];
	hitList = Array(width * height).fill(0);
	
	while(ready.length){
		const min = ready.reduce((min, x) => x.cost < min.cost ? x : min, { cost: Infinity });

		ready[ready.indexOf(min)] = ready[ready.length - 1];
		ready.pop();

		for(let nextInst = min.id; nextInst = instruction[nextInst]; hitList[nextInst]++){}

		const r = Math.floor(min.id / width);
		const c = min.id % width;

		DIRECTIONS.forEach(d => {
			if(r + d.r > -1 && r + d.r < height && c + d.c > -1 && c + d.c < width){
				let index = (r + d.r) * width + c + d.c;
				let newCost = min.cost + (d.norm * costField[index]);

				if(cost[index] == null){
					ready.push({ id: index, cost: newCost });
					instruction[index] = min.id;
					cost[index] = newCost;
				}else if(cost[index] > newCost){
					ready.find(x => x.id == index).cost = newCost;
					instruction[index] = min.id;
					cost[index] = newCost;
				}
			}
		});
	}

	generateImage();
	console.log(Date.now() - start);
}
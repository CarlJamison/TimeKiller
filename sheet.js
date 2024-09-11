const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;
const data = ctx.createImageData(width,height);

const DIRECTIONS = [-width, 1, width, -1];
const ENERGY_GAINED = 10;
const [D, P, H, C, S, X, EMPTY, NO] = 
	Array.from(Array(8), () => ~~(Math.random()*16777215) + 4278190080);
const horcs = [D, P, H, C];
const horc = [];

const horcSheet=new Uint32Array(data.data.buffer);
horcSheet.forEach((_, i) => 
	horcSheet[i] = [0, height - 1].includes(~~(i / width)) || [0, width - 1].includes(i % width) ? NO : EMPTY);
const sheet = Array(height * width);

var mutCount = 0;
var pseudo = 1;

addCreature({pixel: ~~(height / 2) * width + ~~(width / 2), horc: P, energy: 100, age: 0});

window.setInterval(runFrame, 1);
refreshCanvas();

function runFrame(){
	horc.forEach(item => {
		if (item.horc != S && item.horc != P) item.energy -= 0.2;
		if (item.horc == P && item.energy < 20) item.energy += 0.3;
		if (item.horc == S && item.age++ > 10){
			item.horc = P;
			horcSheet[item.pixel] = item.horc;
		}

		if (item.energy <= 0) {
			killCreature(item);
			return;
		}

		let z = true;
		if (z && item.energy >= 20 && item.horc != S) z = reproduce(item);
		if (z && item.horc != P && item.horc != S) z = eat(item);
		if (z && item.horc != P) z = randomMovement(item);
	});	
}

function reproduce(item) {
	if (d = findSurroundingChar(EMPTY, item.pixel)) {

		mutCount = ++mutCount % 4000;
		let newHorc = mutCount ? item.horc : horcs[~~(Math.random() * horcs.length)];
		newHorc = newHorc == P ? S : newHorc;

		item.energy *= 0.375;
		addCreature({pixel: item.pixel + d, horc: newHorc, energy: item.energy, age: 0});
		return false;
	}

	return true;
}

function addCreature(newHorc) {
	horc.push(newHorc);
	sheet[newHorc.pixel] = newHorc;
	horcSheet[newHorc.pixel] = newHorc.horc;
}

function killCreature(killHorc, clear = false) {
	sheet[killHorc.pixel] = null;
	horcSheet[killHorc.pixel] = clear ? EMPTY : X;
	horc[horc.indexOf(killHorc)] = horc[horc.length - 1];
	horc.pop();
}

function eat(item) {
	if (item.horc == D) {
		let d = findSurroundingChar(X, item.pixel);

		if (d) { // if found
			item.energy += 3;
			horcSheet[item.pixel + d] = EMPTY;

			return false;
		}
	}else if(item.horc == H || item.horc == C){
		let vicrow = null;

		if(item.horc == H){
			vicrow = findSurroundingHorc(P, item.pixel); 
		}else if(item.horc == C){
			vicrow = findSurroundingHorc(H, item.pixel); 
		
			if(vicrow == null){
				findSurroundingHorc(D, item.pixel); 
			}
		}

		if (vicrow) { 
			if (vicrow.energy < ENERGY_GAINED || item.horc == C) { 
				item.energy += vicrow.energy * 0.75;
				killCreature(vicrow, true);
			} else { 
				vicrow.energy -= ENERGY_GAINED;
				item.energy += ENERGY_GAINED * 0.75; 
			}
			
			return false;
		}
	}
	return true;
}

function randomMovement(item) {
	pseudo = ++pseudo % 4;
	let d = item.pixel + DIRECTIONS[pseudo];

	if (horcSheet[d] == EMPTY) {
		sheet[item.pixel] = null;
		sheet[d] = item;

		horcSheet[item.pixel] = EMPTY;
		horcSheet[d] = item.horc;
		item.pixel = d;
	}
}

function findSurroundingChar(string, pixel) {
	return DIRECTIONS.find(d => horcSheet[pixel + d] == string);
}

function findSurroundingHorc(string, pixel) {
	let d = findSurroundingChar(string, pixel);
	return d ? sheet[pixel + d] : null;
}

function refreshCanvas(start){
	ctx.putImageData(data,0,0);
	requestAnimationFrame(refreshCanvas);
}
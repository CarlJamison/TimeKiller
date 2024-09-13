const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;
const data = ctx.createImageData(width, height);

const DIRECTIONS = [-width, 1, width, -1];
const findSurroundingChar = (v, p) => DIRECTIONS.find(d => horcSheet[p + d] == v);
const ENERGY_GAINED = 10;
const [D, P, H, C, S, X, EMPTY, NO] = 
	Array.from(Array(8), () => ~~(Math.random()*16777215) + 4278190080);
const horcs = [D, P, H, C];
const horc = [];

const horcSheet = new Uint32Array(data.data.buffer);
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
		if (item.horc != S && item.horc != P) item.energy -= 0.2; //Metabolism
		if (item.horc == P && item.energy < 20) item.energy += 0.3; //Photosynthesis
		if (item.horc == S && item.age++ > 10) horcSheet[item.pixel] = item.horc = P; //Germination
		let z = item.energy <= 0 && killCreature(item); //DEATH
		if (!z && item.energy >= 20 && item.horc != S) z = reproduce(item); //Reproduction
		if (!z && item.horc != P && item.horc != S) z = eat(item); //Eating
		if (!z && item.horc != P) z = randomMovement(item); //Movement
	});	
}

function reproduce(item) {
	if (d = findSurroundingChar(EMPTY, item.pixel)) {

		mutCount = ++mutCount % 4000;
		let newHorc = mutCount ? item.horc : horcs[~~(Math.random() * horcs.length)];
		newHorc = newHorc == P ? S : newHorc;

		item.energy *= 0.375;
		addCreature({pixel: item.pixel + d, horc: newHorc, energy: item.energy, age: 0});
		return true;
	}

	return false;
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
	return true;
}

function eat(item) {

	let h = item.horc;
	if(d = findSurroundingChar(h == D ? X : h == H ? P : H, item.pixel)){

		if(h == D){
			item.energy += 3;
			horcSheet[item.pixel + d] = EMPTY;
		}else{
			let vicrow = sheet[item.pixel + d];
			
			if (vicrow.energy < ENERGY_GAINED || h == C) { 
				item.energy += vicrow.energy * 0.75;
				killCreature(vicrow, true);
			} else { 
				vicrow.energy -= ENERGY_GAINED;
				item.energy += ENERGY_GAINED * 0.75; 
			}
		}

		return true;
	}
	return false;
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

function refreshCanvas(){
	ctx.putImageData(data,0,0);
	requestAnimationFrame(refreshCanvas);
}
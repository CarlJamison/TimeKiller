const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;
const data = ctx.createImageData(width, height);

const DIRECTIONS = [-width, 1, width, -1];
const findSurroundingChar = (v, p) => DIRECTIONS.find(d => horcSheet[p + d] == v);
const [D, P, H, C, S, X, EMPTY, NO] = Array(8).fill().map(() => ~~(Math.random() * 0xFFFFFF) + 0xFF000000);
const horcs = [D, P, H, C];
const horc = [];

const horcSheet = new Uint32Array(data.data.buffer);
horcSheet.forEach((_, i) => 
	horcSheet[i] = [0, height - 1].includes(~~(i / width)) || [0, width - 1].includes(i % width) ? NO : EMPTY);
const sheet = Array(height * width);

var mutCount = pseudo = 0;

addCreature({pixel: ~~(height / 2) * width + ~~(width / 2), horc: P, energy: 500});
window.setInterval(runFrame, 1);

function runFrame(){
	horc.forEach(item => {
		if (item.horc != P) item.energy--; //Metabolism
		if (item.horc == P && item.energy < 100) item.energy += 1.5; //Photosynthesis
		if (item.horc == S && item.energy < 30) horcSheet[item.pixel] = item.horc = P; //Germination
		let z = item.energy <= 0 && killCreature(item); //DEATH
		if (!z && item.energy >= 100 && item.horc != S) z = reproduce(item); //Reproduction
		if (!z && item.horc != P && item.horc != S) z = eat(item); //Eating
		if (!z && item.horc != P) z = randomMovement(item); //Movement
	});	
	
	ctx.putImageData(data,0,0);
}

function reproduce(item) {
	const d = findSurroundingChar(EMPTY, item.pixel)
	if(!d) return false;

	mutCount = ++mutCount % 4000;
	let newHorc = mutCount ? item.horc : horcs[~~(Math.random() * horcs.length)];
	newHorc = newHorc == P ? S : newHorc;

	item.energy *= 0.375;
	addCreature({pixel: item.pixel + d, horc: newHorc, energy: item.energy});
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
	return true;
}

function eat(item) {
	let h = item.horc;
	const d = findSurroundingChar(h == D ? X : h == H ? P : H, item.pixel);
	if (!d) return false;

	if(item.horc == D){
		item.energy += 15;
		horcSheet[item.pixel + d] = EMPTY;
	}else{
		let vicrow = sheet[item.pixel + d];
		let energy = item.horc == C ? vicrow.energy : Math.min(vicrow.energy, 50);
		item.energy += energy * 0.75;
		vicrow.energy -= energy;
		if (vicrow.energy <= 0) killCreature(vicrow, true);
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
const scale = 3;
const EMPTY = ' ';
const horcs = ['D', 'P', 'H', 'C'];
const pallet = [];
[...horcs, 'S', 'X', EMPTY].forEach(h => {
	pallet[h] = '#' + ~~(Math.random()*16777215).toString(16);
	console.log(`%c ${h} `, `background: ${pallet[h]};`);
});	
const DIRECTIONS = [{r: -1, c: 0}, {r: 0, c: 1}, {r: 1, c: 0}, {r: 0, c: -1}];
const ENERGY_GAINED = 10;

var mutCount = 0;
var pseudo = 1;
	
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const width = ~~(window.innerWidth / scale);
const height = ~~(window.innerHeight / scale);
canvas.width = width * scale;
canvas.height = height * scale;

const horcSheet = Array.from(Array(height),  (_,i)  => 
	[0, height - 1].includes(i) ? Array(width).fill('-') : Array.from(Array(width), (_, j) => [0, width - 1].includes(j) ? '-' : EMPTY));
const sheet = Array.from(Array(height),  () => Array(width));
const lastSheet = Array.from(Array(height),  () => Array(width));

const horc = [];
addCreature({row: ~~(height / 2), col: ~~(width / 2), entr: 20, horc: 'P', energy: 100, age: 0});

window.setInterval(runFrame, 1);
refreshCanvas();

function runFrame(){
	horc.forEach(item => {
		if (item.horc != 'S' && item.horc != 'P') item.energy -= 0.2;
		if (item.horc == 'P' && item.energy < 20) item.energy += 0.3;
		if (item.horc == 'S' && item.age++ > 10){
			item.horc = 'P';
			horcSheet[item.row][item.col] = item.horc;
		}

		if (item.energy <= 0) {
			killCreature(item);
			return;
		}

		let z = true;
		if (z && item.energy >= 20 && item.horc != 'S') z = reproduce(item);
		if (z && item.horc != 'P' && item.horc != 'S') z = eat(item);
		if (z && item.horc != 'P') z = randomMovement(item);
	});	
}

function reproduce(item) {
	if (d = findSurroundingChar(EMPTY, item.row, item.col)) {

		mutCount = ++mutCount % 4000;
		let newHorc = mutCount ? item.horc : horcs[~~(Math.random() * horcs.length)];
		newHorc = newHorc == 'P' ? 'S' : newHorc;

		item.energy *= 0.375;
		addCreature({row: item.row + d.r, col: item.col + d.c,
			horc: newHorc, energy: item.energy, age: 0});
		return false;
	}

	return true;
}

function addCreature(newHorc) {
	horc.push(newHorc);
	sheet[newHorc.row][newHorc.col] = newHorc;
	horcSheet[newHorc.row][newHorc.col] = newHorc.horc;
}

function killCreature(killHorc, clear = false) {
	sheet[killHorc.row][killHorc.col] = null;
	horcSheet[killHorc.row][killHorc.col] = clear ? EMPTY : 'X';
	horc[horc.indexOf(killHorc)] = horc[horc.length - 1];
	horc.pop();
}

function eat(item) {
	if (item.horc == 'D') {
		let d = findSurroundingChar('X', item.row, item.col);

		if (d) { // if found
			item.energy += 3;
			horcSheet[item.row + d.r][item.col + d.c] = EMPTY;

			return false;
		}
	}else if(item.horc == 'H' || item.horc == 'C'){
		let vicrow = null;

		if(item.horc == 'H'){
			vicrow = findSurroundingHorc('P', item.row, item.col); 
		}else if(item.horc == 'C'){
			vicrow = findSurroundingHorc('H', item.row, item.col); 
		
			if(vicrow == null){
				findSurroundingHorc('D', item.row, item.col); 
			}
		}

		if (vicrow) { 
			if (vicrow.energy < ENERGY_GAINED || item.horc == 'C') { 
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
	move(item, item.row + DIRECTIONS[pseudo].r, item.col + DIRECTIONS[pseudo].c);
}

function findSurroundingChar(string, row, col) {
	return DIRECTIONS.find(d => horcSheet[row + d.r][col + d.c] == string);
}

function findSurroundingHorc(string, row, column) {
	let d = findSurroundingChar(string, row, column);
	return d ? sheet[row + d.r][column + d.c] : null;
}

function move(item, row, col){
	if (horcSheet[row][col] == EMPTY) {
		sheet[item.row][item.col] = null;
		sheet[row][col] = item;

		horcSheet[item.row][item.col] = EMPTY;
		horcSheet[row][col] = item.horc;
		item.row = row;
		item.col = col;
	}
}

function refreshCanvas(start){
	let lastVal = null;
	
	for(let i = 0; i < height; i++){
		let row = horcSheet[i];
		let lastRow = lastSheet[i];

		for(let j = 0; j < width; j++){
			let value = row[j];
			
			if(value != lastRow[j]){
				if(value != lastVal){
					ctx.fillStyle = pallet[value];
					lastVal = value;
				}
			
				ctx.fillRect(j * scale, i * scale, scale, scale);
				lastRow[j] = value;
			}	
		}
	}
	
	console.log(performance.now() - start);
	requestAnimationFrame(refreshCanvas);
}
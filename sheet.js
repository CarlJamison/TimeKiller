var scale = 4;

var horc = [];
var horcs = ['D', 'S', 'H', 'C'];
var sheet = [];
var pallet = [];	

var mutCount = 0;
var pseudo = 1;
var DECOMPOSERS = true;
var ENERGY_GAINED = 10;

const EMPTY = ' ';

var lastSheet = [];
	
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var width = Math.floor(window.innerWidth / scale);
var height = Math.floor(window.innerHeight / scale);
canvas.width = width * scale;
canvas.height = height * scale;

for(var i = 0; i < height; i++){
	sheet[i] = [];
	lastSheet[i] = [];
}

addCreature({row: Math.floor(height / 2), col: Math.floor(width / 2), entr: 10, lifetime: 500, horc: 'P', metabolism: 0.2, germ: 10, energy: 100, age: 0});

window.setInterval(runFrame, 1);

function runFrame(){
	var startTime = Date.now();
	
	horc = horc.filter(i => !i.deleted);
	horc.forEach(item => {
		if(!item.deleted){
				
			item.age++;
			if (item.horc != 'S')
				item.energy -= item.metabolism;

			if (item.horc == 'P' && item.energy < item.entr)
				item.energy += 0.5;

			if (item.horc == 'S' && item.age > item.germ)
				item.horc = 'P';

			//if (item.energy <= 0 || item.age >= item.lifetime) {
			if (item.energy <= 0) {
				killCreature(item);
				return;
			}

			var z = true;
			if (item.energy >= item.entr && item.horc != 'S')
				z = reproduce(item);

			if (z && item.horc != 'P' && item.horc != 'S')
				z = eat(item);

			if (z && item.horc != 'P')
				randomMovement(item);
		}
	});	
	refreshCanvas();
	
	var totalTime = Date.now() - startTime;
	//console.log("Horc: " + horc.length + "		Speed: " + Math.floor(horc.length * 1000 / totalTime));
}

function reproduce(item) {
	var loc = findSurroundingChar(' ', item.row, item.col);

	if (loc != -1) {
		var rowD = Math.floor(loc / 3 - 1);
		var colD = loc % 3 - 1;
		
		var newHorc = item.horc;
		if (newHorc == 'P') {
			newHorc = 'S';
		}

		// if ((int) (Math.random() * 100 + 1) == 20) {
		if (mutCount == 20) {
			newHorc = horcs[Math.floor(Math.random() * horcs.length)];
		}

		mutCount = ++mutCount % 4000

		item.energy *= 0.375;
		addCreature({row: item.row + rowD, col: item.col + colD, entr: item.entr, lifetime: item.lifetime, horc: newHorc, metabolism: item.metabolism, germ: item.germ, energy: item.energy, age: 0});
		return false;
	}

	return true;
}

function addCreature(newHorc) {
	horc.push(newHorc);
	sheet[newHorc.row][newHorc.col] = newHorc;
}

function killCreature(killHorc, clear = false) {
	if (DECOMPOSERS && !clear) {
		killHorc.horc = 'X';
	} else {
		sheet[killHorc.row][killHorc.col] = null;
	}

	killHorc.deleted = true;
}

function eat(item) {
	if (item.horc == 'D') {
		var loc = findSurroundingChar('X', item.row, item.col);

		if (loc != -1) { // if found
			item.energy += 3;
			var rowD = Math.floor(loc / 3 - 1);
			var colD = loc % 3 - 1;

			sheet[item.row + rowD][item.col + colD] = null;

			return false;
		}
	}else if(item.horc == 'H' || item.horc == 'C'){
		var vicrow = null;

		if(item.horc == 'H'){
			vicrow = findSurroundingHorc('P', item.row, item.col); 
		}else if(item.horc == 'C'){
			vicrow = findSurroundingHorc('H', item.row, item.col); 
		
			if(vicrow == null){
				findSurroundingHorc('D', item.row, item.col); 
			}
		}

		if (vicrow != null) { 
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

	if (pseudo == 0) {
		move(item, item.row - 1, item.col);
	} else if (pseudo == 1) {
		move(item, item.row, item.col + 1);
	} else if (pseudo == 2) {
		move(item, item.row + 1, item.col);
	} else if (pseudo == 3) {
		move(item, item.row, item.col - 1);
	}
}

function findSurroundingChar(string, row, column) {
	if (get(row - 1, column) == string) {
		return 1;
	} else if (get(row, column + 1) == string) {
		return 5;
	} else if (get(row + 1, column) == string) {
		return 7;
	} else if (get(row, column - 1) == string) {
		return 3;
	}
	return -1;
}

function findSurroundingHorc(string, row, column) {
	if (get(row - 1, column) == string) {
		return sheet[row - 1][column];
	} else if (get(row, column + 1) == string) {
		return sheet[row][column + 1];
	} else if (get(row + 1, column) == string) {
		return sheet[row + 1][column];
	} else if (get(row, column - 1) == string) {
		return sheet[row][column - 1];
	}
	return null;
}

function get(row, col){
	//return (row < 0 || row >= height || col < 0 || col >= width) ? '-' : sheet[row][col] ? sheet[row][col].horc : ' ';
	if(row < 0 || row >= height || col < 0 || col >= width){
		return '-';
	}else{
		var item = sheet[row][col];
		return item ? item.horc : ' ';
	}
}

function move(item, row, col){
	if ((get(row, col) == ' ')) {
		sheet[item.row][item.col] = null;
		sheet[row][col] = item;
		item.row = row;
		item.col = col;
		return true;
	}

	return false;
}

function refreshCanvas(){
	var lastVal = null;
	
	for(var i = 0; i < width; i++){
		for(var j = 0; j < height; j++){
			
			var item = sheet[j][i];
			var value = item ? item.horc : EMPTY;
			
			if(value != lastSheet[j][i]){
				if(value != lastVal){
					if(!pallet[value]){
						pallet[value] = "rgb(" + Math.random() * 256 + ", " + Math.random() * 256 + ", " + Math.random() * 256 + ")";
						console.log(`%c ${value} `, `background: ${pallet[value]};`);
					}
					
					ctx.fillStyle = pallet[value];
					lastVal = value;
				}
			
				ctx.fillRect(i * scale, j * scale, scale, scale);
				lastSheet[j][i] = value;
			}	
		}
	}
}
  
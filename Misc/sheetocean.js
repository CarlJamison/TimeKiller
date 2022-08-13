var scale = 5;
var width = 700;
var height = 500;

var horc = [];
var sheet = [];
var pallet = [];	

var pseudo = 1;
var TOTAL_LENGTH = 9;
var known = [];
var answer = [];

var ps = 0;
var cv = 1;
var hb = 2;
var mobile = 3;
var tracking = 4;
var adOFFSET = 5;
var adLENGTH = 3;

var lastSheet = [];
window.onload = function init(){
	
	for(var i = 0; i < Math.pow(2, TOTAL_LENGTH); i++){
		known[i] = [];
		answer[i] = [];
	}
	
	var canvas = document.getElementById("myCanvas");
	width = Math.floor(window.innerWidth / scale);
	height = Math.floor(window.innerHeight / scale);
	canvas.width = width * scale;
	canvas.height = height * scale;
	
	for(var i = 0; i < height; i++){
		sheet[i] = [];
		lastSheet[i] = [];
	}
	
	addCreature({row: Math.floor(height / 2), col: Math.floor(width / 2), entr: 10, lifetime: 50, horc: 'P', metabolism: 0.5, germ: 10, energy: 100, gen: [true]});

	window.setInterval(runFrame, 1);
}

function runFrame(){
	var startTime = Date.now();
	
	horc = horc.filter(i => !i.deleted);
	horc.forEach(item => {
		if(!item.deleted){
			
			item.age++;
			item.energy -= item.metabolism;

			if (item.gen[ps]) {
				item.energy++;
			}

			if (item.energy <= 0 || item.age >= item.lifetime) {
				killCreature(item);
				return;
			}

			var z = true;
			if (item.energy >= item.entr)
				z = reproduce(item);

			if (item.gen[ps])
				return;

			if (z)
				z = eat(item);

			if (z && item.gen[tracking])
				z = track(item);

			if (z && item.gen[mobile])
				randomMovement(item);
			
		}
	});	
	refreshCanvas();
	
	var totalTime = Date.now() - startTime;
	console.log("Horc: " + horc.length + "		Speed: " + Math.floor(horc.length * 1000 / totalTime));
}

function track(item) {
		var range = 5;
		var lS = 0;
		var rS = 0;

		for (var tRange = 1; tRange <= range; tRange++) {
			lS = rS;
			rS = tRange * tRange;

			for (var i = 0 - tRange; i <= tRange; i++) {
				for (var j = 0 - tRange; j <= tRange; j++) {

					// Check if in circle
					var distance = (i * i) + (j * j);
					if (distance <= rS && distance > lS && isEatable(item, crow(item.row + i, item.column + j))) {

						var z = false;

						if (i < 0) {
							z = move(item, item.row - 1, item.column);
						} else if (i > 0) {
							z = move(item, item.row + 1, item.column);
						}

						if (j < 0) {
							if (!z)
								z = move(item, row, item.column - 1);
						} else if (j > 0) {
							if (!z)
								z = move(item, row, item.column + 1);
						}

						return false;
					}
				}
			}
		}

		return true;
	}

function reproduce(item) {
	var loc = findSurroundingChar(' ', item.row, item.col);

	if (loc != -1) {
		var rowD = Math.floor(loc / 3) - 1;
		var colD = loc % 3 - 1;

		var newGen = [];
		for (var i = 0; i < TOTAL_LENGTH; i++) {
			newGen[i] = Math.random() < 0.0001 ? !item.gen[i] : item.gen[i];
		}
		
		item.energy /= 2;
		addCreature({row: item.row + rowD, col: item.col + colD, entr: item.entr, lifetime: item.lifetime, germ: item.germ, energy: item.energy, gen: newGen});
		return false;
	}

	return true;
}

function isEatable(item, horc) {
		if (horc == null) {
			return false;
		}

		if (known[item.value][horc.value]) {
			return answer[item.value][horc.value];
		}

		known[item.value][item.value] = true;

		var enGen = horc.gen;

		if ((item.gen[hb] && enGen[ps]) || (item.gen[cv] && enGen[hb]) || (item.gen[cv] && enGen[cv])) {
			for (var i = 0; i < adLENGTH; i++) {
				if (item.gen[i + adOFFSET] && !enGen[i + adOFFSET]) {
					answer[item.value][horc.value] = true;
					return true;
				}
			}
		}

		answer[item.value][horc.value] = false;

		return false;
	}

function crow(row, col) {
	if (row < 0 || row >= height || col < 0 || col >= width)
		return null;
	return sheet[row][col];
}

function addCreature(newHorc) {
	
	var metabolism = 0.1;
	var value = 0;

	for (var i = 0; i < TOTAL_LENGTH; i++) {
		value *= 2;
		if (newHorc.gen[i]) {
			metabolism += 0.2;
			value++;
		}
	}

	newHorc.value = value;
	newHorc.metabolism = metabolism;
	newHorc.age = 0;
	
	horc.push(newHorc);
	sheet[newHorc.row][newHorc.col] = newHorc;
}

function killCreature(killHorc) {
	sheet[killHorc.row][killHorc.col] = null;
	killHorc.deleted = true;
}

function eat(item) {
	var rO = 0;
	var cO = 0;

	if (isEatable(item, crow(item.row + 1, item.col))) {
		rO = 1;
	} else if (isEatable(item, crow(item.row, item.col + 1))) {
		cO = 1;
	} else if (isEatable(item, crow(item.row - 1, item.col))) {
		rO = -1;
	} else if (isEatable(item, crow(item.row, item.col - 1))) {
		cO = -1;
	} else {
		return true;
	}

	var enemy = crow(item.row + rO, item.col + cO);
	item.energy += enemy.energy;
	killCreature(enemy);
	return false;
}

function randomMovement(item) {
	var random = getPsuedoRandom();

	if (random == 1) {
		move(item, item.row - 1, item.col);
	} else if (random == 2) {
		move(item, item.row, item.col + 1);
	} else if (random == 3) {
		move(item, item.row + 1, item.col);
	} else if (random == 4) {
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

function get(row, col){
	if(row < 0 || row >= height || col < 0 || col >= width){
		return '-';
	}else{
		var item = sheet[row][col];
		return item ? '-' : ' ';
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

function getPsuedoRandom() {
	if (pseudo == 4) {
		pseudo = 1;
	} else {
		pseudo++;
	}

	return pseudo;
}

function refreshCanvas(){
	var ctx = document.getElementById("myCanvas").getContext("2d");
	
	var lastVal = null;
	
	for(var i = 0; i < width; i++){
		for(var j = 0; j < height; j++){
			
			var item = sheet[j][i];
			var value = item ? item.value : ' ';
			
			if(value != lastSheet[j][i]){
				if(value != lastVal){
					if(!pallet[value]){
						pallet[value] = {r: Math.random() * 256, g: Math.random() * 256, b: Math.random() * 256};
					}
					
					var c = pallet[value];
					ctx.fillStyle = "rgb(" + c.r + ", " + c.g + ", " + c.b + ")";
					
					lastVal = value;
				}
			
				ctx.fillRect(i * scale, j * scale, scale, scale);
				lastSheet[j][i] = value;
			}	
		}
	}
}
  
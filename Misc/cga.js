	var width = 150;
	var height = 150;
	
	var r = height;
	var c = width;
	
	var scale = 7;
	
	var canvas = document.getElementById("myCanvas");
	var ctx = canvas.getContext("2d");
	
	var costField = [];
	
	for (var i = 0; i < width; i++) {
		costField[i] = [];
			for (var j = 0; j < height; j++) {
				costField[i][j] = Math.random();
			}
		}
	
	var max = 0.0;
	
	ready = [];
	cost = []
	instruction = [];
	
	var iStart = Math.floor(Math.random() * height);
	var jStart = Math.floor(Math.random() * width);
		
	ready[iStart * c + jStart] = 1;
	var rtc = r * c;
	
	for(var i = 0; i < r; i++) {
		console.log(i);
		for(var iC = 0; iC < c; iC++) {
		
			//Get min
			var minValue = -1.0;
			var min = -1;
			
			for(var j = 0; j < rtc; j++) {
				if(ready[j] == 1 && (cost[j] < minValue || minValue == -1)) {
					min = j;
					minValue = cost[j] ? cost[j] : 0;
				}
			}
			
			ready[min] = 2;
			
			var cR = Math.floor(min / c);
			var cC = min % c;
			
			if(cR > 0) {
				addInstruction((cR - 1) * c + cC, minValue + costField[cR - 1][cC], min, ready, cost, instruction);
			}
			
			if(cR + 1 < r) {
				addInstruction((cR + 1) * c + cC, minValue + costField[cR + 1][cC], min, ready, cost, instruction);
			}
			
			if(cC > 0) {
				addInstruction(cR * c + cC - 1, minValue + costField[cR][cC - 1], min, ready, cost, instruction);
			}
			
			if(cC + 1 < c) {
				addInstruction(cR * c + cC + 1, minValue + costField[cR][cC + 1], min, ready, cost, instruction);
			}
			
			if(cR > 0 && cC > 0) {
				addInstruction((cR - 1) * c + cC - 1, minValue + (Math.sqrt(2) * costField[cR - 1][cC - 1]), min, ready, cost, instruction);
			}
			
			if(cR + 1 < r && cC + 1 < c) {
				addInstruction((cR + 1) * c + cC + 1, minValue + (Math.sqrt(2) * costField[cR + 1][cC + 1]), min, ready, cost, instruction);
			}
			
			if(cR + 1 < r && cC > 0) {
				addInstruction((cR + 1) * c + cC - 1, minValue + (Math.sqrt(2) * costField[cR + 1][cC - 1]), min, ready, cost, instruction);
			}
			
			if(cR > 0 && cC + 1 < c) {
				addInstruction((cR - 1) * c + cC + 1, minValue + (Math.sqrt(2) * costField[cR - 1][cC + 1]), min, ready, cost, instruction);
			}
			
			max = minValue;
		}
	}
	
	for(var i = 0; i < width; i++){
		for(var j = 0; j < height; j++){
			
			var value = cost[i + (j * width)] / max * 256
		
			ctx.fillStyle = "rgb(" + value + ", " + value + ", " + value + ")";
			ctx.fillRect(i * scale, j * scale, scale, scale);
		}
	}
	
	function addInstruction(newVal, currentCost, min, ready, cost, instruction) {
		if(!ready[newVal] || (ready[newVal] == 1 && currentCost < cost[newVal])) {
			ready[newVal] = 1;
			cost[newVal] = currentCost;
			instruction[newVal] = min;
		}
	}
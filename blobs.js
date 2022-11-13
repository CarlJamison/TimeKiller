var scale = 2;
var width = 700;
var height = 500;

var range = 3;
var sheet = [];
var pallet = [];	

var lastSheet = [];
window.onload = () => {
	
	var canvas = document.getElementById("myCanvas");
	width = Math.floor(window.innerWidth / scale) - 3;
	height = Math.floor(window.innerHeight / scale) - 3;
	canvas.width = width * scale;
	canvas.height = height * scale;
	
	for(var i = 0; i < height; i++){
		sheet[i] = [];
		lastSheet[i] = [];
	}

	for(var i = 0; i < height; i++){
		for(var j = 0; j < width; j++){
			sheet[i][j] = Math.floor(Math.random() * range)
		}
	}

	window.setInterval(runFrame, 1);
}

function addPixel(row, col, list){
	if(row >= 0 && row < height && col >= 0 && col < width){
		var val = sheet[row][col];
		list[val] = list[val] ? list[val] + 1 : 1;
	}
}

function runFrame(){

	for(var i = 0; i < 20000; i++){
		var row = Math.floor(Math.random() * height);
		var col = Math.floor(Math.random() * width);

		var surrList = [];
		
		for(var k = -1; k <= 1; k++){
			for(var j = -1; j <= 1; j++){
				//if(k != 0 || j != 0) 
					addPixel(row + k, col + j, surrList);
			}
		}

		if(surrList.length > 1){
			var validList = [];
			var count = 0;
			for(var val in surrList){
				var surrVal = surrList[val];

				if(surrVal > count){
					count = surrVal;
					validList = [val]
				}else if (surrVal == count){
					validList.push(val);
				}
			}

			sheet[row][col] = validList[Math.floor(Math.random() * validList.length)];
		}else{
			for(var val in surrList){
				sheet[row][col] = val;
			}
		}
		
	
	}

	refreshCanvas();
}

function refreshCanvas(){
	var ctx = document.getElementById("myCanvas").getContext("2d");
	
	var lastVal = null;
	
	for(var i = 0; i < width; i++){
		for(var j = 0; j < height; j++){
			
			var value = sheet[j][i];
			
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
  
var scale = 5;
var range = 5;
var sheet = [];	
var pallet = [
	"#f2f6f0",
	"#a4befd",
	"#283dae",
	"#04073d",
	"#929383",
]

var lastSheet = [];
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var width = Math.floor(window.innerWidth / scale) - 3;
var height = Math.floor(window.innerHeight / scale) - 3;
canvas.width = width * scale;
canvas.height = height * scale;

for(var i = 0; i < height; i++){
	lastSheet[i] = [];

	sheet[i] = [];
	for(var j = 0; j < width; j++){
		sheet[i][j] = Math.floor(Math.random() * range)
	}
}

window.setInterval(runFrame, 1);

function addPixel(row, col, list){
	if(row >= 0 && row < height && col >= 0 && col < width)
		list.push(sheet[row][col])
}

function runFrame(){

	for(var i = 0; i < 2000; i++){
		var row = Math.floor(Math.random() * height);
		var col = Math.floor(Math.random() * width);

		var surrList = [];
		for(var k = -1; k <= 1; k++){
			for(var j = -1; j <= 1; j++){
				if(k != 0 || j != 0) 
					addPixel(row + k, col + j, surrList);
			}
		}

		sheet[row][col] = surrList[Math.floor(Math.random() * surrList.length)];
	}

	refreshCanvas();
}

function refreshCanvas(){
	var lastVal = null;
	
	for(var i = 0; i < width; i++){
		for(var j = 0; j < height; j++){
			
			var value = sheet[j][i];
			
			if(value != lastSheet[j][i]){
				if(value != lastVal){
					if(!pallet[value]){
						pallet[value] = "rgb(" + Math.random() * 256 + ", " + Math.random() * 256 + ", " + Math.random() * 256 + ")";
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
  
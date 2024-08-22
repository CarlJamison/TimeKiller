var scale = 2;
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
		sheet[i][j] = Math.floor(Math.random() * pallet.length)
	}
}

window.setInterval(runFrame, 1);
refreshCanvas();

var counter = 0;
function runFrame(){
	for(var i = 0; i < 30000; i++){
		var row = Math.floor(Math.random() * (height - 2)) + 1;
		var col = Math.floor(Math.random() * (width - 2)) + 1;
		
		counter = ++counter % 8;
		var d = [{r: -1, c: 0}, {r: -1, c: 1}, {r: 0, c: 1}, {r: 1, c: 1}, 
			{r: 1, c: 0}, {r: 1, c: -1}, {r: 0, c: -1}, {r: -1, c: -1}][counter]


		sheet[row][col] = sheet[row + d.r][col + d.c];
	}
}

function refreshCanvas(){
	var lastVal = null;
	
	for(var i = 0; i < height; i++){
		var row = sheet[i];
		var lastRow = lastSheet[i];

		for(var j = 0; j < width; j++){
			
			var value = row[j];
			
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
	
	requestAnimationFrame(refreshCanvas);
}
  
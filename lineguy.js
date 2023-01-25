var scale = 1;
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var width = Math.floor(window.innerWidth / scale) - 10;
var height = Math.floor(window.innerHeight / scale) - 10;
var rtod = Math.PI / 180;
canvas.width = width * scale;
canvas.height = height * scale;

ctx.shadowColor = "black";
ctx.shadowBlur = 3;
ctx.lineWidth = 10;
ctx.lineJoin = "round";

var guy = {y: height / 2, x: width / 2};

var la = {l: 55, a: 45, p: guy};
var lf = {l: 60, a: 90, p: la};
la.c = [lf];

var ra = {l: 55, a: 135, p: guy};
var rf = {l: 60, a: 90, p: ra};
ra.c = [rf];

var ab = {l: 100, a: 100, p: guy};
var lt = {l: 75, a: 135, p: ab};
var ll = {l: 75, a: 135, p: lt};
lt.c = [ll];

var rt = {l: 75, a: 135, p: ab};
var rl = {l: 75, a: 135, p: rt};
rt.c = [rl];

var neck = {l: 15, a: -65, p: guy};
var head = {l: 25, a: -65, p: neck, head: true};
neck.c = [head];
ab.c = [lt, rt];
guy.c = [ab, la, ra, neck];

window.setInterval(runFrame, 10);

function renderNode(node){
	if(node.p){
		node.x = node.p.x + (Math.cos(node.a * rtod) * node.l);
		node.y = node.p.y + (Math.sin(node.a * rtod) * node.l);
		
		if(node.head){
			ctx.moveTo(node.x + node.l, node.y);
			ctx.arc(node.x, node.y, node.l, 0, 2 * Math.PI);
		}else{
			ctx.lineTo(node.x, node.y);
		}
	}else{
		ctx.beginPath();
	}

	if(node.c){
		var first = true;
		node.c.forEach(c => {
			if(!first || !node.p){
				ctx.moveTo(node.x, node.y);
			}
			first = false;
			renderNode(c)
		});
	}

	if(node.p){
		ctx.stroke();
	}
}

function getAngle(s, e, d, o = 0){
	var frame = (Date.now() + o) % d;
	var r = (Math.sin(frame * (Math.PI * 2 / d)) + 1) / 2;
	return (e - s) * r + s;
}

function runFrame(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	var d = 1000;
	lt.a = getAngle(30, 130, d);
	la.a = getAngle(150, 45, d);
	lf.a = getAngle(55, -45, d, d / 20);
	ll.a = getAngle(60, 180, d, -d / 10);
	rt.a = getAngle(30, 130, d, d / 2);
	ra.a = getAngle(150, 45, d, d / 2);
	rf.a = getAngle(55, -45, d, d / 2 + d / 20);
	rl.a = getAngle(60, 180, d, d / 2 + -d / 10);
	
	guy.x = (guy.x + 5)  % canvas.width;
	renderNode(guy);
}
  
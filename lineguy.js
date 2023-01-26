var scale = 1;
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var width = Math.floor(window.innerWidth / scale) - 10;
var height = Math.floor(window.innerHeight / scale) - 10;
var rtod = Math.PI / 180;
canvas.width = width * scale;
canvas.height = height * scale;

var standing = {
	lt: 135, la: 135, lf: 90, ll: 90, rt: 45, ra: 45, rf: 90,
	rl: 90, ab: 90, head: -90, neck: -90,
}

var running = true;
var punch = null;

ctx.shadowColor = "black";
ctx.shadowBlur = 2;
ctx.lineWidth = 10;
ctx.lineJoin = "round";
ctx.lineCap = "round";

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

var guyState = { rt, rl, ll, lt, la, lf, ra, rf, head, neck, ab};

var transition = { end: 0 }

window.setInterval(runFrame, 10);
window.addEventListener("keydown", event => {
	
	newTransition = {
		startState: getCurrentState(),
		start: Date.now(),
		end: Date.now() + 200
	}

	switch(event.key) {
		case "a":
			if(running != -1){
				newTransition.endState = getLeftRunningState(200);
				transition = newTransition;
				running = -1;
			}
			break;
		case "s":
			if(running != 0){
				newTransition.endState = standing;
				transition = newTransition;
				running = 0;
			}
			break;
		case "d":
			if(running != 1){
				newTransition.endState = getRunningState(200);
				transition = newTransition;
				running = 1;
			}
			break;
	}
});

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

function getRunningState(o = 0){
	
	var d = 1000;
	return {
		lt: getAngle(30, 130, d, o),
		la: getAngle(150, 45, d, o),
		lf: getAngle(55, -45, d, o + d / 20),
		ll: getAngle(60, 180, d, o + -d / 10),
		rt: getAngle(30, 130, d, o + d / 2),
		ra: getAngle(150, 45, d, o + d / 2),
		rf: getAngle(55, -45, d, o + d / 2 + d / 20),
		rl: getAngle(60, 180, d, o + d / 2 + -d / 10),
		head: -65,
		neck: -65,
		ab: 100
	}
}

function getCurrentState(){
	return  {
		lt: lt.a, la: la.a, lf: lf.a, ll: ll.a, rt: rt.a, ra: ra.a, rf: rf.a,
		rl: rl.a, ab: ab.a, head: head.a, neck: neck.a,
	}
}

function getLeftRunningState(o = 0){
	
	var d = 1000;
	return {
		lt: getAngle(150, 50, d, o),
		la: getAngle(30, 135, d, o),
		lf: getAngle(125, 225, d, o + d / 20),
		ll: getAngle(120, 0, d, o + -d / 10),
		rt: getAngle(150, 50, d, o + d / 2),
		ra: getAngle(30, 135, d, o + d / 2),
		rf: getAngle(125, 225, d, o + d / 2 + d / 20),
		rl: getAngle(120, 0, d, o + d / 2 + -d / 10),
		head: -115,
		neck: -115,
		ab: 80
	}
}

function setState(state){
	Object.keys(state).forEach(k => guyState[k].a = state[k]);
}

function runFrame(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if(running){
		setState(running == 1 ? getRunningState() : getLeftRunningState());
	}else{
		setState(standing);
	}

	guy.x = (guy.x + (5 * running)) % canvas.width;
	if(guy.x < 0){
		guy.x = canvas.width + guy.x;
	}
	
	if(transition.end && Date.now() < transition.end){
		var frame = Date.now() - transition.start;
		var d = transition.end - transition.start;
		var r = Math.sin(frame * Math.PI / 2 / d);

		var coolState = {};

		Object.keys(transition.startState).forEach(k =>
			coolState[k] = (transition.endState[k] - transition.startState[k]) * r + transition.startState[k]
		);

		setState(coolState);
	}

	renderNode(guy);
}
  
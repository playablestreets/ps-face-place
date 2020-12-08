let state = null;
let displayState = {
	currentOrientation: 'protrait',
	previousOrientation: 'portrait',
};
let isPressed = false;

// let polaroidBuffer;
let imgFaceBuffer;
let imgFace;
let imgPlace;
let imgBird;
let bgColor = null;
const bgColors = [
	'#67658c',
	'#e76a54',
	'#76987d',
	'#ffc65d',
	'#5298a4',
	'#89c9d2',
];

let imgPaper = null;

//------------------------------------------------------------------
//GET DYNAMIC DATA
//------------------------------------------------------------------
//CALL PRISMIC API
getFromApi("faces_and_places", dataCallback); //returns to setKidstruments()

const facesAndPlaces = [];
//SET DYNAMIC DATA FROM PRISMIC
function dataCallback(data) {
	// console.log('received ', data.length, ' results' );
	// console.log(data);
	
	const faceAndPlace = {
		uid: null,
		title: null,
		author: null,
		age: null,
		postcode: null,
		face: null,
		place: null,
		bird: null
	}
	
	data.forEach((item) => {
		let newFaceAndPlace = {...faceAndPlace};
		
		newFaceAndPlace.uid = item.uid;
		newFaceAndPlace.title = 	item.data.title[0].text;
		newFaceAndPlace.author = 	item.data.name[0].text;
		newFaceAndPlace.postcode  = 	item.data.postcode;
		newFaceAndPlace.age = item.data.age;
		newFaceAndPlace.face = item.data.face_image.url;
		newFaceAndPlace.place = item.data.place_image.url;
		newFaceAndPlace.bird = item.data.bird.url;
		
		facesAndPlaces.push(newFaceAndPlace);
	});
	
	console.log(facesAndPlaces);

	loadRandomFace();
	loadRandomPlace();
	loadRandomBird();
	setState('ready');
}

function loadRandomFace(){
	const i = int(random(0, facesAndPlaces.length));
	imgFace = loadImage(facesAndPlaces[i].face, ()=>{
		console.log("loaded random face");
		drawToPolaroidBuffer();
		redraw();
	});
}
function loadRandomPlace(){
	const i = int(random(0, facesAndPlaces.length));
	imgPlace = loadImage(facesAndPlaces[i].place, ()=>{
		console.log("loaded random place");
		loadRandomBgColor();
		drawToPolaroidBuffer();
		redraw();
	});
}
function loadRandomBird(){
	const i = int(random(0, facesAndPlaces.length));
	imgBird = loadImage(facesAndPlaces[i].bird, ()=>{
		console.log("loaded random bird");
		redraw();
	});
}
function loadRandomBgColor(){
	const i = int(random(0, bgColors.length));
	bgColor = color(bgColors[i]);
	bgColor.setAlpha(200);
	console.log("loaded random bg color");
	redraw();
}
// function drawFaceToBuffer(){
// 	imgFaceBuffer = createGraphics(windowWidth, windowHeight);
// 	imgFaceBuffer.fill(255);
// 	imgFaceBuffer.stroke(0);

// 	let size = min(width, height);
// 	let faceScale = 0.8;
// 	if(imgFaceBuffer){
// 		imgFaceBuffer.clear();
// 		imgFaceBuffer.push();
// 		imgFaceBuffer.translate(imgFace.width/2, imgFace.height/2,);
// 		imgFaceBuffer.rotate(random(-0.0005, 0.0005));
// 		imgFaceBuffer.translate(-imgFace.width/2, -imgFace.height/2,);

// 		imgFaceBuffer.translate(0, height-size * faceScale);
// 		imgFaceBuffer.translate(random(1.0), random(1.0));
// 		imgFaceBuffer.image(imgFace, 0, 0,  size * faceScale,  size * faceScale);
// 		imgFaceBuffer.pop();
// 		console.log('face drawn to buffer');
// 	}
// }

function drawToPolaroidBuffer(){
	let size = min(width, height);
	polaroidBuffer = createGraphics(size, size);
	polaroidBuffer.fill(255);
	polaroidBuffer.stroke(0);


	// let size = min(width, height);
	let margin = size * 0.1;
	// size = size - 2 * margin;

	polaroidBuffer.push();
	polaroidBuffer.background(255);
	// polaroidBuffer.fill(100);
	polaroidBuffer.noStroke();
	
	// size = min(width, height);
	
	if(imgPlace){
		push();
		// polaroidBuffer.fill(bgColor);
		polaroidBuffer.fill(255);
		// polaroidBuffer.translate(imgPlace.width/2, imgPlace.height/2,);
		// polaroidBuffer.rotate(random(-0.0005, 0.0005));
		// polaroidBuffer.translate(-imgPlace.width/2, -imgPlace.height/2,);
		// polaroidBuffer.translate(width/2 - size/2, height/2 - size/2);
		// polaroidBuffer.translate(random(1.0), random(1.0));
		polaroidBuffer.image(imgPlace, margin, margin*0.5, size-2*margin, size-2*margin);
		
		blendMode(MULTIPLY);
	
		// let bgColor = color(bgColors[0]);
		if(bgColor){
			bgColor.setAlpha(100);
			polaroidBuffer.fill(bgColor);
			polaroidBuffer.rect(margin, margin*0.5, size-2*margin, size-2*margin);
		}
		blendMode(BLEND);
		pop();
	}

	size = min(width, height);
	fill(255);
	let faceScale = 0.6;
	if(imgFace){
		polaroidBuffer.push();
		// translate(imgFace.width/2, imgFace.height/2,);
		// rotate(random(-0.0005, 0.0005));
		// translate(-imgFace.width/2, -imgFace.height/2,);

		// translate(0, height-size * faceScale);
		// translate(random(1.0), random(1.0));
		polaroidBuffer.image(imgFace, 0, size - size * faceScale - margin * 1.5,  size * faceScale,  size * faceScale);
		polaroidBuffer.pop();
	}

	polaroidBuffer.fill(255);
	polaroidBuffer.rect(0,0,margin,height); 

	polaroidBuffer.pop();
}


//------------SETUP------------------------------------------------------------
//------------SETUP------------------------------------------------------------
//------------SETUP------------------------------------------------------------
// let polaroidBuffer;
function setup() {
	setState('loading');
	
	canvas = createCanvas(windowWidth, windowHeight);
	canvas.position(0, 0);
	frameRate(4);
	
	imgPaper = loadImage('./assets/paper.jpg');

	loadRandomBgColor();

	drawToPolaroidBuffer();
	
	setDisplayState();
	textSize(100);
	currentColor = color(255);
}


function setInfoText(text) {
	console.log(text);
	// document.getElementById('info').innerHTML = text;
}


function setState(newState) {
	if(newState != state){
		state = newState;
		
    if (state == 'loading') {
			setInfoText('loading...');
    }
		else if (state == 'ready') {
			setInfoText('READY!');
		}
		
	}
}

//------------UPDATE------------------------------------------------------------
//------------UPDATE------------------------------------------------------------
//------------UPDATE------------------------------------------------------------
function update() {
	// check orientation
  setDisplayState();
}

function setDisplayState() {
	displayState.previousOrientation = displayState.currentOrientation;
	
	if (windowWidth > windowHeight)
	displayState.currentOrientation = 'landscape';
  else
    displayState.currentOrientation = 'portrait';
}


function windowResized(){
	resizeCanvas(windowWidth, windowHeight);
	drawToPolaroidBuffer();
}

//------------DRAW------------------------------------------------------------
//------------DRAW------------------------------------------------------------
//------------DRAW------------------------------------------------------------
function draw() {
	//run update
	update();

	//prepare canvas
	// clear();

	// background(0, 255, 0)
	// background(255, 1);
	background(255, 200);
	fill(255);
	stroke(0);
	
	let size = max(width, height);
	if(imgPaper){
		push();
		translate(imgPaper.width/2, imgPaper.height/2,);
		rotate(random(-0.0005, 0.0005));
		translate(-imgPaper.width/2, -imgPaper.height/2,);
		translate(width/2 - size/2, height/2 - size/2);
		translate(random(1.0), random(1.0));
		image(imgPaper, 0, 0, size, size);
		pop();
		// console.log('yo');
	}
	
	

	

	// background(bgColors[0], 0.5);
	// background('rgba(255,0,0, 0.1)');
	
	// if(imgBird)
	// 	image(imgBird, 0, 0, size, size);
	// push();
	// translate(width/2 - size/2, height/2 - size/2);
	// translate(width/2 - size * 0.2, height - size * 0.8);
	// translate(width/2 - size * 0.2, height - size * 0.8);
	// scale(0.7);
	

	// image(imgFaceBuffer, 0, 0);
	// drawToPolaroidBuffer();
	drawPolaroid();
	// drawPolaroidFrame();
	
	drawTouch();
	if (state === 'loading')  background(0, 0, 0, 50) ;
}


	
function drawPolaroid(){
	if(width > height){
		image(polaroidBuffer, width/2-polaroidBuffer.width/2, 0,  polaroidBuffer.width,  polaroidBuffer.height);
		
	}else{
		image(polaroidBuffer,  0, height/2-polaroidBuffer.height/2,  polaroidBuffer.width,  polaroidBuffer.height);
	}

}

function drawTouch() {
	if (mouseX > 10 && mouseX < width - 10 && (mouseY > 10 && mouseY < height - 10)) {
		let ellipseWidth = mouseIsPressed ? 70 : 0;
		stroke(240, 100);
		strokeWeight(5);
		fill(200, 100);
		ellipse(mouseX, mouseY, ellipseWidth);
	}
}


//------------INTERACTION------------------------------------------------------------
//------------INTERACTION------------------------------------------------------------
//------------INTERACTION------------------------------------------------------------
///ONTOUCH
//todo : this is getting called twice on mouseclicks
function go() {


  if (Tone.context.state != 'running') {
    console.log('starting tone.js');
    Tone.start();
	}

	if(!isPressed){
		(mouseX < width/2 && mouseY > height/2) ? loadRandomFace() : loadRandomPlace();
		isPressed = true;
	}

	redraw();
}


///ON RELEASE
function stop() {
	isPressed = false;
	// redraw();
}

//fuse touches and mouse clicks
function mousePressed() {
	console.log('mouse down');
	go();
}
function touchStarted() {
	console.log('touch down');
	go();
}
function mouseReleased() {
	console.log('mouse released');
	stop();
}
function touchEnded() {
	console.log('touch released');
	stop();
}


// document.getElementById('button-next').onclick = loadNext;
// document.getElementById('button-prev').onclick = loadPrev;
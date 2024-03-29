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
	'#4D48A9',
	'#e76a54',
	'#76987d',
	'#ffc65d',
	'#5298a4',
	'#89c9d2',
];


let imgPaper = null;
let sharpieText = null;
let flashTime;
let flashDuration = 1000;
let developTime;
let developDuration = 3000;
let isDeveloping = true;


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
	
	
	let urlName = getUrlName();
				
	console.log('url name:', urlName);
	let foundIndex;
	if (urlName != '') {
		for (let index = 0; index < facesAndPlaces.length; index++) {
			if (facesAndPlaces[index].uid.toLowerCase() == urlName) {
				foundIndex = index;
				console.log('loading ' + facesAndPlaces[foundIndex].uid);
				break;
			}
		}
	}
	

	if(foundIndex){
		loadFace(foundIndex);
		loadPlace(foundIndex);
		loadBird(foundIndex);
	}else{
		foundIndex = int(random(0, facesAndPlaces.length));
		loadFace(foundIndex);
		foundIndex = int(random(0, facesAndPlaces.length));
		loadPlace(foundIndex);
		foundIndex = int(random(0, facesAndPlaces.length));
		loadBird(foundIndex);
	}
	setState('ready');
}

function loadFace(i){
	imgFace = loadImage(facesAndPlaces[i].face, ()=>{
		console.log("loaded random face");

		if(imgFace && imgPlace){
			developTime = millis();
		}

		drawToPolaroidBuffer();
		redraw();
	});
}

function loadPlace(i){
	// const i = index || int(random(0, facesAndPlaces.length));
	// console.log('found index = ', i);
	imgPlace = loadImage(facesAndPlaces[i].place, ()=>{
		console.log("loaded random place");
		loadRandomBgColor();

		if(imgFace && imgPlace){
			developTime = millis();
		}

		drawToPolaroidBuffer();
		redraw();
	});
}

function loadBird(i){
	// const i = index || int(random(0, facesAndPlaces.length));

	imgBird = loadImage(facesAndPlaces[i].bird, ()=>{
		console.log("loaded random bird");
		redraw();
	});
}
function loadRandomBgColor(){
	const i = int(random(0, bgColors.length));
	bgColor = color(bgColors[i]);
	console.log("loaded random bg color");
	redraw();
}

function drawToPolaroidBuffer(){

	let size = min(width, height);
	polaroidBuffer = createGraphics(size, size);
	polaroidBuffer.fill(255);
	polaroidBuffer.stroke(0);

	let margin = size * 0.1;

	polaroidBuffer.push();
	polaroidBuffer.background(255);
	polaroidBuffer.noStroke();
	
	
	if(imgPlace){
		push();
		
		if(bgColor){
			// blendMode(BURN);
			// bgColor.setAlpha(210);
			polaroidBuffer.fill(bgColor);
			polaroidBuffer.rect(margin, margin*0.5, size-2*margin, size-2*margin);
			// blendMode(BLEND);
		}
		polaroidBuffer.fill(255);
		polaroidBuffer.blend(imgPlace, 0, 0, imgPlace.width, imgPlace.height,  int(margin), int(margin*0.5), int(size-2*margin), int(size-2*margin), MULTIPLY);
		pop();
	}

	size = min(width, height);
	fill(255);
	let faceScale = 0.6;
	if(imgFace){
		polaroidBuffer.push();
		polaroidBuffer.fill(255);
		polaroidBuffer.image(imgFace, 0, size - size * faceScale - margin * 1.5,  size * faceScale,  size * faceScale);
		polaroidBuffer.pop();
	}
	
	let developRamp = map(millis() - developTime, 0, developDuration, 255, 0);
	polaroidBuffer.fill(0, pow(developRamp,1.1));
	polaroidBuffer.rect(margin, margin*0.5, size-2*margin, size-2*margin);

	polaroidBuffer.fill(255);
	polaroidBuffer.rect(0,0,margin,height); 

	polaroidBuffer.pop();
}


//------------SETUP------------------------------------------------------------
//------------SETUP------------------------------------------------------------
//------------SETUP------------------------------------------------------------
// let polaroidBuffer;
// function preload(){
// 	sharpieFont = loadFont('assets/inconsolata.otf');
// }

function setup() {
	setState('loading');
	
	flashTime = millis();

	canvas = createCanvas(windowWidth, windowHeight);
	canvas.position(0, 0);
	frameRate(10);
	
	imgPaper = loadImage('./assets/paper.jpg');
	sharpieText = loadImage('./assets/sharpietext.png');

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

	//if we have rotated, reload the page
	if (displayState.currentOrientation != displayState.previousOrientation)
		reloadPage();

	if(millis() - developTime <= developDuration ){
		drawToPolaroidBuffer();
	}

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
	resizeCanvas(windowWidth, windowHeight);
	canvas.position(0, 0);
	// background(255, 200);
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
	
	drawPolaroid();
	drawFlash();

	if (state === 'loading')  background(0, 0, 0, 50) ;
}


	
function drawPolaroid(){
	push();
	translate(width/2, height/2);
	scale(0.9);
	translate(-width/2, -height/2);
	if(width > height){
		push();
		noStroke();
		fill(50,50);
		translate(5,5);
		rect(width/2-polaroidBuffer.width/2, 0,  polaroidBuffer.width,  polaroidBuffer.height, 5);
		pop();
		image(polaroidBuffer, width/2-polaroidBuffer.width/2, 0,  polaroidBuffer.width,  polaroidBuffer.height);
		// if(sharpieText)
		// 	image(sharpieText, width/2-polaroidBuffer.width*0.25, height/2+polaroidBuffer.height/2-polaroidBuffer.height/8,  polaroidBuffer.width*0.5,  polaroidBuffer.height*0.1);
		}else{
			push();
			noStroke();
			fill(50,50);
			translate(5,5);
			rect(0, height/2-polaroidBuffer.height/2,  polaroidBuffer.width,  polaroidBuffer.height, 5);
			pop();
			image(polaroidBuffer,  0, height/2-polaroidBuffer.height/2,  polaroidBuffer.width,  polaroidBuffer.height);
		}
		if(sharpieText)
			image(sharpieText, width/2-polaroidBuffer.width*0.25, height/2+polaroidBuffer.height/2-polaroidBuffer.height/8,  polaroidBuffer.width*0.5,  polaroidBuffer.height*0.1);
	pop();
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

function drawFlash(){

	let flashRamp = int(map(millis() - flashTime, 0, flashDuration, 255, 0));

	if(flashRamp > 0){
		push();
		noStroke();
		fill(255, pow(flashRamp,1.05));
		rect(0,0,width,height);
		pop();
	}
}


//------------INTERACTION------------------------------------------------------------
//------------INTERACTION------------------------------------------------------------
//------------INTERACTION------------------------------------------------------------
///ONTOUCH
//todo : this is getting called twice on mouseclicks
function go() {

	flashTime = millis();

  if (Tone.context.state != 'running') {
    console.log('starting tone.js');
    Tone.start();
	}

	if(!isPressed){
		if(mouseY > 80){
			reloadPage();
			isPressed = true;
		}
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


function reloadPage(){
	let addr = window.location.href;
  let dest = addr.split('?')[0];
  // let dest = addr;
  // console.log(dest);
  location.replace(dest); //do this instead, naviagting to current instrument

}

// document.getElementById('button-next').onclick = loadNext;
// document.getElementById('button-prev').onclick = loadPrev;
"use strict";
//p5.disableFriendlyErrors = true;

// TODO: add B & W, film grain, jitters, blurred corners.
//A shorthand for use with static functions
const V = p5.Vector;

let gMonster: Monster;

interface AppOptions {
  shouldDrawShadows: boolean;
  shouldDrawSilhoutte: boolean;
}

let defaultAppOptions: AppOptions = {
  shouldDrawShadows: true,
  shouldDrawSilhoutte: true,
};

let appOptions: AppOptions = defaultAppOptions;

let gCanvas; //: Renderer;  //typescript can't find this

function toggleShouldCastShadows() {
  appOptions.shouldDrawShadows = !appOptions.shouldDrawShadows;
}

function toggleShouldDrawSilhoutte() {
  appOptions.shouldDrawSilhoutte = !appOptions.shouldDrawSilhoutte;
}

//------------------------------------------------------------------
// Interactivity
// -----------------------------------------------------------------
function mousePressed() {
  rebuildMonster();
}

function keyPressed() {
  if (key == "s") {
    toggleShouldCastShadows();
  }
  if (key == "o") {
    toggleShouldDrawSilhoutte();
  }
  if (key == " ") {
    gMonster.catchAllTargetWords();
  }
}

//https://github.com/processing/p5.js/wiki/Positioning-your-canvas
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

//------------------------------------------------------------------
// SETUP
// -----------------------------------------------------------------
function setup() {
  gCanvas = createCanvas(windowWidth, windowHeight);
  gCanvas.parent(document.body);
  gCanvas.style("z-index", "-1"); //behind the HTML
  gCanvas.position(0, 0);
  gCanvas.style("display", "block"); // avoids scrollbars

  rebuildMonster();
}

//------------------------------------------------------------------
// UPDATE
// -----------------------------------------------------------------
function update() {
  gMonster.update();
}

//------------------------------------------------------------------
// DRAW
// -----------------------------------------------------------------
function draw() {
  update();
  background(0);
  gMonster.draw();
}

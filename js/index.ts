"use strict";
//p5.disableFriendlyErrors = true;

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
}
//------------------------------------------------------------------
// SETUP
// -----------------------------------------------------------------
function setup() {
  createCanvas(windowWidth, windowHeight);
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

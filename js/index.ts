"use strict";
p5.disableFriendlyErrors = true;
let appOptions: AppOptions = randomAppOptions();

interface AppOptions {
  isMovingStructures: boolean;
}
let defaultAppOptions: AppOptions = {
  isMovingStructures: true
};

function randomAppOptions(): AppOptions {
  return {
    isMovingStructures: randomBoolean()
  };
}

const gNumTentacles = 5;
let gTentacles: Tentacle[] = [];
function collect<T>(n: number, fn: (ix: number) => T): T[] {
  const res = [];
  for (let i = 0; i < n; i++) {
    res.push(fn(i));
  }
  return res;
}
function mouseHasMoved() {
  return dist(pmouseX, pmouseY, mouseX, mouseY) > 4;
}
function makeTargetProvider(phase: number) {
  const perliner = makePerlinNoisePosFn(phase);
  return () => (mouseHasMoved() ? mousePosAsVector() : perliner());
}
function makePerlinNoisePosFn(phase: number) {
  return () =>
    createVector(
      map(
        noise(phase + frameCount / 100),
        0,
        1,
        width / 2 - height * 0.3,
        width / 2 + height * 0.3
      ),
      height * noise(88888 + phase + frameCount / 100)
    );
}
function rebuildTentacles() {
  const baseHue = random(100);
  gTentacles = collect(4, ix => {
    const targetProvider = makeTargetProvider(ix * 1000);
    return new Tentacle(200, height, baseHue, targetProvider);
  });
}
/* ------------------------------------------------------------------
 * SETUP
 */
function setup() {
  createCanvas(windowWidth, windowHeight);
  rebuildTentacles();
}

function update() {
  gTentacles.forEach(t => t.update());
}

/* ---------------------------------------------------------------------------
 * DRAW
 */
function draw() {
  update();
  background(0);
  fill("black");
  noStroke();
  gTentacles.forEach(t => t.draw());
}

function toggleMovingStructures() {
  appOptions.isMovingStructures = !appOptions.isMovingStructures;
}

function mousePressed() {
  rebuildTentacles();
}
function keyPressed() {
  if (key == " ") {
  }
}

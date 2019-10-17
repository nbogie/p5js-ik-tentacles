"use strict";
p5.disableFriendlyErrors = true;

interface AppOptions {
  shouldDrawShadows: boolean;
}

let defaultAppOptions: AppOptions = {
  shouldDrawShadows: true
};

let appOptions: AppOptions = defaultAppOptions;

const gNumTentacles = 5;
let gTentacles: Tentacle[] = [];

const lovecraftQuotes = [
  "It was not meant that we should voyage far",
  "A mountain walked or stumbled",
  "In his house at R'lyeh, dead Cthulu waits dreaming"
];

function randomAppOptions(): AppOptions {
  return {
    shouldDrawShadows: randomBoolean()
  };
}

function mouseHasMoved() {
  return dist(pmouseX, pmouseY, mouseX, mouseY) > 0;
}

function noisyMousePos(phase: number) {
  //undulating attention
  const amp = map(sin(frameCount / 20), -1, 1, 10, 40);

  const offsetX = map(noise(3 * phase + frameCount / 20), 0, 1, -amp, amp);
  const offsetY = map(noise(4 * phase + frameCount / 20), 0, 1, -amp, amp);
  return mousePosAsVector().add(createVector(offsetX, offsetY));
}

function makeTargetProvider(phase: number): TargetProvider {
  ///TODO: never put a target completely out of reach as system stretches
  // out unnaturally, inorganically straight.
  ///Instead if target would be out of reach bring it just within reach, on same line.
  const perliner = makePerlinNoisePosFn(phase);
  return { pos: () => (mouseHasMoved() ? noisyMousePos(phase) : perliner()) };
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
  gTentacles = collect(gNumTentacles, ix => {
    const targetProvider = makeTargetProvider(ix * 1000);
    return new Tentacle(200, height, random(80, 100), baseHue, targetProvider);
  });
}

function toggleShouldCastShadows() {
  appOptions.shouldDrawShadows = !appOptions.shouldDrawShadows;
}

function mousePressed() {
  rebuildTentacles();
}
function keyPressed() {
  if (key == "s") {
    toggleShouldCastShadows();
  }
}
//------------------------------------------------------------------
// SETUP
// -----------------------------------------------------------------
function setup() {
  const myCanvas = createCanvas(windowWidth, windowHeight);
  myCanvas.parent(document.body);
  myCanvas.style("z-index", "-1");
  myCanvas.position(0, 0);

  rebuildTentacles();
}

//------------------------------------------------------------------
// UPDATE
// -----------------------------------------------------------------
function update() {
  gTentacles[0].setNewTargetProvider({ pos: () => getPosOfTargetWord().pos });
  gTentacles.forEach(t => t.update());
}

//------------------------------------------------------------------
// DRAW
// -----------------------------------------------------------------
function draw() {
  update();
  background(0);
  fill("black");
  noStroke();
  gTentacles.forEach(t => t.draw());
  markTargetWord();
}

interface TargetWordPos {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
  pos: p5.Vector;
}
function getTargetWordElem() {
  return document.getElementById("targetword");
}

function getPosOfTargetWord(): TargetWordPos {
  const el = getTargetWordElem();
  const b = el.getBoundingClientRect();
  return {
    left: b.left,
    right: b.right,
    top: b.top,
    bottom: b.bottom,
    width: b.width,
    height: b.height,
    pos: createVector(b.left + b.width / 2, b.top + b.height / 2)
  };
}

function markTargetWord(): void {
  const p: TargetWordPos = getPosOfTargetWord();
  noFill();
  rectMode(CENTER);
  stroke("red");
  rect(p.pos.x, p.pos.y, p.width, p.height);
}

function catchTargetWord(): void {
  getTargetWordElem().style = "visibility:hidden";
}

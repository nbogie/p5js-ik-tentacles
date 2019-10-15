"use strict";
p5.disableFriendlyErrors = true;

interface AppOptions {
  shouldDrawShadows: boolean;
}

let defaultAppOptions: AppOptions = {
  shouldDrawShadows: true
};

let appOptions: AppOptions = defaultAppOptions;

function randomAppOptions(): AppOptions {
  return {
    shouldDrawShadows: randomBoolean()
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
  return dist(pmouseX, pmouseY, mouseX, mouseY) > 0;
}
function noisyMousePos(phase: number) {
  //undulating attention
  const amp = map(sin(frameCount / 20), -1, 1, 10, 40);

  const offsetX = map(noise(3 * phase + frameCount / 20), 0, 1, -amp, amp);
  const offsetY = map(noise(4 * phase + frameCount / 20), 0, 1, -amp, amp);
  return mousePosAsVector().add(createVector(offsetX, offsetY));
}

function makeTargetProvider(phase: number) {
  ///TODO: never put a target completely out of reach as system stretches
  // out unnaturally, inorganically straight.
  ///Instead if target would be out of reach bring it just within reach, on same line.
  const perliner = makePerlinNoisePosFn(phase);
  return () => (mouseHasMoved() ? noisyMousePos(phase) : perliner());
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

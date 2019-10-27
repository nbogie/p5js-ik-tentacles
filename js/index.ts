"use strict";
p5.disableFriendlyErrors = true;

// TODO: add B & W, film grain, jitters, blurred corners.

interface AppOptions {
  shouldDrawShadows: boolean;
}

let defaultAppOptions: AppOptions = {
  shouldDrawShadows: true
};

let appOptions: AppOptions = defaultAppOptions;

const gNumTentacles = 5;
let gTentacles: Tentacle[] = [];
let gCanvas; //: Renderer;  //typescript can't find this

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
  if (key == " ") {
    catchAllTargetWords();
  }
}

function catchAllTargetWords(): void {
  const elemsToCatch: HTMLElement[] = findTargetWords();
  elemsToCatch.forEach((elem, ix) => {
    catchTargetElem(elem, gTentacles[ix]);
  });
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

  rebuildTentacles();
}

//------------------------------------------------------------------
// UPDATE
// -----------------------------------------------------------------
function update() {
  const targetWords: HTMLElement[] = findTargetWords();
  if (keyIsDown(67)) {
    //"c"
    gTentacles[0].setNewTargetProvider({
      pos: () => getPosOfTargetWord(targetWords[0]).pos
    });
  }
  gTentacles.forEach(t => {
    t.update();
    if (t.heldWord) {
      moveHeldWordTo(t.heldWord, t.lastSegment().b);
      rotateHeldWord(t.heldWord.elem, t.lastSegment().getAngle());
    }
  });
}

function rotateHeldWord(elem: HTMLElement, heading: number) {
  elem.style.transform = "rotate(" + degrees(heading + 90) + "deg)";
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

function getPosOfTargetWord(el: Element): TargetWordPos {
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

function moveHeldWordTo(heldWord: HeldDOMWord, newPos: p5.Vector): void {
  const elem = heldWord.elem;
  const boundsInfo = heldWord.originalPosAndBounds;
  boundsInfo.width;
  elem.style.left = newPos.x - boundsInfo.width / 2 + "px";
  elem.style.top = newPos.y - boundsInfo.height / 2 + "px";
}

function findTargetWords(): HTMLElement[] {
  return Array.from(document.getElementsByClassName(
    "wordtoeat"
  ) as HTMLCollectionOf<HTMLElement>);
}

function catchTargetElem(elem: HTMLElement, tentacle: Tentacle): void {
  const targetElem: HTMLElement = elem;
  const clone = targetElem.cloneNode(true) as HTMLElement; //only this has style
  targetElem.style.visibility = "hidden";

  document.body.append(clone);
  clone.classList.add("caught"); //this includes absolute positioning

  tentacle.heldWord = {
    elem: clone,
    originalPosAndBounds: getPosOfTargetWord(clone)
  };
}

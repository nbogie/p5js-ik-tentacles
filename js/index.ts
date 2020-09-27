"use strict";
//p5.disableFriendlyErrors = true;

// TODO: add B & W, film grain, jitters, blurred corners.
//A shorthand for use with static functions
const V = p5.Vector;

interface AppOptions {
  shouldDrawShadows: boolean;
  shouldDrawSilhoutte: boolean;
}

let defaultAppOptions: AppOptions = {
  shouldDrawShadows: true,
  shouldDrawSilhoutte: true,
};

let appOptions: AppOptions = defaultAppOptions;

const gNumTentacles = 5;
let gTentacles: Tentacle[] = [];
let gCanvas; //: Renderer;  //typescript can't find this

const lovecraftQuotes = [
  "It was not meant that we should voyage far",
  "A mountain walked or stumbled",
  "In his house at R'lyeh, dead Cthulu waits dreaming",
];

function mouseHasMoved() {
  return dist(pmouseX, pmouseY, mouseX, mouseY) > 0;
}

function mousePosPlusNoise(phase: number) {
  //undulating attention
  const amp = map(sin(frameCount / 20), -1, 1, 10, 40);

  const offsetX = map(noise(3 * phase + frameCount / 20), 0, 1, -amp, amp);
  const offsetY = map(noise(4 * phase + frameCount / 20), 0, 1, -amp, amp);
  return mousePosAsVector().add(createVector(offsetX, offsetY));
}

//TODO: don't try to have interior segments and the tip all consume by the same
// TargetProvider interface.  TargetProviders for tentacle tips want to consider many other things:
// mouse position, lerping, history, obstacles, user interface
// whereas interior segments just need to know the position of their sibling.
function makeTargetProvider(phase: number): TargetProvider {
  ///TODO: never put a target completely out of reach as system stretches
  // out unnaturally, inorganically straight.
  ///Instead if target would be out of reach bring it just within reach, on same line.
  const perlinNoisePosition = makePerlinNoisePosFn(phase);
  return {
    pos: () =>
      mouseHasMoved() ? mousePosPlusNoise(phase) : perlinNoisePosition(),
  };
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
  gTentacles = collect(gNumTentacles, (ix) => {
    const targetProvider = makeTargetProvider(ix * 1000);
    return new Tentacle(200, height, random(80, 100), baseHue, targetProvider);
  });
}

function toggleShouldCastShadows() {
  appOptions.shouldDrawShadows = !appOptions.shouldDrawShadows;
}

function toggleShouldDrawSilhoutte() {
  appOptions.shouldDrawSilhoutte = !appOptions.shouldDrawSilhoutte;
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
  if (key == "o") {
    toggleShouldDrawSilhoutte();
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
      pos: () => getPosOfTargetWord(targetWords[0]).pos,
    });
  }
  gTentacles.forEach((t) => {
    t.update();
    if (t.heldWord) {
      moveHeldWordTo(t.heldWord, t.lastSegmentTheTip().b);
      rotateHeldWord(t.heldWord.elem, t.lastSegmentTheTip().getAngle());
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
  gTentacles.forEach((t) => t.draw());
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
    pos: createVector(b.left + b.width / 2, b.top + b.height / 2),
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
  const wordElems = document.getElementsByClassName("wordtoeat");
  return Array.from(wordElems as HTMLCollectionOf<HTMLElement>);
}

function makeAnimatingTargetProvider(startPos: p5.Vector) {
  let isRetreating = true;
  let tgtPos = createVector(random(width * 0.3, width * 0.6), height * 1);
  const animLength = 100;
  let animFrameCount = 0;

  return {
    pos: () => {
      const currPos = startPos.copy().lerp(tgtPos, animFrameCount / animLength);
      if (isRetreating) {
        if (tgtPos.dist(currPos) < 10) {
          isRetreating = false;
          animFrameCount = 0;
          startPos = tgtPos.copy();
          tgtPos = createVector(random(width * 0.3, width * 0.6), height * 0.3);
        }
      }
      animFrameCount++;
      return currPos;
    },
  };
}

function catchTargetElem(elem: HTMLElement, tentacle: Tentacle): void {
  const targetElem: HTMLElement = elem;
  const clone = targetElem.cloneNode(true) as HTMLElement; //only this has style
  targetElem.style.visibility = "hidden";

  document.body.append(clone);
  clone.classList.add("caught"); //this includes absolute positioning

  gTentacles.forEach((t) => {
    const targetProvider = makeAnimatingTargetProvider(
      t.lastSegmentTheTip().b.copy()
    );
    t.setNewTargetProvider(targetProvider);
  });

  tentacle.heldWord = {
    elem: clone,
    originalPosAndBounds: getPosOfTargetWord(clone),
  };
}

class Monster {
  tentacles: Tentacle[];
  numTentacles: number;

  constructor(numTentacles: number) {
    this.numTentacles = numTentacles;
    this.rebuildTentacles();
  }

  rebuildTentacles() {
    const baseHue = random(100);
    this.tentacles = collect(this.numTentacles, (ix) => {
      const targetProvider = makeTargetProvider(ix * 1000);
      return new Tentacle(
        200,
        height,
        random(80, 100),
        baseHue,
        targetProvider
      );
    });
  }

  update() {
    this.tentacles.forEach((t) => t.update());
  }

  draw() {
    this.tentacles.forEach((t) => t.draw());
  }
}

function rebuildMonster() {
  gMonster = new Monster(5);
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
